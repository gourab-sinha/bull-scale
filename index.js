const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { sendNewEmail } = require('./queues/emailqueue');

app.use(bodyParser.json());

app.post('/send-email',async (req, res) => {
    const { message, ...restBody } = req.body;
    console.log(message, restBody ); 
    await sendNewEmail({
        ...restBody,
        html: `<p>${message}</p>`
    });
    res.send({
        status: 'ok'
    });
});

app.listen(5000, () => console.log('App running on port 5000'));