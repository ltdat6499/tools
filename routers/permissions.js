const Router = require("koa-router");
const { Permission } = require("../databases");

const router = new Router();

router.get("/v1/permissions", async (ctx) => {});

router.get("/v1/permissions/:id", async (ctx) => {});

router.post("/v1/permissions", async (ctx) => {});

router.put("/v1/permissions/:id", async (ctx) => {});

module.exports = router;
