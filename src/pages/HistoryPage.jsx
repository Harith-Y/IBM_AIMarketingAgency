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
      }
    };
    fetchHistory();
  }, [token]);

  const fetchAnalytics = async (twitterId, version) => {
    try {
      const cached = localStorage.getItem(`analytics_${twitterId}`);
      if (cached) {
        setAnalytics((prev) => ({
          ...prev,
          [version]: JSON.parse(cached),
        }));
        showToast(`Analytics for Version ${version} loaded from cache`, 'info');
        return;
      }

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
      showToast(`Analytics for Version ${version} fetched`, 'success');
    } catch (error) {
      showToast(
        `Twitter API rate limit hit or data unavailable for Version ${version}`,
        'warning'
      );
    }
  };

  const handleViewAnalytics = async (item) => {
    setSelectedPost(item);
    setShowModal(true);

    const vA = item.versionA?.twitterId;
    const vB = item.versionB?.twitterId;

    if (vA) await fetchAnalytics(vA, 'A');
    if (vB) await fetchAnalytics(vB, 'B');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPost(null);
    setAnalytics({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Navbar onLogout={onLogout} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.h2
          className="text-3xl font-bold mb-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          History
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {history.map((item, index) => (
            <motion.div
              key={index}
              className="relative p-6 bg-white/10 rounded-xl border border-white/20 backdrop-blur-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <h3 className="text-xl font-semibold mb-2">{item.brandName}</h3>
              <p className="text-sm text-gray-300">{item.productName}</p>
              <div className="mt-4">
                <button
                  onClick={() => handleViewAnalytics(item)}
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                >
                  View Real Analytics
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal */}
        {showModal && selectedPost && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-11/12 md:w-2/3 lg:w-1/2 relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>

              <h3 className="text-xl font-semibold mb-4">
                Analytics for {selectedPost.brandName} Campaign
              </h3>

              {!analytics.A && !analytics.B ? (
                <p className="text-center text-gray-600">Loading analytics...</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        metric: 'Likes',
                        A: analytics.A?.public_metrics?.like_count || 0,
                        B: analytics.B?.public_metrics?.like_count || 0,
                      },
                      {
                        metric: 'Retweets',
                        A: analytics.A?.public_metrics?.retweet_count || 0,
                        B: analytics.B?.public_metrics?.retweet_count || 0,
                      },
                      {
                        metric: 'Replies',
                        A: analytics.A?.public_metrics?.reply_count || 0,
                        B: analytics.B?.public_metrics?.reply_count || 0,
                      },
                      {
                        metric: 'Quotes',
                        A: analytics.A?.public_metrics?.quote_count || 0,
                        B: analytics.B?.public_metrics?.quote_count || 0,
                      },
                      {
                        metric: 'Impressions',
                        A: analytics.A?.public_metrics?.impression_count || 0,
                        B: analytics.B?.public_metrics?.impression_count || 0,
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
