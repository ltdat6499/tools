const fs = require("fs");
const path = require("path");

const basename = path.basename(__filename);
let middlewares = {};

fs.readdirSync(__dirname)
	.filter((file) => {
		return (
			file.indexOf(".") !== 0 &&
			file !== basename &&
			file.slice(-3) === ".js" &&
			file !== "helpers.js"
		);
	})
	.forEach((file) => {
		middlewares = { ...middlewares, ...require(path.join(__dirname, file)) };
	});

module.exports = middlewares;
