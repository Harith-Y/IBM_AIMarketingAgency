const express = require("express");
const axios = require("axios");
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors()); 

// Helper to generate random metrics
function generateMetrics() {
  return {
    openRate: Math.round(Math.random() * 20 + 65),
    clickThroughRate: Math.round(Math.random() * 8 + 12),
    conversionRate: Math.round(Math.random() * 5 + 8),
  };
}

// Helper to build prompts for A/B
function buildPrompt(request, version) {
  const { tone, brandName, audienceCategory, audienceType, minAge, maxAge } = request;
  if (version === 'A') {
    return `Create a ${tone.toLowerCase()} marketing campaign for ${brandName}. Target audience: ${audienceCategory}, ${audienceType}, ages ${minAge}-${maxAge}. Version A.`;
  } else {
    return `Write a ${tone.toLowerCase()} promotional message for ${brandName} aimed at ${audienceCategory} (${audienceType}), ages ${minAge}-${maxAge}. Version B.`;
  }
}

app.post("/api/generate", async (req, res) => {
  const request = req.body;

  try {
    // Generate prompts for A and B
    const promptA = buildPrompt(request, 'A');
    const promptB = buildPrompt(request, 'B');

    // Call IBM Granite API for both versions (sequentially for simplicity)
    const [responseA, responseB] = await Promise.all([
      axios.post(
        "https://us-south.ml.cloud.ibm.com/ml/v1-beta/generation/text",
        {
          model_id: "granite-3-2-8b-instruct",
          input: promptA,
          parameters: { temperature: 0.7, max_new_tokens: 300 },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.IBM_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      ),
      axios.post(
        "https://us-south.ml.cloud.ibm.com/ml/v1-beta/generation/text",
        {
          model_id: "granite-3-2-8b-instruct",
          input: promptB,
          parameters: { temperature: 0.7, max_new_tokens: 300 },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.IBM_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      ),
    ]);

    // Extract generated text
    const contentA = responseA.data.generated_text || "No result";
    const contentB = responseB.data.generated_text || "No result";

    // Build response in frontend-expected format
    const versionA = {
      title: `${request.tone} ${request.brandName} Campaign - Version A`,
      content: contentA,
      metrics: generateMetrics(),
    };
    const versionB = {
      title: `${request.tone} ${request.brandName} Campaign - Version B`,
      content: contentB,
      metrics: generateMetrics(),
    };

    res.json({ versionA, versionB });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Error generating content" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Granite API server running on port ${PORT}`));
