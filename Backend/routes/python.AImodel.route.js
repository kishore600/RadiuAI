const express = require("express");
const router = express.Router();
const { market_opportunity_score } = require("../controllers/market_opportunity_score.controller.js");
const { retail_market_intelligence_model } = require("../controllers/retail_market_intelligence_model.controller.js");
const {cultural_intelligence_system} = require("../controllers/cultural_intelligence_system.controller.js");
const { getBusinessRecommendation } = require("../controllers/business_recommedation.controller.js");

router.post("/market_opportunity_score", market_opportunity_score);
router.get("/retail_market_intelligence_model", retail_market_intelligence_model);
router.post("/cultural_intelligence_system", cultural_intelligence_system);
router.post("/business-recommendation",getBusinessRecommendation);

module.exports = router;
