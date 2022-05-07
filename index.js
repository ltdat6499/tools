const fs = require("fs");
const crypto = require("crypto");
const { V4 } = require("paseto");
const _ = require("lodash");
const { round } = require("lodash");

const [algorithm, secretKey, totalBytes] = fs
	.readFileSync("./keys/crypto.key", "utf8")
	.split(/\r?\n/);

const encrypt = (text) => {
	const iv = crypto.randomBytes(parseInt(totalBytes));
	const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
	const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
	return iv.toString("hex") + encrypted.toString("hex");
};

const decrypt = (hash) => {
	const [iv, data] = hash.match(
		new RegExp(`.{1,${parseInt(totalBytes) * 2}}`, "g")
	);

	const decipher = crypto.createDecipheriv(
		algorithm,
		secretKey,
		Buffer.from(iv, "hex")
	);
	const decrpyted = Buffer.concat([
		decipher.update(Buffer.from(data, "hex")),
		decipher.final(),
	]);
	return decrpyted.toString();
};

const sign = async () => {
	const secretKey = fs.readFileSync("./keys/secret.key", "utf8");
	const data = encrypt(JSON.stringify({ id: 1 }));
	const payload = _.chunk(data, round(data.length / 3)).reduce(
		(prev, current, currentIndex) => ({
			...prev,
			[currentIndex]: current.join(""),
		}),
		{}
	);
	try {
		return await V4.sign(payload, secretKey, {
			expiresIn: "1 hours",
		});
	} catch (error) {
		return null;
	}
};

const verify = async (token) => {
	const publicKey = fs.readFileSync("./keys/public.key", "utf8");
	const payload = await V4.verify(token, publicKey);
	delete payload.iat;
	delete payload.exp;

	let hash = "";
	for (const key in payload) {
		hash += payload[key];
	}

	const data = decrypt(hash);
	return JSON.parse(data);
};