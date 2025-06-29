const express = require("express");
const axios = require("axios");
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors()); 

// Helper to generate random metrics
// function generateMetrics() {
//   return {
//     openRate: Math.round(Math.random() * 20 + 65),
//     clickThroughRate: Math.round(Math.random() * 8 + 12),
//     conversionRate: Math.round(Math.random() * 5 + 8),
//   };
// }

// Helper to build prompts for A/B
function buildPrompt(request) {
  const { tone, brandName, audienceCategory, audienceType, minAge, maxAge, productName } = request;
  
  // Determine ad type based on context (you can make this more dynamic)
  const adType = "marketing campaign";
  const platform = "Twitter"; // You can make this dynamic based on user selection
  
  return `You are an expert marketing copywriter. Create two unique compelling ${adType} variations (to enable A/B testing) for the following product:

Brand Name: ${brandName}

Product Name: ${productName || 'N/A'}

Campaign Tone: ${tone}

Target Audience: ${audienceCategory} (${audienceType} Gender)

Age Range: ${minAge}-${maxAge}

Platform: ${platform}

⚡ Ensure the ad appeals to the specified age group and tone.
⚡ Make the language natural, engaging, and suited for the platform.
⚡ Suggest a CTA (Call to Action).

Label them clearly as "Variation A" and "Variation B". Make sure each version is strictly different and more than 50 words.`;
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

// Helper to parse variations from AI response
function parseVariations(content) {
  if (!content) {
    return {
      contentA: "No content from A",
      contentB: "No content from B"
    };
  }

  // Simple and reliable parsing based on "Variation A:" and "Variation B:" patterns
  const variationAPattern = /variation\s+a\s*:\s*([\s\S]*?)(?=variation\s+b\s*:)/i;
  const variationBPattern = /variation\s+b\s*:\s*([\s\S]*)/i;

  const matchA = content.match(variationAPattern);
  const matchB = content.match(variationBPattern);

  let contentA = "No content from A";
  let contentB = "No content from B";

  if (matchA && matchA[1]) {
    contentA = matchA[1].trim();
  }

  if (matchB && matchB[1]) {
    contentB = matchB[1].trim();
  }

  // Remove any remaining "Variation A:" or "Variation B:" prefixes from the content
  contentA = contentA.replace(/^variation\s+a\s*:\s*/i, '').trim();
  contentB = contentB.replace(/^variation\s+b\s*:\s*/i, '').trim();

  // Remove leading and trailing double apostrophes (quotation marks)
  contentA = contentA.replace(/^["""]+|["""]+$/g, '').trim();
  contentB = contentB.replace(/^["""]+|["""]+$/g, '').trim();

  return { contentA, contentB };
}

// Helper to get estimated metrics from IBM model
async function getEstimatedMetrics(content, token, endpoint, projectId) {
  const metricsPrompt = `Given the following marketing campaign content, estimate the following metrics for a typical digital campaign targeting the specified audience: Open Rate (%), Click-Through Rate (%), and Conversion Rate (%).\n\nContent:\n${content}\n\nRespond in JSON format as {\"openRate\": number, \"clickThroughRate\": number, \"conversionRate\": number}.`;

  try {
    const response = await axios.post(
      endpoint,
      {
        model_id: "ibm/granite-3-8b-instruct",
        input: metricsPrompt,
        project_id: projectId,
        parameters: {
          temperature: 0.2,
          max_new_tokens: 100,
          decoding_method: "sample"
        },
        reset: true // Uncomment this if you want to reset the model's context/history because of it's biased responses.
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const text = response.data.results?.[0]?.generated_text || "";
    // Try to parse JSON from the response
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    // Fallback: return null if parsing fails
    return null;
  } catch (err) {
    console.error("Error getting estimated metrics:", err.response?.data || err.message);
    return null;
  }
}

// Updated main generation route
app.post("/api/dashboard/post", async (req, res) => {
  const request = req.body;

  try {
    const token = await getIAMToken();

    const prompt = buildPrompt(request);

    const endpoint = `https://${process.env.REGION}.ml.cloud.ibm.com/ml/v1-beta/generation/text?version=2024-05-29`;

    // Use a fixed model for content generation
    const workingModel = "ibm/granite-3-8b-instruct";

    const response = await axios.post(
      endpoint,
      {
        model_id: workingModel,
        input: prompt,
        project_id: process.env.IBM_PROJECT_ID,
        parameters: {
          temperature: 0,
          max_new_tokens: 2000, // Increased for two variations
          decoding_method: "sample",
          top_p: 1
        },
        reset: true, // Uncomment this if you want to reset the model's context/history because of it's biased responses.
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
    const { contentA, contentB } = parseVariations(content);

    // Get estimated metrics for each version
    const [metricsA, metricsB] = await Promise.all([
      getEstimatedMetrics(contentA, token, endpoint, process.env.IBM_PROJECT_ID),
      getEstimatedMetrics(contentB, token, endpoint, process.env.IBM_PROJECT_ID)
    ]);

    res.json({
      versionA: {
        title: "Variation A",
        content: contentA,
        metrics: metricsA || { openRate: null, clickThroughRate: null, conversionRate: null },
      },
      versionB: {
        title: "Variation B",
        content: contentB,
        metrics: metricsB || { openRate: null, clickThroughRate: null, conversionRate: null },
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

// AYRSHARE POST ENDPOINT
app.post("/api/ayrshare/post", async (req, res) => {
  const { text, platforms, mediaUrls } = req.body;
  const apiKey = process.env.AYRSHARE_API;

  console.log('API Key (first 10 chars):', apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET');
  console.log('Request body:', { text: text?.substring(0, 50) + '...', platforms, mediaUrls });

  if (!apiKey) {
    return res.status(500).json({ error: "Ayrshare API key not configured." });
  }
  if (!text || !platforms || !Array.isArray(platforms)) {
    return res.status(400).json({ error: "Missing text or platforms array." });
  }

  try {
    // Use node-fetch for fetch API
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    
    // Prepare the request body according to Ayrshare API specs
    const requestBody = {
      post: text,
      platforms: platforms
    };

    // Add media URLs if provided
    if (mediaUrls && Array.isArray(mediaUrls) && mediaUrls.length > 0) {
      requestBody.mediaUrls = mediaUrls;
    }

    console.log('Sending request to Ayrshare:', JSON.stringify(requestBody, null, 2));

    const response = await fetch("https://api.ayrshare.com/api/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey.trim()}`, // Trim any whitespace
        "User-Agent": "NodeJS-App/1.0"
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    console.log('Ayrshare response status:', response.status);
    console.log('Ayrshare response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Ayrshare response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      // Handle different error scenarios based on Ayrshare docs
      let errorMessage = "Ayrshare API error";
      
      if (response.status === 403) {
        errorMessage = "Access Denied: Your API key doesn't have permission for this request, or your User Profile might be suspended. Check your Ayrshare dashboard.";
      } else if (response.status === 401) {
        errorMessage = "Unauthorized: Invalid API key. Verify your API key in the Ayrshare dashboard.";
      } else if (response.status === 400) {
        errorMessage = "Bad Request: " + (data.error || data.message || "Invalid request format");
      } else if (response.status === 429) {
        errorMessage = "Rate limit exceeded. Wait before making more requests.";
      }

      return res.status(response.status).json({ 
        error: errorMessage, 
        details: data,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      });
    }

    res.json(data);
  } catch (err) {
    console.error('Ayrshare API error:', err);
    res.status(500).json({
      error: err.message || "Unknown error",
      details: err.toString()
    });
  }
});

// Optional: Add a test endpoint to verify API key
app.get("/api/ayrshare/test", async (req, res) => {
  const apiKey = process.env.AYRSHARE_API;

  if (!apiKey) {
    return res.status(500).json({ error: "Ayrshare API key not configured." });
  }

  try {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    
    const response = await fetch("https://api.ayrshare.com/api/profiles", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: "API key test failed", 
        details: data,
        status: response.status 
      });
    }

    res.json({ 
      message: "API key is valid", 
      profiles: data 
    });
  } catch (err) {
    res.status(500).json({
      error: "Test failed: " + err.message,
      details: err.toString()
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Granite API server running on port ${PORT}`));