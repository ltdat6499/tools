const { Disruptor } = require("shared-memory-disruptor");
const d = new Disruptor("/example", 1000, 4, 1, -1, true, true); //
async function test() {
	let sum = 0;
	for (let i = 0; i < 1000000; i += 1) {
		const n = Math.floor(Math.random() * 100);
		const { buf } = await d.produceClaim(); //
		buf.writeUInt32LE(n, 0, true);
		await d.produceCommit(); //
		sum += n;
	}
	console.log(sum);
}
test();
