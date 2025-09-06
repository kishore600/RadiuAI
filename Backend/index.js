const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const app = express();
const PORT = 5000;

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/analyze", (req, res) => {
  // Get parameters from query string
  const lat = parseFloat(req.query.lat) || 40.7128;
  const lon = parseFloat(req.query.lon) || -74.0060;
  const businessType = req.query.businessType || "supermarket";
  const radiusKm = parseFloat(req.query.radiusKm) || 2;

  // Validate parameters
  if (isNaN(lat) || isNaN(lon) || isNaN(radiusKm)) {
    return res.status(400).json({ 
      error: "Invalid parameters", 
      message: "Latitude, longitude, and radius must be valid numbers" 
    });
  }

  const pythonProcess = spawn("python", [
    '../Model_gendration/Retail Market Intelligence Model/runner.py',
    lat.toString(),
    lon.toString(),
    businessType,
    radiusKm.toString()
  ]);

  let data = "";
  let errorData = "";

  pythonProcess.stdout.on("data", (chunk) => {
    data += chunk.toString();
  });

  pythonProcess.stderr.on("data", (err) => {
    errorData += err.toString();
    console.error("Python error:", err.toString());
  });

  pythonProcess.on("close", (code) => {
    try {
      if (code !== 0) {
        throw new Error(`Python process exited with code ${code}`);
      }
      
      const result = JSON.parse(data);
      
      // Check if the Python script returned an error
      if (result.error) {
        return res.status(500).json({ 
          error: "Analysis failed", 
          details: result.error,
          raw: data
        });
      }
      
      res.json(result);
    } catch (e) {
      console.error("Error parsing Python output:", e.message);
      res.status(500).json({ 
        error: "Invalid JSON from Python", 
        details: e.message,
        raw: data,
        stderr: errorData
      });
    }
  });

  // Handle process errors
  pythonProcess.on("error", (err) => {
    console.error("Failed to start Python process:", err);
    res.status(500).json({ 
      error: "Failed to start analysis process", 
      details: err.message 
    });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Analysis endpoint: http://localhost:${PORT}/analyze`);
});