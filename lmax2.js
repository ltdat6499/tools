const { Disruptor } = require("shared-memory-disruptor");
const d = new Disruptor("/example", 1000, 4, 1, 0, false, true); //
async function test() {
	let sum = 0,
		i = 0;
	while (i < 1000000) {
		const { bufs } = await d.consumeNew(); //
		for (let buf of bufs) {
			for (let j = 0; j < buf.length; j += 4) {
				sum += buf.readUInt32LE(j, true);
				i += 1;
			}
		}
		d.consumeCommit(); //
	}
	console.log(sum);
}
test();
