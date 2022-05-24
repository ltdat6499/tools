const fs = require("fs");
const eventStream = require("event-stream");
const moment = require("moment");
const axios = require("axios");
const { round } = require("lodash");

const url = "https://lubrytics.com:8443/poca-admin-panel-api";

const token =
	"eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTgsImlhdCI6MTY1MzM1Nzc5MiwiZXhwIjoxNjUzOTYyNTkyfQ.tzO1OWlM5HIUmM1VuymJLbQRAkRLVMv_H7RoADTE-W_66LpPvnhlQZmLsSSfuq2Mbc-iRq5XgNso1JSablwekA";

axios.defaults.headers.common = {
	Authorization: "Bearer " + token,
};

const sleep = async (ms) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
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
let readAll = false;
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
			readAll = true;
		});
})();

setInterval(async () => {
	if (!queue.isEmpty() && !queue.lock) {
		queue.lock = true;
		let input = queue.dequeueByLength(300);
		queue.lock = false;
		try {
			await axios.post(url + "/v1/import-code", {
				codes: input.map((item) => ({
					season_id: 12,
					product_id: 1,
					code: item,
					quantity: 1,
				})),
			});
		} catch (error) {
			fs.appendFileSync("./errors.txt", `${input}\n`);
			queue.enqueue(...input);
			console.log("ERROR, RE-ENQUEUE");

			// queue.lock = true;
			// console.log("SLEEPING FOR 1 MINUTE");
			// await sleep(60000);
			// queue.lock = false;
		}
		delete input;
		console.log(round(moment().diff(startedAt) / 1000, 2));
	}
}, 1);

// setInterval(async () => {
// 	if (!queue.isEmpty() && !queue.lock) {
// 		queue.lock = true;
// 		let input = queue.dequeueByLength(3000);
// 		try {
// 			await axios.post(url + "/v1/import-code", {
// 				codes: input.map((item) => ({
// 					season_id: 12,
// 					product_id: 1,
// 					code: item,
// 					quantity: 1,
// 				})),
// 			});
// 		} catch (error) {
// 			fs.appendFileSync("./errors.txt", `${input}\n`);
// 			queue.enqueue(...input);
// 			console.log("ERROR, RE-ENQUEUE");
// 		}
// 		queue.lock = false;
// 		delete input;
// 		console.log(round(moment().diff(startedAt) / 1000, 2));
// 	}
// }, 1000);

setInterval(() => {
	if (readAll && queue.isEmpty()) {
		console.log("DONE");
	}
}, 1000);
