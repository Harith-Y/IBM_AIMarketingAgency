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
  const { tone, brandName, audienceCategory, audienceType, minAge, maxAge, product, offer, season } = request;
  // Add more creative and distinct instructions for A/B
  if (version === 'A') {
    return `You are a creative marketing copywriter. Write a highly engaging, ${tone.toLowerCase()} campaign for ${brandName} targeting ${audienceCategory} (${audienceType}), ages ${minAge}-${maxAge}. Compose a detailed, multi-paragraph campaign that includes an attention-grabbing hook, a compelling story or scenario, emotional appeal, a unique value proposition, and a strong call to action. Use vivid language, specific examples, and persuasive techniques. Make it suitable for ${season || 'the current season'}. If a product or offer is provided, weave it in: Product: ${product || 'N/A'}, Offer: ${offer || 'N/A'}. Ensure the response is comprehensive and not less than 200 words. Label this as Version A.`;
  } else {
    return `As an expert in persuasive marketing, craft a ${tone.toLowerCase()} promotional message for ${brandName} aimed at ${audienceCategory} (${audienceType}), ages ${minAge}-${maxAge}. Start with a relatable scenario or question, use storytelling, and include a creative twist or surprise. Make it feel fresh and different from typical ads. If a product or offer is provided, integrate it naturally: Product: ${product || 'N/A'}, Offer: ${offer || 'N/A'}. Make it seasonally relevant for ${season || 'the current season'}. Ensure the response is comprehensive and not less than 200 words. Label this as Version B.`;
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

// Array of potential model IDs to try
const POTENTIAL_MODELS = [
  "ibm/granite-13b-instruct-v2",
  "ibm/granite-3-8b-instruct"
];

// Function to test which model works
async function findWorkingModel(token, endpoint, projectId, testPrompt) {
  for (const modelId of POTENTIAL_MODELS) {
    try {
      console.log(`Testing model: ${modelId}`);
      const response = await axios.post(
        endpoint,
        {
          model_id: modelId,
          input: testPrompt,
          project_id: projectId,
          parameters: {
            temperature: 0.7,
            max_new_tokens: 50,
            decoding_method: "sample",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      console.log(`✅ Working model found: ${modelId}`);
      return modelId;
    } catch (error) {
      console.log(`❌ Model ${modelId} failed:`, error.response?.data?.errors?.[0]?.message || error.message);
    }
  }
  throw new Error("No working model found");
}

// Test endpoint to find working model
app.get("/api/test-models", async (req, res) => {
  try {
    const token = await getIAMToken();
    const endpoint = `https://${process.env.REGION}.ml.cloud.ibm.com/ml/v1-beta/generation/text?version=2024-05-29`;
    const testPrompt = "Hello, this is a test.";
    
    const workingModel = await findWorkingModel(token, endpoint, process.env.IBM_PROJECT_ID, testPrompt);
    
    res.json({
      success: true,
      workingModel: workingModel,
      message: `Found working model: ${workingModel}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "No working models found. Please check the available models in your watsonx.ai instance."
    });
  }
});

// Updated main generation route
app.post("/api/dashboard/post", async (req, res) => {
  const request = req.body;

  try {
    const token = await getIAMToken();

    const promptA = buildPrompt(request, "A");
    const promptB = buildPrompt(request, "B");

    const endpoint = `https://${process.env.REGION}.ml.cloud.ibm.com/ml/v1-beta/generation/text?version=2024-05-29`;

    // Try to find a working model first
    const workingModel = await findWorkingModel(token, endpoint, process.env.IBM_PROJECT_ID, "Test prompt");

    const [responseA, responseB] = await Promise.all([
      axios.post(
        endpoint,
        {
          model_id: workingModel,
          input: promptA,
          project_id: process.env.IBM_PROJECT_ID,
          parameters: {
            temperature: 0.8,
            max_new_tokens: 600,
            decoding_method: "sample"
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
          model_id: workingModel,
          input: promptB,
          project_id: process.env.IBM_PROJECT_ID,
          parameters: {
            temperature: 0.8,
            max_new_tokens: 600,
            decoding_method: "sample"
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
      modelUsed: workingModel
    });
  } catch (err) {
    console.error("Full error:", err.response?.data || err.message);
    res.status(500).json({ 
      error: "Error generating content", 
      details: err.message,
      fullError: err.response?.data
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Granite API server running on port ${PORT}`));