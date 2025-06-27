import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import ContentForm from '../components/ContentForm';
import OutputSection from '../components/OutputSection';
import ABChart from '../components/ABChart';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

const API_BASE_URL = "http://localhost:8080/api";

const Dashboard = ({ user, onLogout, showToast }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  // const generateContent = async (request) => {
  //   setIsLoading(true);

  //   try {
  //     // Simulate API delay
  //     await new Promise(resolve => setTimeout(resolve, 2000));

  //     // Generate mock content based on the request
  //     const mockContent = {
  //       versionA: {
  //         title: `${request.tone} ${request.brandName} Campaign - Version A`,
  //         content: `🎯 Exclusive for ${request.audienceCategory}!\n\nDiscover ${request.brandName}'s latest collection designed specifically for ${request.audienceType === 'All' ? 'everyone' : request.audienceType.toLowerCase()} aged ${request.minAge}-${request.maxAge}.\n\n${request.tone === 'Professional' ? 'Experience premium quality and exceptional service.' : request.tone === 'Friendly' ? 'Join our community and enjoy amazing benefits!' : 'Don\'t miss out on this limited-time opportunity!'}\n\n✨ Special Launch Offer: 25% OFF\n🚚 Free shipping on orders over $50\n💝 Exclusive member perks\n\nShop now and transform your ${request.audienceCategory.toLowerCase()} experience!`,
  //         metrics: {
  //           openRate: Math.round(Math.random() * 20 + 65),
  //           clickThroughRate: Math.round(Math.random() * 8 + 12),
  //           conversionRate: Math.round(Math.random() * 5 + 8),
  //         }
  //       },
  //       versionB: {
  //         title: `${request.tone} ${request.brandName} Campaign - Version B`,
  //         content: `🔥 ${request.brandName} Presents: The Ultimate ${request.audienceCategory} Experience!\n\nTailored for ${request.audienceType === 'All' ? 'all our valued customers' : `${request.audienceType.toLowerCase()} customers`} in the ${request.minAge}-${request.maxAge} age range.\n\n${request.tone === 'Professional' ? 'Elevate your standards with our premium solutions.' : request.tone === 'Friendly' ? 'We\'re excited to share something special with you!' : 'Act fast - this deal won\'t last long!'}\n\n🎁 What's included:\n• Premium ${request.brandName} products\n• Priority customer support\n• Exclusive member discounts\n• Early access to new releases\n\nClaim your ${request.tone.toLowerCase()} advantage today!`,
  //         metrics: {
  //           openRate: Math.round(Math.random() * 20 + 65),
  //           clickThroughRate: Math.round(Math.random() * 8 + 12),
  //           conversionRate: Math.round(Math.random() * 5 + 8),
  //         }
  //       }
  //     };

  //     setGeneratedContent(mockContent);
  //     showToast('Content generated successfully!', 'success');
  //   } catch (error) {
  //     showToast('Failed to generate content. Please try again.', 'error');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const generateContent = async (request) => {
  setIsLoading(true);

  try {
    const response = await axios.post(`${API_BASE_URL}/dashboard/post`, request);

    const mockContent = response.data; // versionA and versionB

    setGeneratedContent(mockContent);
    showToast("Content generated successfully!", "success");
  } catch (error) {
    console.error("Content generation failed:", error);
    showToast("Failed to generate content. Please try again.", "error");
  } finally {
    setIsLoading(false);
  }
};

  const resetContent = () => {
    setGeneratedContent(null);
  };

  return (
    <motion.div 
      className="min-h-screen relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            AI Content Generator
          </h1>
          <p className="text-gray-300 text-lg">
            Create personalized marketing content with AI-powered A/B testing
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content Form */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <ContentForm 
              onSubmit={generateContent} 
              isLoading={isLoading}
              onReset={resetContent}
            />
          </motion.div>

          {/* Output Section */}
          <motion.div 
            className="lg:col-span-2 space-y-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            {isLoading && (
              <motion.div 
                className="flex justify-center items-center py-20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <LoadingSpinner />
              </motion.div>
            )}

            {generatedContent && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <OutputSection content={generatedContent} showToast={showToast} />
              </motion.div>
            )}

            {!generatedContent && !isLoading && (
              <motion.div 
                className="relative"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl border border-white/10" />
                <div className="relative p-12 text-center">
                  <motion.div
                    className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full" />
                  </motion.div>
                  <div className="text-gray-300 text-xl mb-3 font-semibold">
                    Ready to create amazing content?
                  </div>
                  <p className="text-gray-400">
                    Fill out the form and click generate to see your AI-powered marketing content with A/B testing analytics.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* ABChart outside the grid for full width */}
        {generatedContent && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-10"
          >
            <ABChart content={generatedContent} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
