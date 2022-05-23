const fs = require("fs");
const eventStream = require("event-stream");
const moment = require("moment");
const axios = require("axios");
const { round } = require("lodash");

const url = "http://localhost:4000";

const token =
	"eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTgsImlhdCI6MTY1MzMwMDMxMiwiZXhwIjoxNjUzOTA1MTEyfQ.bBpIRqHwfU-ywocVpMwENUrS18uS0PHDzn94lIEqlkuHV2L9nHl2oOuHcPWC3vCUjGLi_fwTz7kPPQ7PTAlrTw";

axios.defaults.headers.common = {
	Authorization: "Bearer " + token,
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
let startedAt = moment();
(() => {
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
})();

setInterval(async () => {
	if (!queue.isEmpty()) {
		let input = queue.dequeueByLength(1);
		try {
			axios.post(url + "/v2/import-code", {
				// codes: input.map((item) => ({
				// 	// season_id: 12,
				// 	// product_id: 1,
				// 	// codes: item,
				// 	// quantity: 1,
				// })),
                codes: input.map((item) => item)
			});
		} catch (error) {
			fs.appendFileSync("./errors.txt", `${input}\n`);
		}
		delete input;
		console.log(round(moment().diff(startedAt) / 1000, 2));
	}
}, 1000);
