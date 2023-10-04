const request = require("request");

exports.viberbot = async (req, res) => {
    const {
        receiverId,
        text
    } = req.body;

    return sendViberMessage(receiverId, text).then(() => {
        return res.json({
            message: "message sent successfully"
        })
    }).catch(() => {
        return res.json({
            error: "error sending messages"
        })
    })
}

async function sendViberMessage(receiverId, text) {
    return new Promise((resolve, reject) => {
        console.log("hello from fundtion");
        request.post({
                url: 'https://chatapi.viber.com/pa/send_message',
                headers: {
                    'X-Viber-Auth-Token': process.env.ACCESS_TOKEN,
                },
                json: {
                    receiver: receiverId,
                    type: 'text',
                    text: text,
                    webhook: `${process.env.EXPOSE_URL}`,
                },
            },
            (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    console.log('Message sent successfully');
                    resolve();
                } else {
                    console.log("error", error);
                    console.error('Error sending messages:', error);
                    reject();
                }
            }
        );
    });
}