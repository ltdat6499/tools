const Router = require("koa-router");
const { Role } = require("../databases");

const router = new Router();

router.get("/v1/roles", async (ctx) => {console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");});

router.get("/v1/roles/:id", async (ctx) => {});

router.post("/v1/roles", async (ctx) => {});

router.put("/v1/roles/:id", async (ctx) => {});

module.exports = router;
