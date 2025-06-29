import React, { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Download, Crown, TrendingUp, Send } from "lucide-react";
import axios from "axios";

const AYRSHARE_URL = import.meta.env.VITE_AYRSHARE_URL;
const API_KEY = import.meta.env.VITE_AYRSHARE_API;
const API_KEYB = import.meta.env.VITE_AYRSHAREB_API;
const MAX_TWITTER_LENGTH = 280;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const OutputSection = ({ content, showToast }) => {
  const [analytics, setAnalytics] = useState({ A: null, B: null });
  const [isPosting, setIsPosting] = useState(false);
  const token = localStorage.getItem("authToken");
  
  const copyToClipboard = async (text, version) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Version ${version} copied to clipboard!`, "success");
    } catch (error) {
      showToast("Failed to copy to clipboard", "error");
    }
  };

  const downloadContent = (text, title) => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast("Content downloaded successfully!", "success");
  };

  const trimTextForTwitter = (text) => {
    if (text.length <= MAX_TWITTER_LENGTH) return text;
    return text.slice(0, MAX_TWITTER_LENGTH - 100) + "...";
  };

  const postToAyrshareA = async (text, version) => {
    try {
      const trimmedText = trimTextForTwitter(text);

      const response = await axios.post(
        `${AYRSHARE_URL}/api/post`,
        {
          post: trimmedText,
          platforms: ["twitter"],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );

      const twitterPost = response.data.postIds.find(
        (post) => post.platform === "twitter"
      );

      if (twitterPost) {
        const twitterId = twitterPost.id;
        const postUrl = twitterPost.postUrl;
        const v_id =
          version === "A" ? content.versionA.v_id : content.versionB.v_id;

        // Send Twitter ID + post URL + version ID to backend
        await axios.post(
          `${API_BASE_URL}/dashboard/twitter/save`,
          {
            twitterId,
            postUrl,
            v_id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return { success: true, version };
      } else {
        return { success: false, version, error: "No Twitter post ID found" };
      }
    } catch (error) {
      return {
        success: false,
        version,
        error: error.response?.data?.error || error.message,
      };
    }
  };

  const postToAyrshareB = async (text, version) => {
    try {
      const trimmedText = trimTextForTwitter(text);

      const response = await axios.post(
        `${AYRSHARE_URL}/api/post`,
        {
          post: trimmedText,
          platforms: ["twitter"],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEYB}`,
          },
        }
      );

      const twitterPost = response.data.postIds.find(
        (post) => post.platform === "twitter"
      );

      if (twitterPost) {
        const twitterId = twitterPost.id;
        const postUrl = twitterPost.postUrl;
        const v_id =
          version === "A" ? content.versionA.v_id : content.versionB.v_id;

        // Send Twitter ID + post URL + version ID to backend
        await axios.post(
          `${API_BASE_URL}/dashboard/twitter/save`,
          {
            twitterId,
            postUrl,
            v_id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return { success: true, version };
      } else {
        return { success: false, version, error: "No Twitter post ID found" };
      }
    } catch (error) {
      return {
        success: false,
        version,
        error: error.response?.data?.error || error.message,
      };
    }
  };

  const postBothVersions = async () => {
    setIsPosting(true);
    
    try {
      // Post Version A to Account A and Version B to Account B simultaneously
      const [resultA, resultB] = await Promise.all([
        postToAyrshareA(content.versionA.content, "A"),
        postToAyrshareB(content.versionB.content, "B"),
      ]);

      // Handle results
      let successCount = 0;
      let messages = [];

      if (resultA.success) {
        successCount++;
        messages.push(`Version A posted to Account A successfully`);
      } else {
        messages.push(`Version A failed: ${resultA.error}`);
      }

      if (resultB.success) {
        successCount++;
        messages.push(`Version B posted to Account B successfully`);
      } else {
        messages.push(`Version B failed: ${resultB.error}`);
      }

      // Show appropriate toast message
      if (successCount === 2) {
        showToast("Both versions posted and saved successfully!", "success");
      } else if (successCount === 1) {
        showToast(
          `Partial success: ${messages.join(". ")}`,
          "warning"
        );
      } else {
        showToast(
          `Both versions failed: ${messages.join(". ")}`,
          "error"
        );
      }
    } catch (error) {
      showToast("Failed to post both versions", "error");
    } finally {
      setIsPosting(false);
    }
  };

  const fetchAnalytics = async (twitterId, version) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/dashboard/twitter/analytics/${twitterId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAnalytics((prev) => ({ ...prev, [version]: response.data }));
      showToast(`Analytics for Version ${version} fetched`, "success");
    } catch (error) {
      showToast(
        `Failed to fetch analytics for Version ${version}: ${
          error.response?.data?.error || error.message
        }`,
        "error"
      );
    }
  };

  const getBestPerformer = () => {
    const aTotal =
      content.versionA.metrics.openRate +
      content.versionA.metrics.clickThroughRate +
      content.versionA.metrics.conversionRate;
    const bTotal =
      content.versionB.metrics.openRate +
      content.versionB.metrics.clickThroughRate +
      content.versionB.metrics.conversionRate;
    return aTotal > bTotal ? "A" : "B";
  };

  const bestVersion = getBestPerformer();

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between">
        <motion.h3
          className="text-xl font-semibold text-white flex items-center space-x-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Generated Content
          </span>
        </motion.h3>
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-sm rounded-full border border-emerald-500/30" />
          <div className="relative px-4 py-2 flex items-center space-x-2">
            <Crown className="h-4 w-4 text-yellow-400" />
            <span className="text-emerald-200 text-sm font-semibold">
              Best Performer: Version {bestVersion}
            </span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Version A */}
        {["A", "B"].map((ver) => {
          const data = content[`version${ver}`];
          const gradient =
            ver === "A"
              ? "from-blue-500/20 to-cyan-500/20"
              : "from-purple-500/20 to-pink-500/20";
          const textColor = ver === "A" ? "text-blue-200" : "text-purple-200";
          const titleGradient =
            ver === "A"
              ? "from-cyan-400 to-blue-400"
              : "from-purple-400 to-pink-400";

          return (
            <motion.div
              key={ver}
              className={`relative transition-all duration-500 ${
                bestVersion === ver ? "scale-105" : ""
              }`}
              initial={{ opacity: 0, x: ver === "A" ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: ver === "A" ? 0.3 : 0.5, duration: 0.6 }}
              whileHover={{ y: -5 }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border transition-all duration-500 ${
                  bestVersion === ver
                    ? "border-emerald-500/50 shadow-2xl shadow-emerald-500/20"
                    : "border-white/20"
                }`}
              />
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <h4
                      className={`text-lg font-semibold bg-gradient-to-r ${titleGradient} bg-clip-text text-transparent`}
                    >
                      Version {ver}
                    </h4>
                    {bestVersion === ver && (
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Crown className="h-4 w-4 text-yellow-400" />
                      </motion.div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <motion.button
                      onClick={() => copyToClipboard(data.content, ver)}
                      className={`p-2 ${gradient} hover:brightness-110 ${textColor} rounded-xl transition-all backdrop-blur-sm border border-blue-500/30`}
                      title="Copy to clipboard"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Copy className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => downloadContent(data.content, data.title)}
                      className={`p-2 ${gradient} hover:brightness-110 ${textColor} rounded-xl transition-all backdrop-blur-sm border border-emerald-500/30`}
                      title="Download content"
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Download className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 mb-4 backdrop-blur-sm border border-white/10">
                  <h5 className={`font-semibold ${textColor} mb-2`}>
                    {data.title}
                  </h5>
                  <div className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">
                    {data.content}
                  </div>
                </div>

                <h3 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
                  Expected Performance Metrics
                </h3>

                <div className="grid grid-cols-3 gap-2 text-center">
                  {["openRate", "clickThroughRate", "conversionRate"].map(
                    (metric) => (
                      <motion.div
                        key={metric}
                        className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10"
                        whileHover={{ scale: 1.05, y: -2 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="text-lg font-bold text-white">
                          {data.metrics[metric]}%
                        </div>
                        <div className="text-xs text-gray-400">
                          {metric.replace(/([A-Z])/g, " $1")}
                        </div>
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Unified Save and Post Button */}
      <motion.div
        className="flex justify-center mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <motion.button
          onClick={postBothVersions}
          disabled={isPosting}
          className={`px-8 py-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 text-emerald-200 rounded-2xl transition-all backdrop-blur-sm border border-emerald-500/30 flex items-center space-x-3 ${
            isPosting ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
          }`}
          whileHover={!isPosting ? { scale: 1.05, y: -2 } : {}}
          whileTap={!isPosting ? { scale: 0.95 } : {}}
        >
          <Send className={`h-5 w-5 ${isPosting ? "animate-pulse" : ""}`} />
          <span className="text-lg font-semibold">
            {isPosting ? "Posting Both Versions..." : "Save and Post Both Versions"}
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default OutputSection;