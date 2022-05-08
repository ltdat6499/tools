const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const bcrypt = require("bcrypt");

const { sign, verify } = require("./keys");

const app = new Koa();
const router = new Router();

const user = {
	id: 1,
	username: "admin",
	password: bcrypt.hashSync("123456a@", 5),
	status: "active",
	data: "SECRET RESOURCE",
	refreshToken: "",
};

router.post("/signin", async (ctx) => {
	// validate
	// transform
	// check username, password
	// check user
	// check available

	const accessToken = await sign(user.id);
	const refreshToken = await sign(user.id, "refresh");

    // 1 device
	user.refreshToken = refreshToken;
    
    /*
    
    multi device:
    user.refreshToken[device] = refreshToken
    
    */

	ctx.body = {
		accessToken,
		refreshToken,
		user: {
			id: user.id,
			data: user.data,
		},
	};
});

router.post("/token", async (ctx) => {
	// validate
	// transform
	const { refreshToken, username } = ctx.request.body;
	// check username, refreshToken
	// check user
	// check available
	// check invalid refresh token
	const accessToken = await sign(user.id);
	ctx.body = accessToken;
});

router.post("/token/reject", async (ctx) => {
	// validate
	// transform
	const { refreshToken } = ctx.request.body;
	// check refreshToken
	// find user
	user.refreshToken = "";
	ctx.status = 204;
});

router.post("/signout", async (ctx) => {
	// check accessToken
	// find user
	user.refreshToken = "";
	ctx.status = 204;
});

// logger

app.use(async (ctx, next) => {
	await next();
	const responseTime = ctx.response.get("X-Response-Time");
	console.log(`${ctx.method} ${ctx.url} - ${responseTime}`);
});

// x-response-time

app.use(async (ctx, next) => {
	const start = Date.now();
	await next();
	const ms = Date.now() - start;
	ctx.set("X-Response-Time", `${ms}ms`);
});

// response

app.use(
	bodyParser({
		jsonLimit: "50mb",
		enableTypes: ["json"],
		extendTypes: ["application/json"],
		onerror: (__, ctx) => {
			ctx.throw(422, "Body parse error");
		},
	})
);

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
