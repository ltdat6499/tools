require("dotenv").config();
const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const { bearerToken } = require("koa-bearer-token");
const routers = require("./routers");

const app = new Koa();
app
	.use(
		bodyParser({
			enableTypes: ["json"],
			extendTypes: ["application/json"],
			onerror: (__, ctx) => {
				ctx.throw(422, "Body parse error");
			},
		})
	)
	.use(
		bearerToken({
			queryKey: "token",
			headerKey: "Bearer",
		})
	)
	.use(routers());

app.listen(parseInt(process.env.APP_PORT), process.env.APP_HOST, () => {
	console.info(
		`API Server started at: http://%s:%d`,
		process.env.APP_HOST,
		process.env.APP_PORT
	);
});
