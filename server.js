require('dotenv').config();
const express = require('express');
const ViberBot = require('viber-bot').Bot;
const BotEvents = require('viber-bot').Events;
const TextMessage = require('viber-bot').Message.Text;
const ngrok = require('./get_public_url');
const app = express();



function say(response, message) {
    response.send(new TextMessage(message));
}

function sendResponseBack(botResponse, text_received) {
    let sender_name = botResponse.userProfile.name;
    let sender_id = botResponse.userProfile.id;

    if (text_received === '') {
        say(botResponse, 'I need a Text to check');
        return;
    }

    console.log(text_received);
    botResponse.send(new TextMessage(text_received));
}

const bot = new ViberBot({
    authToken: process.env.ACCESS_TOKEN,
    name: "samik shk",
    avatar: "https://developers.viber.com/docs/img/stickers/40122.png"
});

app.post('/sendViberMessage', (req, res) => {
    const receiverId = req.body.receiverId;
    const text = req.body.text;

    sendViberMessage(receiverId, text)
        .then(() => res.json({
            message: 'Message sent successfully!'
        }))
        .catch(() => res.status(500).json({
            error: 'Error sending message'
        }));
});

function sendViberMessage(receiverId, text) {
    return new Promise((resolve, reject) => {
        request.post({
                url: 'https://chatapi.viber.com/pa/send_message',
                headers: {
                    'X-Viber-Auth-Token': process.env.ACCESS_TOKEN,
                },
                json: {
                    receiver: receiverId,
                    type: 'text',
                    text: text,
                    webhook: WEBHOOK_URL,
                },
            },
            (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    console.log('Message sent successfully');
                    resolve();
                } else {
                    console.error('Error sending message:', body);
                    reject();
                }
            }
        );
    });
}




// bot.onSubscribe(response => console.log(`Subscribed: ${response.userProfile.name}`));


bot.on(BotEvents.SUBSCRIBED, (response) => {
    console.log("subscribed" + response);

})

bot.on(BotEvents.UNSUBSCRIBED, (userId) => {
    console.log(`Unsubscribed: ${userId}`);
});

bot.on(BotEvents.MESSAGE_RECEIVED, (message, response) => {

    console.log("Received message:", message, "response>>>>", response);
    sendResponseBack(response, message.text);
});

// bot.onTextMessage(/./, (message, response) => {
//     sendResponseBack(response, message.text);
// });


bot.onTextMessage(/^hi|hello$/i, (message, response) => {
    console.log("this is message", message);
    response.send(new TextMessage(`Hi there ${response.userProfile.name}. I am ${bot.name}`));
});

// Bot profile 
bot.getBotProfile().then(response => console.log(`Bot Named: ${response.name}`));

app.use('/viber/webhook', bot.middleware());

// Server setup
if (process.env.EXPOSE_URL) {
    const port = process.env.PORT || 5000;

    app.listen(port, () => {
        bot.setWebhook(`${process.env.EXPOSE_URL}/viber/webhook`);
        console.log(`Server is running on ${process.env.EXPOSE_URL}`);
    });
}