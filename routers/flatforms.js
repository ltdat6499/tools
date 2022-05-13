const Router = require("koa-router");
const { Flatform } = require("../databases");

const router = new Router();

router.get("/v1/flatforms", async (ctx) => {});

router.get("/v1/flatforms/:id", async (ctx) => {});

router.post("/v1/flatforms", async (ctx) => {});

router.put("/v1/flatforms/:id", async (ctx) => {});

module.exports = router;
