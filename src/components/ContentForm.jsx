import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, RotateCcw, Sparkles } from 'lucide-react';

const ContentForm = ({ onSubmit, isLoading, onReset }) => {
  const [formData, setFormData] = useState({
    brandName: '',
    audienceType: 'All',
    minAge: 18,
    maxAge: 65,
    tone: '',
    audienceCategory: '',
    productName: '',
    platform: 'Threads'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleReset = () => {
    setFormData({
      brandName: '',
      audienceType: 'All',
      minAge: 18,
      maxAge: 65,
      tone: '',
      audienceCategory: '',
      productName: '',
      platform: 'Threads'
    });
    onReset();
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.brandName && formData.tone && formData.audienceCategory;

  return (
    <motion.div 
      className="relative h-fit"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl" />
      
      <div className="relative p-6">
        <motion.div 
          className="flex items-center space-x-2 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="h-5 w-5 text-cyan-400" />
          </motion.div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Content Parameters
          </h2>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Brand Name */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Brand Name</label>
            <motion.input
              type="text"
              value={formData.brandName}
              onChange={(e) => updateField('brandName', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm"
              placeholder="Enter your brand name"
              required
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </motion.div>

          {/* Audience Type */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Target Audience</label>
            <motion.select
              value={formData.audienceType}
              onChange={(e) => updateField('audienceType', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 backdrop-blur-sm"
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <option value="All" className="bg-gray-800">All</option>
              <option value="Male" className="bg-gray-800">Male</option>
              <option value="Female" className="bg-gray-800">Female</option>
            </motion.select>
          </motion.div>

          {/* Age Range */}
          <motion.div className="grid grid-cols-2 gap-4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">Min Age</label>
              <motion.input
                type="number"
                value={formData.minAge}
                onChange={(e) => updateField('minAge', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400/50 transition-all duration-300 backdrop-blur-sm"
                min="13"
                max="100"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">Max Age</label>
              <motion.input
                type="number"
                value={formData.maxAge}
                onChange={(e) => updateField('maxAge', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400/50 transition-all duration-300 backdrop-blur-sm"
                min="13"
                max="100"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </div>
          </motion.div>

          {/* Tone */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Content Tone</label>
            <motion.input
              type="text"
              value={formData.tone}
              onChange={(e) => updateField('tone', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-400/50 transition-all duration-300 backdrop-blur-sm"
              placeholder="e.g., Professional, Friendly, Aggressive"
              required
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </motion.div>

          {/* Audience Category */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7, duration: 0.5 }}>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Audience Category</label>
            <motion.input
              type="text"
              value={formData.audienceCategory}
              onChange={(e) => updateField('audienceCategory', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-400/50 transition-all duration-300 backdrop-blur-sm"
              placeholder="e.g., Fitness Enthusiasts, Gamers, Travelers"
              required
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </motion.div>

          {/* Product Name */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.75, duration: 0.5 }}>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Product Name</label>
            <motion.input
              type="text"
              value={formData.productName}
              onChange={(e) => updateField('productName', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-400/50 transition-all duration-300 backdrop-blur-sm"
              placeholder="e.g., AI Marketing Tool, Fitness Band"
              required
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </motion.div>

          {/* Social Media Platform */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8, duration: 0.5 }}>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Platform</label>
            <motion.select
              value={formData.platform}
              onChange={(e) => updateField('platform', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 transition-all duration-300 backdrop-blur-sm"
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <option value="Threads" className="bg-gray-800">Threads</option>
              <option value="Twitter" className="bg-gray-800">Twitter</option>
              <option value="Facebook" className="bg-gray-800">Facebook</option>
            </motion.select>
          </motion.div>

          {/* Buttons */}
          <motion.div className="flex space-x-3 pt-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, duration: 0.5 }}>
            <motion.button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="flex-1 relative overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0" whileHover={{ opacity: 1 }} transition={{ duration: 0.3 }} />
              <div className="relative flex items-center justify-center space-x-2">
                {isLoading ? (
                  <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Generate</span>
                  </>
                )}
              </div>
            </motion.button>

            <motion.button
              type="button"
              onClick={handleReset}
              className="bg-gradient-to-r from-gray-600/50 to-gray-700/50 hover:from-gray-600/70 hover:to-gray-700/70 text-white py-3 px-4 rounded-xl font-semibold transition-all backdrop-blur-sm border border-white/10"
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <RotateCcw className="h-4 w-4" />
            </motion.button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
};

export default ContentForm;