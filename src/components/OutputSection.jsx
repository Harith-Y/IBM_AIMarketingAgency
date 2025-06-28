import React from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, Crown, TrendingUp } from 'lucide-react';
import axios from 'axios';

const OutputSection = ({ content, showToast }) => {
  const copyToClipboard = async (text, version) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Version ${version} copied to clipboard!`, 'success');
    } catch (error) {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const downloadContent = (text, title) => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('Content downloaded successfully!', 'success');
  };

  const postToAyrshare = async (text, version) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/ayrshare/post`, {
        text,
        platforms: ['twitter', 'facebook', 'threads'] 
      });
      showToast(`Version ${version} posted to Ayrshare!`, 'success');
    } catch (error) {
      showToast(`Failed to post Version ${version}: ${error.response?.data?.error || error.message}`, 'error');
    }
  };

  const getBestPerformer = () => {
    const aTotal = content.versionA.metrics.openRate + content.versionA.metrics.clickThroughRate + content.versionA.metrics.conversionRate;
    const bTotal = content.versionB.metrics.openRate + content.versionB.metrics.clickThroughRate + content.versionB.metrics.conversionRate;
    return aTotal > bTotal ? 'A' : 'B';
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
        <motion.div 
          className={`relative transition-all duration-500 ${bestVersion === 'A' ? 'scale-105' : ''}`}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          whileHover={{ y: -5 }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border transition-all duration-500 ${bestVersion === 'A' ? 'border-emerald-500/50 shadow-2xl shadow-emerald-500/20' : 'border-white/20'}`} />
          
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h4 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Version A
                </h4>
                {bestVersion === 'A' && (
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
                  onClick={() => copyToClipboard(content.versionA.content, 'A')}
                  className="p-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-200 rounded-xl transition-all backdrop-blur-sm border border-blue-500/30"
                  title="Copy to clipboard"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Copy className="h-4 w-4" />
                </motion.button>
                <motion.button
                  onClick={() => downloadContent(content.versionA.content, content.versionA.title)}
                  className="p-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 text-emerald-200 rounded-xl transition-all backdrop-blur-sm border border-emerald-500/30"
                  title="Download content"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Download className="h-4 w-4" />
                </motion.button>
                <motion.button
                  onClick={() => postToAyrshare(content.versionA.content, 'A')}
                  className="p-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 text-pink-200 rounded-xl transition-all backdrop-blur-sm border border-pink-500/30"
                  title="Post to Ayrshare"
                  whileHover={{ scale: 1.1, rotate: 2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  Post
                </motion.button>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-2xl p-4 mb-4 backdrop-blur-sm border border-white/10">
              <h5 className="font-semibold text-blue-200 mb-2">{content.versionA.title}</h5>
              <div className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">
                {content.versionA.content}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <motion.div 
                className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-lg font-bold text-white">{content.versionA.metrics.openRate}%</div>
                <div className="text-xs text-gray-400">Open Rate</div>
              </motion.div>
              <motion.div 
                className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-lg font-bold text-white">{content.versionA.metrics.clickThroughRate}%</div>
                <div className="text-xs text-gray-400">CTR</div>
              </motion.div>
              <motion.div 
                className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-lg font-bold text-white">{content.versionA.metrics.conversionRate}%</div>
                <div className="text-xs text-gray-400">Conversion</div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Version B */}
        <motion.div 
          className={`relative transition-all duration-500 ${bestVersion === 'B' ? 'scale-105' : ''}`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          whileHover={{ y: -5 }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border transition-all duration-500 ${bestVersion === 'B' ? 'border-emerald-500/50 shadow-2xl shadow-emerald-500/20' : 'border-white/20'}`} />
          
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h4 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Version B
                </h4>
                {bestVersion === 'B' && (
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
                  onClick={() => copyToClipboard(content.versionB.content, 'B')}
                  className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-200 rounded-xl transition-all backdrop-blur-sm border border-purple-500/30"
                  title="Copy to clipboard"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Copy className="h-4 w-4" />
                </motion.button>
                <motion.button
                  onClick={() => downloadContent(content.versionB.content, content.versionB.title)}
                  className="p-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 text-emerald-200 rounded-xl transition-all backdrop-blur-sm border border-emerald-500/30"
                  title="Download content"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Download className="h-4 w-4" />
                </motion.button>
                <motion.button
                  onClick={() => postToAyrshare(content.versionB.content, 'B')}
                  className="p-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 text-pink-200 rounded-xl transition-all backdrop-blur-sm border border-pink-500/30"
                  title="Post to Ayrshare"
                  whileHover={{ scale: 1.1, rotate: 2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  Post
                </motion.button>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-2xl p-4 mb-4 backdrop-blur-sm border border-white/10">
              <h5 className="font-semibold text-purple-200 mb-2">{content.versionB.title}</h5>
              <div className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">
                {content.versionB.content}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <motion.div 
                className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-lg font-bold text-white">{content.versionB.metrics.openRate}%</div>
                <div className="text-xs text-gray-400">Open Rate</div>
              </motion.div>
              <motion.div 
                className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-lg font-bold text-white">{content.versionB.metrics.clickThroughRate}%</div>
                <div className="text-xs text-gray-400">CTR</div>
              </motion.div>
              <motion.div 
                className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-lg font-bold text-white">{content.versionB.metrics.conversionRate}%</div>
                <div className="text-xs text-gray-400">Conversion</div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OutputSection;