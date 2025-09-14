const express = require("express");
const router = express.Router();
const { market_opportunity_score } = require("../controllers/market_opportunity_score.controller.js");
const { retail_market_intelligence_model } = require("../controllers/retail_market_intelligence_model.controller.js");

router.post("/market_opportunity_score", market_opportunity_score);
router.get("/retail_market_intelligence_model", retail_market_intelligence_model);

module.exports = router;
