const fs = require("fs");
const path = require("path");
const combineRouters = require("koa-combine-routers");
const { createPermissionsByRouters } = require("../controllers");

const basename = path.basename(__filename);
const routers = [];

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
		routers.push(require(path.join(__dirname, file)));
	});

for (const group of routers) {
	for (const router of group.stack) {
		router.stack.unshift(async (ctx, next) => {
			
			await next();
		});
	}
}
createPermissionsByRouters(routers);

module.exports = combineRouters(routers);
