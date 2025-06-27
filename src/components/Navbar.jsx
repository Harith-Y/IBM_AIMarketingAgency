import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, LogOut, User, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <motion.nav 
      className="relative"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border-b border-white/10" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl blur-sm opacity-75"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.75, 0.9, 0.75],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-2xl shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                MarketingAI Pro
              </h1>
            </div>
          </motion.div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <motion.div 
              className="flex items-center space-x-3 text-white"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <motion.div 
                className="bg-gradient-to-r from-white/10 to-white/20 p-2 rounded-full backdrop-blur-sm border border-white/20"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <User className="h-5 w-5" />
              </motion.div>
              <span className="hidden sm:block font-medium">
                Welcome, {user.firstName}
              </span>
            </motion.div>

            {/* History Button */}
            <motion.button
              onClick={() => navigate('/history')}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-blue-200 px-4 py-2 rounded-xl transition-all border border-blue-500/30 backdrop-blur-sm"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:block">History</span>
            </motion.button>

            {/* Logout Button */}
            <motion.button
              onClick={onLogout}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 text-red-200 px-4 py-2 rounded-xl transition-all border border-red-500/30 backdrop-blur-sm"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:block">Logout</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;