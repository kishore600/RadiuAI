const express = require("express");
const retail_market_intelligence_model = require("./routes/retail_market_intelligence_model.route.js");

const app = express();
const PORT = 5000;

app.use(express.json());

app.use("/analyze", retail_market_intelligence_model);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Analysis endpoint: http://localhost:${PORT}/analyze`);
});
