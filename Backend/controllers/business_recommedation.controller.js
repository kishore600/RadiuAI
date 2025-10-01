const axios = require("axios");

const getBusinessRecommendation = async (req, res) => {
  try {
    const analysisData = req.body;

    if (!analysisData) {
      return res.status(400).json({ error: "Analysis data is required" });
    }

    // Build the prompt
    const prompt = `
        You are a retail and cultural intelligence expert.
        Based on the following market, cultural, and competition data, give a clear business recommendation
        for whether to invest, expand, or avoid opening a new supermarket in this area.
        Your recommendation should include:
        1. Final recommendation (e.g., "Strong Investment", "Moderate Risk", "Avoid").
        2. Key reasons (traffic, competition, demographics, cultural fit, opportunities).
        3. Practical next steps (differentiation strategy, marketing, menu/offerings).
        Be concise but accurate. Accuracy should be above 90%.

        Here is the analysis data:
        ${JSON.stringify(analysisData, null, 2)}
        `;

    // Call OpenAI API
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a business consultant AI." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 500,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const data = response.data;

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const recommendation =
      data.choices?.[0]?.message?.content || "No recommendation generated.";

    res.json({
      success: true,
      recommendation,
    });
  } catch (error) {
    console.error("Error generating business recommendation:", error);
    res.status(500).json({ error: "Failed to generate recommendation" });
  }
};

module.exports = { getBusinessRecommendation };
