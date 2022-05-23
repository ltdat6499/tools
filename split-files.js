const fs = require("fs");
const eventStream = require("event-stream");

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

	dequeueByLength(length = 1) {
		return this.queue.splice(-length);
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

fs.createReadStream("./codes.txt")
	.pipe(eventStream.split("\n"))
	.pipe(
		eventStream.mapSync((code) => {
			queue.enqueue(code);
		})
	)
	.on("error", function () {
		console.log("Error while reading file.");
	})
	.on("end", function () {
		console.log("Read entirefile.");
		console.timeEnd("READ");
	});

let counter = 0;
setInterval(async () => {
	if (!queue.isEmpty() && !queue.lock) {
		queue.lock = true;
		let input = queue.dequeueByLength(4000);
		queue.lock = false;

		console.log(++counter);
		input = input.join(",");
		fs.writeFileSync(`./stores/codes-${counter}.txt`, input);
		delete input;
	}
}, 10);
