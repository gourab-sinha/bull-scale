const Bull = require('bull');
const { emailProcess, emailProcessQueue } = require('../processes/emailprocess');
const { createBullBoard } = require('bull-board')
const { BullAdapter } = require('bull-board/bullAdapter');
const { BullMQAdapter } = require('bull-board/bullMQAdapter');

const emailQueue = new Bull('email', {
    redis: {
        host: '127.0.0.1',
        port: 6379
    }
});

const { router } = createBullBoard([
    new BullAdapter(emailQueue),
]);

emailQueue.process(emailProcess);
emailQueue.process('email-queue', emailProcessQueue)

async function sendNewEmail(data) {
    console.log(data);
    emailQueue.add(data, {
        attempts: 5,
        priority: data.priority,
        delay: 5000

    });
};

async function sendNewEmailInQueue(data) {
    console.log(data, 'email-queue');
    emailQueue.add('email-queue', data, {
        attempts: 5,
    });
};

module.exports.sendNewEmail = sendNewEmail;
module.exports.sendNewEmailInQueue = sendNewEmailInQueue;
module.exports.bullBoardRouter = router;

