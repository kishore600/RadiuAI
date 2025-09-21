const express = require("express");
const analyze_model_py = require("./routes/python.AImodel.route.js");
const cors = require("cors");
require('dotenv').config();
const app = express();
const PORT = 5000;

app.use(cors({ origin: "*", credentials: true }));


app.use(express.json());

app.use("/analyze", analyze_model_py);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Analysis endpoint: http://localhost:${PORT}/analyze`);
});
