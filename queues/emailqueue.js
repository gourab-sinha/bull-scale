const Bull = require('bull');
const { emailProcess } = require('../processes/emailprocess');

const emailQueue = new Bull('email', {
    redis: {
        host: '127.0.0.1',
        port: 6379
    }
});

emailQueue.process(emailProcess);

async function sendNewEmail(data) {
    console.log(data);
    emailQueue.add(data, {
        attempts: 5,
    });
};

module.exports.sendNewEmail = sendNewEmail;

