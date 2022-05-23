const amqp = require("amqplib");
const _ = require("lodash");

const queueName = "demo";

let connection;
let model = {
	total: 0,
};

class Queue {
	constructor() {
		this.queue = [];
		this.lock = false;
	}

	enqueue(item) {
		return this.queue.unshift(item);
	}

	dequeue() {
		return this.queue.pop();
	}

	peek() {
		return this.queue[this.length - 1];
	}

	get length() {
		return this.queue.length;
	}

	isEmpty() {
		return this.queue.length === 0;
	}
}

const queue = new Queue();

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

const connectRabbitMQ = async () => {
	try {
		connection = await amqp.connect("amqp://172.17.0.3:5672");
		console.log("connect to RabbitMQ success");
		const channel = await connection.createChannel();
		await channel.assertQueue(queueName);
		await channel.consume(queueName, async (message) => {
			// await sleep(_.random(200, 1000))
			queue.enqueue(message.content.toString());
			channel.ack(message);
		});
	} catch (err) {
		console.error(err);
		setTimeout(connectRabbitMQ, 10000);
	}
};

const prize_infos = [
	{
		card_id,
	},
	{
		card_id,
	},
	{
		card_id,
	},
];

connectRabbitMQ();

setInterval(async () => {
	if (!queue.isEmpty() && !queue.lock) {
		queue.lock = true;
		const message = queue.dequeue();
		await sleep(_.random(10, 100));
		console.log(`🚀 ~ file: receiver.js ~ line 65 ~ message`, message);
		queue.lock = false;
	}
}, 0.0001);
