const Bull = require('bull');
const { emailProcess } = require('../processes/emailprocess');
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

async function sendNewEmail(data) {
    console.log(data);
    emailQueue.add(data, {
        attempts: 5,
        delay: 5000,
        repeat: {
            every: 1000,
            limit: 5
        }
    });
};

module.exports.sendNewEmail = sendNewEmail;
module.exports.bullBoardRouter = router;

