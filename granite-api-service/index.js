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
function buildPrompt(request) {
  const { tone, brandName, audienceCategory, audienceType, minAge, maxAge, productName } = request;
  
  // Determine ad type based on context (you can make this more dynamic)
  const adType = "marketing campaign";
  const platform = "multi-platform"; // You can make this dynamic based on user selection
  
  return `You are an expert marketing copywriter. Create a compelling ${adType} for the following product:

Brand Name: ${brandName}

Product Name: ${productName || 'N/A'}

Campaign Tone: ${tone} (e.g., playful, bold, premium, friendly, inspiring)

Target Audience: ${audienceCategory} (${audienceType})

Age Range: ${minAge}-${maxAge}

Platform: ${platform} (e.g., Instagram, Facebook, Google Ads, LinkedIn)

⚡ Ensure the ad appeals to the specified age group and tone.
⚡ Make the language natural, engaging, and suited for the platform.
⚡ Suggest a CTA (Call to Action).

Generate two variations to enable A/B testing. Label them clearly as "Variation A" and "Variation B". Make sure each response is strictly more than 50 words.`;
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

    const prompt = buildPrompt(request);

    const endpoint = `https://${process.env.REGION}.ml.cloud.ibm.com/ml/v1-beta/generation/text?version=2024-05-29`;

    // Try to find a working model first
    const workingModel = await findWorkingModel(token, endpoint, process.env.IBM_PROJECT_ID, "Test prompt");

    const response = await axios.post(
      endpoint,
      {
        model_id: workingModel,
        input: prompt,
        project_id: process.env.IBM_PROJECT_ID,
        parameters: {
          temperature: 0.8,
          max_new_tokens: 1000, // Increased for two variations
          decoding_method: "sample"
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.results?.[0]?.generated_text || "No content generated";

    // Parse the response to extract both variations
    let contentA = "No content from A";
    let contentB = "No content from B";
    
    if (content) {
      // Try to split by variation labels with more flexible matching
      const variationASplit = content.split(/variation a|version a|variation a:|version a:/i);
      const variationBSplit = content.split(/variation b|version b|variation b:|version b:/i);
      
      if (variationASplit.length > 1 && variationBSplit.length > 1) {
        // Extract content between variations
        const fullContent = variationASplit[1];
        const bSplit = fullContent.split(/variation b|version b|variation b:|version b:/i);
        contentA = bSplit[0].trim();
        contentB = bSplit[1] ? bSplit[1].trim() : "No content from B";
      } else {
        // If we can't parse variations, split the content in half
        const lines = content.split('\n').filter(line => line.trim() !== '');
        const midPoint = Math.floor(lines.length / 2);
        contentA = lines.slice(0, midPoint).join('\n').trim();
        contentB = lines.slice(midPoint).join('\n').trim();
        
        // If splitting resulted in empty content, use the full content for both
        if (!contentA || !contentB) {
          contentA = content;
          contentB = content;
        }
      }
    }

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
      modelUsed: workingModel,
      rawResponse: content // Include raw response for debugging
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