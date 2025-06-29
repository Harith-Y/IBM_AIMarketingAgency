import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import {
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  ResponsiveContainer,
} from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const HistoryPage = ({ onLogout, showToast }) => {
  const [history, setHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [analytics, setAnalytics] = useState({});
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/dashboard/get`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
        setAnalytics((prev) => ({
          ...prev,
          [version]: JSON.parse(cached),
        }));
        showToast?.(`Analytics for Version ${version} loaded from cache`, 'info');
        return;
      }
      console.log(`${API_BASE_URL}/dashboard/analytics/${twitterId}`);
      const response = await axios.get(
        `${API_BASE_URL}/dashboard/analytics/${twitterId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAnalytics((prev) => ({
        ...prev,
        [version]: response.data,
      }));
      localStorage.setItem(`analytics_${twitterId}`, JSON.stringify(response.data));
      showToast?.(`Analytics for Version ${version} fetched`, 'success');
    } catch {
      showToast?.(
        `Twitter API limit reached or data unavailable (Version ${version})`,
        'warning'
      );
    }
  };

const getTwitterIdFromVid = async (vid, token) => {
  try {
    const longVid = Number(vid);
    if (isNaN(longVid)) throw new Error("Invalid vid: not a number");

    const response = await axios.get(`${API_BASE_URL}/dashboard/getid/${longVid}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    return response.data; // Expecting Twitter ID string or full object
  } catch (error) {
    console.error(`Failed to get Twitter ID for vid ${vid}:`, error);
    return null;
  }
};



const handleViewAnalytics = async (item) => {
  setSelectedPost(item);
  setShowModal(true);

  console.log("item is ", item);

  // Version A
  let twitterIdA = item.versionA?.twitterId;
  if (!twitterIdA && item.versionA?.v_id) {
    twitterIdA = await getTwitterIdFromVid(item.versionA.v_id);
  }

  if (twitterIdA) await fetchAnalytics(twitterIdA, 'A');
  else showToast?.('No analytics data for Version A yet', 'warning');

  // Version B
  let twitterIdB = item.versionB?.twitterId;
  if (!twitterIdB && item.versionB?.v_id) {
    twitterIdB = await getTwitterIdFromVid(item.versionB.v_id);
  }

  if (twitterIdB) await fetchAnalytics(twitterIdB, 'B');
  else showToast?.('No analytics data for Version B yet', 'warning');
};


  const closeModal = () => {
    setShowModal(false);
    setSelectedPost(null);
    setAnalytics({});
  };

  return (
    <motion.div
      className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      {/* Animated background blobs */}
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl"
        animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"
        animate={{ x: [0, -100, 0], y: [0, 50, 0], scale: [1, 1.3, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-60 h-60 bg-gradient-to-r from-emerald-400/10 to-teal-600/10 rounded-full blur-2xl"
        animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />

      <Navbar onLogout={onLogout} />

      <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        <motion.h2
          className="text-3xl font-bold text-center mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          History
        </motion.h2>

        <motion.p
          className="text-center text-gray-300 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          Here’s all your past AI-generated campaigns. Click below to view live analytics and see which version performed better!
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {history.length === 0 && (
            <motion.div
              className="col-span-full py-12 bg-white/10 rounded-xl border border-white/20 backdrop-blur-md text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              <p className="text-gray-300">No campaign history found. Your posts will appear here once generated.</p>
            </motion.div>
          )}

          {history.map((item, idx) => (
            <motion.div
              key={idx}
              className="relative p-6 bg-white/10 rounded-xl border border-white/20 backdrop-blur-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-xl font-semibold mb-1">{item.brandName}</h3>
              <p className="text-sm text-gray-300 mb-4">{item.productName}</p>
              <motion.button
                onClick={() => handleViewAnalytics(item)}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded shadow-lg transition-transform"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                View Real Analytics
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal Popup */}
      {showModal && selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg p-6 w-11/12 md:w-2/3 lg:w-1/2 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h3 className="text-xl font-semibold mb-3">
              Analytics for {selectedPost.brandName} Campaign
            </h3>

            {analytics.A && analytics.B && (
              <motion.div
                className="mb-4 text-sm text-white font-semibold px-4 py-2 rounded bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md inline-block"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                Best Performer: Version{' '}
                <span className="underline">
                  {(() => {
                    const aImp = analytics.A?.public_metrics.impression_count || 0;
                    const bImp = analytics.B?.public_metrics.impression_count || 0;
                    const aLikes = analytics.A?.public_metrics.like_count || 0;
                    const bLikes = analytics.B?.public_metrics.like_count || 0;
                    if (aImp !== bImp) return aImp > bImp ? 'A' : 'B';
                    return aLikes > bLikes ? 'A' : 'B';
                  })()}
                </span>
              </motion.div>
            )}

            {!analytics.A || !analytics.B ? (
              <p className="text-gray-700">Loading analytics…</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      metric: 'Impressions',
                      A: analytics.A?.public_metrics?.impression_count || 0,
                      B: analytics.B?.public_metrics?.impression_count || 0,
                    },
                    {
                      metric: 'Likes',
                      A: analytics.A?.public_metrics?.like_count || 0,
                      B: analytics.B?.public_metrics?.like_count || 0,
                    },
                    {
                      metric: 'Replies',
                      A: analytics.A?.public_metrics?.reply_count || 0,
                      B: analytics.B?.public_metrics?.reply_count || 0,
                    },
                    {
                      metric: 'Retweets',
                      A: analytics.A?.public_metrics?.retweet_count || 0,
                      B: analytics.B?.public_metrics?.retweet_count || 0,
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
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default HistoryPage;
