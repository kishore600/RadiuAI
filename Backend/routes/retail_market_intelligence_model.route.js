const express = require("express");
const router = express.Router();

router.get("/retail_market_intelligence_model", runAnalysis);

module.exports = router;
