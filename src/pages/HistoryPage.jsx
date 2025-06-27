import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const HistoryPage = ({ user, onLogout }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const stored = localStorage.getItem('generated_history');
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('generated_history');
    setHistory([]);
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-6xl mx-auto p-6">
        <motion.h2 
          className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          History of Generated Content
        </motion.h2>

        {history.length === 0 ? (
          <p className="text-gray-400 text-lg">No generated content history found.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {history.map((item, index) => (
                <motion.div
                  key={index}
                  className="relative p-6 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                >
                  <h3 className="text-lg font-semibold text-cyan-300 mb-2">
                    {item.request.brandName} Campaign
                  </h3>
                  <p className="text-sm text-gray-400 mb-1">Tone: {item.request.tone}</p>
                  <p className="text-sm text-gray-400 mb-1">
                    Audience: {item.request.audienceType}, Age {item.request.minAge}-{item.request.maxAge}
                  </p>
                  <p className="text-sm text-gray-400 mb-1">Category: {item.request.audienceCategory}</p>
                  <p className="text-sm text-gray-400 mb-4">Product Name: {item.request.productName}</p>

                  <div className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 p-4 rounded-xl text-sm text-gray-300 whitespace-pre-wrap">
                    <strong>Version A:</strong>
                    <br />
                    {item.content.versionA.content}
                    <br /><br />
                    <strong>Version B:</strong>
                    <br />
                    {item.content.versionB.content}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center relative z-10">
              <button
                onClick={clearHistory}
                className="text-sm text-red-400 hover:text-red-300 underline cursor-pointer"
              >
                Clear History
              </button>
            </div>

          </>
        )}
      </div>
    </motion.div>
  );
};

export default HistoryPage;