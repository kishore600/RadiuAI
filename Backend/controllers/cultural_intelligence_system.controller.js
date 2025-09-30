// controllers/culturalIntelligence.controller.js
const { spawn } = require("child_process");
const path = require("path");

const cultural_intelligence_system = (req, res) => {
  const { lat, lon, business_type, focus, target_audience } = req.body;

  // Validate required fields
  if (
    lat === undefined ||
    lon === undefined ||
    !business_type ||
    !focus ||
    !target_audience
  ) {
    return res.status(400).json({
      error: "Invalid parameters",
      message:
        "lat, lon, business_type, focus, and target_audience are required",
    });
  }

  const scriptPath = path.join(
    __dirname,
    "../../Model_gendration/Cultural Intelligence System/cultural_intelligence_system.py"
  );

  const pythonProcess = spawn("python", [scriptPath]);

  let data = "";
  let errorData = "";

  // Send request JSON to Python stdin
  pythonProcess.stdin.write(
    JSON.stringify({
      lat,
      lon,
      business_type,
      focus,
      target_audience,
    })
  );
  pythonProcess.stdin.end();

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

      if (result.error) {
        return res.status(500).json({
          error: "Analysis failed",
          details: result.error,
          raw: data,
        });
      }

      res.json(result);
    } catch (e) {
      console.error("Error parsing Python output:", e.message);
      res.status(500).json({
        error: "Invalid JSON from Python",
        details: e.message,
        raw: data,
        stderr: errorData,
      });
    }
  });

  pythonProcess.on("error", (err) => {
    console.error("Failed to start Python process:", err);
    res.status(500).json({
      error: "Failed to start analysis process",
      details: err.message,
    });
  });
};

module.exports = {cultural_intelligence_system}
