const amqp = require("amqplib");

const queue = "demo";

let connection;

const connectRabbitMQ = async () => {
    try {
        connection = await amqp.connect("amqp://172.17.0.3:5672");
        console.log("connect to RabbitMQ success");

        const channel = await connection.createChannel();
        await channel.assertQueue(queue);
        const input = []
        for (let index = 0; index < 1000; index++) {
            input.push(channel.sendToQueue(queue, Buffer(JSON.stringify({
                time: index
            })), {
                persistent: true
            }))
        }

        const data = await Promise.all(input);
    } catch (error) {
        console.error(error);
    }
}

connectRabbitMQ();