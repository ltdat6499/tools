const fs = require("fs");
const Router = require("koa-router");
const { User } = require("../databases");

const router = new Router();

router.get("/v1/users", async (ctx) => {});

router.get("/v1/users/:id", async (ctx) => {});

router.post("/v1/users", async (ctx) => {});

router.put("/v1/users/:id", async (ctx) => {});

module.exports = router;
