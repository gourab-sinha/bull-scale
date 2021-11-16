const bodyParser = require('body-parser');
const { sendNewEmail, bullBoardRouter, sendNewEmailInQueue } = require('./queues/emailqueue');

const express = require('express');
const port = 5000;
const cluster = require('cluster');
const totalCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    console.log(`Number of CPUs is ${totalCPUs}`);
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < totalCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
        console.log("Let's fork another worker!");
        cluster.fork();
    });

} else {
    const app = express();
    console.log(`Worker ${process.pid} started`);
    app.use(express.json());
    app.use('/admin/queues', bullBoardRouter);

    /* app.get('/send-email', async (req, res) => { 
     * for testing load and multiple workers handling produced data.
    */
    app.post('/send-email', async (req, res) => {
        const { message, ...restBody } = req.body;
        // const message = "Welcome to Bull"; 
        // const restBody = {
        //     "to": "lisa@example.com",
        //     "from": "example@example.com",
        //     "subject": "Hell From Bull",
        // };
        console.log(`Worker with ID ${process.pid} is running`);
        if (!restBody.jobType) {
            await sendNewEmail({
                ...restBody,
                html: `<p>${message}</p>`
            });
        } else if (restBody.jobType === 'email') {
            await sendNewEmailInQueue({
                ...restBody,
                html: `<p>${message}</p>`
            });
        }
        
        res.send({
            status: 'ok'
        });
    });

    app.get('/get-email', async (req, res) => {
        const message = "Welcome to Bull"; 
        const restBody = {
            email: 'lisa@example.com'
        };
        console.log(`Process with ${process.pid} is running`);
        await sendNewEmail({
            ...restBody,
            html: `<p>${message}</p>`
        });
        res.send({
            status: 'ok'
        });
    });

    app.listen(port, () => {
        console.log(`App listening on port ${port}`);
    })

}