import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

const ABChart = ({ content }) => {
  const chartData = [
    {
      metric: 'Open Rate',
      'Version A': content.versionA.metrics.openRate,
      'Version B': content.versionB.metrics.openRate,
    },
    {
      metric: 'Click-Through Rate',
      'Version A': content.versionA.metrics.clickThroughRate,
      'Version B': content.versionB.metrics.clickThroughRate,
    },
    {
      metric: 'Conversion Rate',
      'Version A': content.versionA.metrics.conversionRate,
      'Version B': content.versionB.metrics.conversionRate,
    },
  ];

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl" />

      <div className="relative p-6">
        <motion.div
          className="flex items-center space-x-2 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <BarChart3 className="h-5 w-5 text-cyan-400" />
          </motion.div>
          <h3 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            A/B Testing Analytics
          </h3>
        </motion.div>

        <motion.div
          className="flex flex-col md:flex-row gap-6 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {/* Bar Chart */}
          <div className="h-80 md:w-2/3 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="metric"
                  tick={{ fill: '#D1D5DB', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                />
                <YAxis
                  tick={{ fill: '#D1D5DB', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  label={{
                    value: 'Percentage (%)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: '#D1D5DB' },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                  }}
                  formatter={(value) => [`${value}%`, '']}
                />
                <Legend wrapperStyle={{ color: '#D1D5DB' }} />
                <Bar
                  dataKey="Version A"
                  fill="url(#gradientA)"
                  radius={[6, 6, 0, 0]}
                  name="Version A"
                />
                <Bar
                  dataKey="Version B"
                  fill="url(#gradientB)"
                  radius={[6, 6, 0, 0]}
                  name="Version B"
                />
                <defs>
                  <linearGradient id="gradientA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                  <linearGradient id="gradientB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Metric Cards */}
          <div className="flex flex-col gap-4 md:w-1/3">
            {/* Best Open Rate */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-2xl border border-blue-500/20" />
              <div className="relative p-4 text-center">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Best Open Rate</h4>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {Math.max(
                    content.versionA.metrics.openRate,
                    content.versionB.metrics.openRate
                  )}
                  %
                </div>
                <div className="text-xs text-gray-400">
                  Version{' '}
                  {content.versionA.metrics.openRate > content.versionB.metrics.openRate
                    ? 'A'
                    : 'B'}
                </div>
              </div>
            </motion.div>

            {/* Best CTR */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl border border-purple-500/20" />
              <div className="relative p-4 text-center">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Best CTR</h4>
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {Math.max(
                    content.versionA.metrics.clickThroughRate,
                    content.versionB.metrics.clickThroughRate
                  )}
                  %
                </div>
                <div className="text-xs text-gray-400">
                  Version{' '}
                  {content.versionA.metrics.clickThroughRate >
                  content.versionB.metrics.clickThroughRate
                    ? 'A'
                    : 'B'}
                </div>
              </div>
            </motion.div>

            {/* Best Conversion */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-sm rounded-2xl border border-emerald-500/20" />
              <div className="relative p-4 text-center">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Best Conversion</h4>
                <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                  {Math.max(
                    content.versionA.metrics.conversionRate,
                    content.versionB.metrics.conversionRate
                  )}
                  %
                </div>
                <div className="text-xs text-gray-400">
                  Version{' '}
                  {content.versionA.metrics.conversionRate >
                  content.versionB.metrics.conversionRate
                    ? 'A'
                    : 'B'}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ABChart;
