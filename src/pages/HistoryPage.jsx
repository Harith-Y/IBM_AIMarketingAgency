import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import {
  BarChart, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer
} from 'recharts';
import { Copy, Download, Link } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const HistoryPage = ({ onLogout, showToast }) => {
  const [history, setHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'analytics' or 'content'
  const [selectedPost, setSelectedPost] = useState(null);
  const [analytics, setAnalytics] = useState({});
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/dashboard/get`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data);
      } catch (err) {
        console.error(err);
        showToast?.('Failed to fetch history', 'error');
      }
    };
    fetchHistory();
  }, [token, showToast]);

  const fetchAnalytics = async (twitterId, version) => {
    try {
      const cached = localStorage.getItem(`analytics_${twitterId}`);
      if (cached) {
        setAnalytics(prev => ({ ...prev, [version]: JSON.parse(cached) }));
        showToast?.(`Analytics for Version ${version} loaded from cache`, 'info');
        return true;
      }
      const response = await axios.get(
        `${API_BASE_URL}/dashboard/analytics/${twitterId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalytics(prev => ({ ...prev, [version]: response.data }));
      localStorage.setItem(`analytics_${twitterId}`, JSON.stringify(response.data));
      showToast?.(`Analytics for Version ${version} fetched`, 'success');
      return true;
    } catch {
      showToast?.(`Twitter API limit reached. Try again later (Version ${version})`, 'warning');
      return false;
    }
  };

  const getTwitterIdFromVid = async vid => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/getid/${vid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data; // expected ID
    } catch {
      return null;
    }
  };

  const handleViewAnalytics = async item => {
    setSelectedPost(item);
    setModalType('analytics');
    setShowModal(true);

    const vidA = item.versionA?.twitterId || item.versionA?.v_id && await getTwitterIdFromVid(item.versionA.v_id);
    const vidB = item.versionB?.twitterId || item.versionB?.v_id && await getTwitterIdFromVid(item.versionB.v_id);

    const okA = vidA ? await fetchAnalytics(vidA, 'A') : false;
    const okB = vidB ? await fetchAnalytics(vidB, 'B') : false;

    if (!okA && !okB) {
      showToast?.('No analytics data available yet', 'info');
      setShowModal(false);
    }
  };

  const handleViewContent = (item, version) => {
    setSelectedPost({ ...item, version });
    setModalType('content');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setAnalytics({});
    setSelectedPost(null);
    setModalType(null);
  };

  const copyToClipboard = async (text, version) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Version ${version} copied to clipboard!`, 'success');
    } catch {
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

  return (
    <motion.div
      className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 text-white"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}
    >
      {/* Blobs */}
      <motion.div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl"
        animate={{ x: [0,100,0], y: [0,-50,0], scale: [1,1.2,1] }} transition={{ duration:20, repeat:Infinity, ease:'easeInOut' }} />
      <motion.div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"
        animate={{ x:[0,-100,0], y:[0,50,0], scale:[1,1.3,1] }} transition={{ duration:25, repeat:Infinity, ease:'easeInOut' }} />
      <motion.div className="absolute top-1/2 left-1/2 w-60 h-60 bg-gradient-to-r from-emerald-400/10 to-teal-600/10 rounded-full blur-2xl"
        animate={{ rotate:[0,360], scale:[1,1.1,1] }} transition={{ duration:30, repeat:Infinity, ease:'linear' }} />

      <Navbar onLogout={onLogout} />

      <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        <motion.h2 className="text-3xl font-bold text-center mb-2"
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          History
        </motion.h2>
        <motion.p className="text-center text-gray-300 mb-8"
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}>
          Here’s all your past AI-generated campaigns. Click below to view live analytics or view the content!
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {history.length === 0 && (
            <motion.div className="col-span-full py-12 bg-white/10 rounded-xl border border-white/20 backdrop-blur-md text-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.7 }}>
              <p className="text-gray-300">No campaign history found. Your posts will appear here once generated.</p>
            </motion.div>
          )}

          {history.map((item, idx) => (
            <motion.div key={idx} className="relative p-6 bg-white/10 rounded-xl border border-white/20 backdrop-blur-md"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-xl font-semibold mb-1">{item.brandName}</h3>
              <p className="text-sm text-gray-300 mb-4">{item.productName}</p>
              <div className="flex gap-3 mb-4">
                <div className="flex gap-4 mb-6">
                  {/* View Content A */}
                  <motion.button
                    onClick={() => handleViewContent(item, 'A')}
                    className="px-4 py-2 rounded-xl text-cyan-200 border border-cyan-500/30 backdrop-blur-md bg-gradient-to-br from-cyan-500/10 to-cyan-400/10 hover:brightness-110 transition-all"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Content A
                  </motion.button>

                  {/* View Content B */}
                  <motion.button
                    onClick={() => handleViewContent(item, 'B')}
                    className="px-4 py-2 rounded-xl text-pink-200 border border-pink-500/30 backdrop-blur-md bg-gradient-to-br from-pink-500/10 to-pink-400/10 hover:brightness-110 transition-all"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Content B
                  </motion.button>

                  {/* View Analytics */}
                  <motion.button
                    onClick={() => handleViewAnalytics(item)}
                    className="px-4 py-2 rounded-xl text-blue-200 border border-blue-500/30 backdrop-blur-md bg-gradient-to-br from-blue-500/10 to-blue-400/10 hover:brightness-110 transition-all"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Real Analytics
                  </motion.button>
                </div>

              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Popups */}
      {showModal && selectedPost && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <motion.div
          className="bg-gradient-to-br from-indigo-900/90 to-purple-900/90 rounded-2xl p-6 w-11/12 md:w-2/3 lg:w-1/2 border border-white/20 shadow-2xl text-white relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white hover:text-red-400 transition"
            title="Close"
          >
            ✕
          </button>

          {modalType === 'content' && (
            <>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Version {selectedPost.version} Content
              </h3>

              <div className="bg-white/10 rounded-xl p-4 mb-5 text-gray-200 whitespace-pre-wrap font-mono border border-white/10 backdrop-blur-sm">
                {selectedPost[`version${selectedPost.version}`].content}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    copyToClipboard(
                      selectedPost[`version${selectedPost.version}`].content,
                      selectedPost.version
                    )
                  }
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-lg transition"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <button
                  onClick={() =>
                    downloadContent(
                      selectedPost[`version${selectedPost.version}`].content,
                      selectedPost[`version${selectedPost.version}`].title ||
                        `Version${selectedPost.version}`
                    )
                  }
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg transition"
                >
                  <Download className="w-4 h-4" />
                </button>

                {selectedPost[`version${selectedPost.version}`]?.postUrl && (
                  <button
                    onClick={() =>
                      copyToClipboard(
                        selectedPost[`version${selectedPost.version}`].postUrl,
                        selectedPost.version
                      )
                    }
                    className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg shadow-lg transition"
                  >
                    <Link className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          )}

          {modalType === 'analytics' && (
            <>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Analytics for {selectedPost.brandName} Campaign
              </h3>

              {(analytics.A || analytics.B) ? (
                <>
                  <motion.div
                    className="mb-4 text-sm font-semibold px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md inline-block"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    Best Performer: Version{' '}
                    <span className="underline">
                      {(analytics.A?.public_metrics.impression_count || 0) >
                      (analytics.B?.public_metrics.impression_count || 0)
                        ? 'A'
                        : (analytics.A?.public_metrics.like_count || 0) >
                          (analytics.B?.public_metrics.like_count || 0)
                        ? 'A'
                        : 'B'}
                    </span>
                  </motion.div>

                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        {
                          metric: 'Impressions',
                          A: analytics.A?.public_metrics.impression_count || 0,
                          B: analytics.B?.public_metrics.impression_count || 0,
                        },
                        {
                          metric: 'Likes',
                          A: analytics.A?.public_metrics.like_count || 0,
                          B: analytics.B?.public_metrics.like_count || 0,
                        },
                        {
                          metric: 'Replies',
                          A: analytics.A?.public_metrics.reply_count || 0,
                          B: analytics.B?.public_metrics.reply_count || 0,
                        },
                        {
                          metric: 'Retweets',
                          A: analytics.A?.public_metrics.retweet_count || 0,
                          B: analytics.B?.public_metrics.retweet_count || 0,
                        },
                      ]}
                    >
                      <XAxis dataKey="metric" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="A" fill="#00B5D8" />
                      <Bar dataKey="B" fill="#805AD5" />
                    </BarChart>
                  </ResponsiveContainer>
                </>
              ) : (
                <p className="text-gray-300">No analytics to display yet.</p>
              )}
            </>
          )}
        </motion.div>
      </div>
    )}

    </motion.div>
  );
};

export default HistoryPage;
