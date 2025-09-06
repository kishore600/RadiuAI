const express = require("express");
const router = express.Router();
const { runAnalysis } = require("../controllers/retail_market_intelligence_model.controller.js");

router.get("/retail_market_intelligence_model", runAnalysis);

module.exports = router;
