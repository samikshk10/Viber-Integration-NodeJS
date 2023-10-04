require('dotenv').config();
const express = require('express');
const ViberBot = require('viber-bot').Bot;
const BotEvents = require('viber-bot').Events;
const TextMessage = require('viber-bot').Message.Text;
const ngrok = require('ngrok');
const bodyParser = require('body-parser');
const botRouter = require('./routes/bot.routes');
const app = express();

const bot = new ViberBot({
    authToken: process.env.ACCESS_TOKEN,
    name: "samik shk",
    avatar: "https://developers.viber.com/docs/img/stickers/40122.png"
});

app.use('/viber/webhook', bot.middleware());

app.use(bodyParser.json());

app.use("/", botRouter);

function say(response, message) {
    response.send(new TextMessage(message));
}

function sendResponseBack(botResponse, text_received) {
    let {
        id,
        name
    } = botResponse.userProfile;

    if (text_received === '') {
        say(botResponse, 'I need a Text to check');
        return;
    }

    console.log(text_received);
    botResponse.send(new TextMessage(text_received));
}


bot.onSubscribe(response => console.log(`Subscribed: ${response.userProfile.name}`));


// bot.on(BotEvents.SUBSCRIBED, (response) => {
//     console.log("subscribed" + response);
// })

bot.on(BotEvents.UNSUBSCRIBED, (userId) => {
    console.log(`Unsubscribed: ${userId}`);
});

bot.on(BotEvents.CONVERSATION_STARTED, (userProfile, isSubscribed) => {
    console.log("the conversation is started");
    if (isSubscribed) {
        console.log("the user is already subscribed");
    }

    // console.log("this is userProfile", userProfile);
});


// bot.onTextMessage(/./, (message, response) => {
//     sendResponseBack(response, message.text);
// });

bot.on(BotEvents.MESSAGE_RECEIVED, (message, response) => {

    console.log("Received message:", message, "response>>>>", response);
    sendResponseBack(response, message.text);
});


bot.onTextMessage(/^hi|hello$/i, (message, response) => {
    console.log("this is message", message);
    response.send(new TextMessage(`Hi there ${response.userProfile.name}. I am ${bot.name}`));
});

// Bot profile 
bot.getBotProfile().then(response => console.log(`Bot Named: ${response.name}`));


// Server setup
const startserver = async () => {
    if (process.env.EXPOSE_URL) {
        const port = process.env.NGROK_PORT || 5000;

        app.listen(port, () => {
            bot.setWebhook(`${process.env.EXPOSE_URL}/viber/webhook`);
            console.log(`Server is running on ${process.env.EXPOSE_URL}`);
        });
    }
    // else {
    //     try {
    //         await ngrok.connect(process.env.NGROK_PORT).then(url => {

    //             console.log(url);
    //             bot.setWebhook(`${url}/viber/webhook`);
    //             console.log(`Ngrok URL is ${url}`);
    //         }).catch((err) => console.log(err, "err"));
    //     } catch (err) {
    //         await ngrok.disconnect();
    //     }
    // }
}

startserver();