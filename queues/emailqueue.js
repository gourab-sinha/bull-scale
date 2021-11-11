const Bull = require('bull');
const { emailProcess } = require('../processes/emailprocess');

const emailQueue = new Bull('email', {
    redis: {
        host: '127.0.0.1',
        port: 6379
    }
});

emailQueue.process(emailProcess);

async function sendNewEmail(data)   {
    emailQueue.add(data, {

    });
};

module.exports.sendNewEmail = sendNewEmail;

