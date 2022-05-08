const fs = require("fs");
const crypto = require("crypto");
const { V4 } = require("paseto");
const _ = require("lodash");
const { round } = require("lodash");

const [algorithm, secretKey, totalBytes] = fs
	.readFileSync("/home/ltdat6499/Desktop/tools/keys/crypto.key", "utf8")
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

const sign = async (id, option = "access") => {
	let secretKeyPath = "/home/ltdat6499/Desktop/tools/keys/access.secret.key";
	if (option === "refresh") {
		secretKeyPath = "/home/ltdat6499/Desktop/tools/keys/refresh.secret.key";
	}

	const secretKey = fs.readFileSync(secretKeyPath, "utf8");
	const data = encrypt(JSON.stringify({ id }));
	const payload = _.chunk(data, round(data.length / 3)).reduce(
		(prev, current, currentIndex) => ({
			...prev,
			[currentIndex]: current.join(""),
		}),
		{}
	);
	try {
		let v4Option = {
			expiresIn: "300 seconds",
		};
		if (option === "refresh") {
			v4Option = {
				...v4Option,
				expiresIn: "7 days",
			};
		}
		return await V4.sign(payload, secretKey);
	} catch (error) {
		return null;
	}
};

const verify = async (token, option = "access") => {
	let publicKeyPath = "/home/ltdat6499/Desktop/tools/keys/access.public.key";
	if (option === "refresh") {
		publicKeyPath = "/home/ltdat6499/Desktop/tools/keys/refresh.public.key";
	}
	const publicKey = fs.readFileSync(publicKeyPath, "utf8");
	let payload;
	try {
		payload = await V4.verify(token, publicKey);
	} catch (error) {
		return 400;
	}
	delete payload.iat;
	delete payload.exp;

	let hash = "";
	for (const key in payload) {
		hash += payload[key];
	}

	const data = decrypt(hash);
	return JSON.parse(data);
};

module.exports = {
	sign,
	verify,
};
