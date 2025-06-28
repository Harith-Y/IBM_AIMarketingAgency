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

Generate two unique variations to enable A/B testing. Label them clearly as "Variation A" and "Variation B". Make sure each version is strictly different and more than 50 words.`;
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

  // Try to find variations using different patterns
  const patterns = [
    /variation\s*a[:\s]*([\s\S]*?)(?=variation\s*b[:\s]*)/i,
    /version\s*a[:\s]*([\s\S]*?)(?=version\s*b[:\s]*)/i,
    /a[:\s]*([\s\S]*?)(?=b[:\s]*)/i
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      const contentA = match[1].trim();
      // Find content after "Variation B" or "Version B"
      const afterA = content.substring(match.index + match[0].length);
      const bMatch = afterA.match(/(?:variation\s*b|version\s*b)[:\s]*([\s\S]*)/i);
      const contentB = bMatch ? bMatch[1].trim() : afterA.trim();
      
      if (contentA && contentB && contentA !== contentB) {
        return { contentA, contentB };
      }
    }
  }

  // If no clear variations found, try to split by common separators
  const separators = [
    /\n\s*\n/, // Double newlines
    /\n\s*[-*]\s*\n/, // Lines with dashes or asterisks
    /\n\s*[A-Z][a-z]+:/, // Lines starting with capitalized words followed by colon
  ];

  for (const separator of separators) {
    const parts = content.split(separator).filter(part => part.trim());
    if (parts.length >= 2) {
      const contentA = parts[0].trim();
      const contentB = parts[1].trim();
      
      if (contentA && contentB && contentA !== contentB) {
        return { contentA, contentB };
      }
    }
  }

  // Last resort: split content in half
  const lines = content.split('\n').filter(line => line.trim() !== '');
  const midPoint = Math.floor(lines.length / 2);
  const contentA = lines.slice(0, midPoint).join('\n').trim();
  const contentB = lines.slice(midPoint).join('\n').trim();
  
  // If splitting resulted in empty content, create two different versions
  if (!contentA || !contentB || contentA === contentB) {
    // Create two variations by modifying the content slightly
    const baseContent = contentA || contentB || content;
    const contentA_final = baseContent;
    const contentB_final = baseContent.replace(/\b(amazing|incredible|fantastic|wonderful)\b/gi, 
      (match) => {
        const alternatives = {
          'amazing': 'exceptional',
          'incredible': 'remarkable', 
          'fantastic': 'outstanding',
          'wonderful': 'excellent'
        };
        return alternatives[match.toLowerCase()] || match;
      }
    );
    
    return { 
      contentA: contentA_final, 
      contentB: contentB_final !== contentA_final ? contentB_final : contentA_final + "\n\nAlternative approach: " + baseContent 
    };
  }
  
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
    const workingModel = "ibm/granite-13b-instruct-v2";

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
    const { contentA, contentB } = parseVariations(content);

    // Get estimated metrics for each version
    const [metricsA, metricsB] = await Promise.all([
      getEstimatedMetrics(contentA, token, endpoint, process.env.IBM_PROJECT_ID),
      getEstimatedMetrics(contentB, token, endpoint, process.env.IBM_PROJECT_ID)
    ]);

    res.json({
      versionA: {
        title: `${request.tone} ${request.brandName} Campaign - Version A`,
        content: contentA,
        metrics: metricsA || { openRate: null, clickThroughRate: null, conversionRate: null },
      },
      versionB: {
        title: `${request.tone} ${request.brandName} Campaign - Version B`,
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
  const { text, platforms } = req.body;
  const apiKey = process.env.AYRSHARE_API;

  if (!apiKey) {
    return res.status(500).json({ error: "Ayrshare API key not configured." });
  }
  if (!text || !platforms || !Array.isArray(platforms)) {
    return res.status(400).json({ error: "Missing text or platforms array." });
  }

  try {
    const response = await axios.post(
      "https://api.ayrshare.com/api/post",
      {
        post: text,
        platforms: platforms
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({
      error: err.response?.data?.error || err.message,
      details: err.response?.data || null
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Granite API server running on port ${PORT}`));