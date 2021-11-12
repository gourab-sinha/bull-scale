const bodyParser = require('body-parser');
const { sendNewEmail, bullBoardRouter } = require('./queues/emailqueue');

const express = require('express');
const port = 5000;
const cluster = require('cluster');
const { handleRoutes } = require('./routes');
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
    app.use('/admin/queues', bullBoardRouter);

    /* app.get('/send-email', async (req, res) => { 
     * for testing load and multiple workers handling produced data.
    */
    app.post('/send-email', async (req, res) => {
        const message = "Welcome to Bull"; 
        const restBody = {
            "to": "lisa@example.com",
            "from": "example@example.com",
            "subject": "Hell From Bull",
        };
        console.log(`Worker with ID ${process.pid} is running`);
        await sendNewEmail({
            ...restBody,
            html: `<p>${message}</p>`
        });
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