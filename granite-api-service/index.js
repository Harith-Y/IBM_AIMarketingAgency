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

// Get IAM token from IBM
async function getIAMToken() {
  const params = new URLSearchParams();
  params.append("grant_type", "urn:ibm:params:oauth:grant-type:apikey");
  params.append("apikey", process.env.IBM_API_KEY);

  const response = await axios.post("https://iam.cloud.ibm.com/identity/token", params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return response.data.access_token;
}

// Main generation route
app.post("/api/generate", async (req, res) => {
  const request = req.body;

  try {
    const token = await getIAMToken();

    const promptA = buildPrompt(request, "A");
    const promptB = buildPrompt(request, "B");

    const endpoint = `https://${process.env.REGION}.ml.cloud.ibm.com/ml/v1-beta/generation/text?version=2024-05-29`;

    const model_id = "granite-3-8b-instruct";

    const [responseA, responseB] = await Promise.all([
      axios.post(
        endpoint,
        {
          model_id,
          input: promptA,
          project_id: process.env.IBM_PROJECT_ID,
          parameters: {
            temperature: 0.7,
            max_new_tokens: 300,
            decoding_method: "sample",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      ),
      axios.post(
        endpoint,
        {
          model_id,
          input: promptB,
          project_id: process.env.IBM_PROJECT_ID,
          parameters: {
            temperature: 0.7,
            max_new_tokens: 300,
            decoding_method: "sample",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      ),
    ]);

    const contentA = responseA.data.results?.[0]?.generated_text || "No content from A";
    const contentB = responseB.data.results?.[0]?.generated_text || "No content from B";

    res.json({
      versionA: {
        title: `${request.tone} ${request.brandName} Campaign - Version A`,
        content: contentA,
        metrics: generateMetrics(),
      },
      versionB: {
        title: `${request.tone} ${request.brandName} Campaign - Version B`,
        content: contentB,
        metrics: generateMetrics(),
      },
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Error generating content", details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Granite API server running on port ${PORT}`));
