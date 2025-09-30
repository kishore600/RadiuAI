const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;
const connectDB = require("./config/db.config.js");
const analyze_model_py = require("./routes/python.AImodel.route.js");
const authRoutes = require("./routes/auth.Routes.js");

require('dotenv').config();
connectDB();

app.use(cors({ origin: "*", credentials: true }));

app.use(express.json());

app.use("/analyze", analyze_model_py);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Analysis endpoint: http://localhost:${PORT}/analyze`);
});
