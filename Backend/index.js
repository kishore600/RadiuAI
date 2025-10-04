const express = require("express");
const cors = require("cors");

const app = express();
const connectDB = require("./config/db.config.js");
const analyze_model_py = require("./routes/python.AImodel.route.js");
const authRoutes = require("./routes/auth.Routes.js");
const reportRoutes = require("./routes/report.routes.js");

require("dotenv").config();
connectDB();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// Routes
app.use("/analyze", analyze_model_py);
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);

// Use Render's PORT if available, otherwise fallback to 5000 (for local dev)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Analysis endpoint: http://localhost:${PORT}/analyze`);
});
