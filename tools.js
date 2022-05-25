const fs = require("fs");
const eventStream = require("event-stream");
const moment = require("moment");
const axios = require("axios");
const {
    round,
    padStart
} = require("lodash");

const url = "https://lubrytics.com:8443/poca-admin-panel-api";

const token =
    "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTgsImlhdCI6MTY1MzQ3MTA3OCwiZXhwIjoxNjU0MDc1ODc4fQ.F93r_AEAVOML5uLel66L07fZCoebE6yNuMU4ZJh2__MQAvVeIcegw8RHCch_h3YD0EyZuJ7hr3cYbRm0OyHeQw";

// const url = "http://localhost:4000";
// const token =
//     "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTgsImlhdCI6MTY1MzM3NTMwNSwiZXhwIjoxNjUzOTgwMTA1fQ.dzS5kUeU8GoiuGbA3kgYrqt5x_XtTykaizY71uL_mjKgRboVRK9DUagp6Wc9kCc00ezk0EZbaeE-02kPoWKSGQ";

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

let page = 0;
const size = 50000
setInterval(async () => {
    if (!queue.isEmpty() && !queue.lock && queue.length >= size) {
        queue.lock = true;
        let input = queue.dequeueByLength(size);
        try {
            await axios.post(url + "/v1/test-import-code", {
                season_id: 12,
                product_id: 1,
                quantity: 1,
                codes: input,
                size,
                page,
            });
            delete input;
            fs.appendFileSync("./results.txt", [page, "-", round(moment().diff(startedAt) / 1000, 2), "-", `${round(((page / 800) * 100), 2)}%`].join(" ") + "\n");
            console.log(page, "-", round(moment().diff(startedAt) / 1000, 2), "-", `${round(((page / 800) * 100), 2)}%`);
            page++;
        } catch (error) {
            fs.appendFileSync("./errors.txt", `${input}\n`);
            fs.appendFileSync("./error-pagesize.txt", `${size} ${page}`);
            page++;
            console.log("ERROR");
        }
    }
}, 1000);

setInterval(async () => {
    try {
        const ringReport = await axios.get(url + "/v1/ring-buffer");
        if (!ringReport.data.lock) {
            queue.lock = false;
        }
    } catch (error) {}
}, 2005);

setInterval(() => {
    if (readAll && queue.isEmpty()) {
        console.log("DONE");
    }
}, 1000);