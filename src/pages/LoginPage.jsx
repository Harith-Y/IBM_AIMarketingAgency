import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, ArrowRight, Zap } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const success = onLogin(email, password);
    setIsLoading(false);
    
    if (!success) {
      setPassword(''); // Clear password on failed login
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className="flex justify-center mb-6"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-3xl blur-lg opacity-75"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.75, 0.9, 0.75],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className="relative bg-gradient-to-r from-cyan-500 to-purple-600 p-4 rounded-3xl shadow-2xl">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
            </div>
          </motion.div>
          <motion.h2 
            className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Welcome Back
          </motion.h2>
          <motion.p 
            className="text-gray-300 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Sign in to MarketingAI Pro
          </motion.p>
        </motion.div>

        {/* Login Form */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {/* Glassmorphism background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl" />
          
          <div className="relative p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-3">
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-4 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </motion.div>

              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <label htmlFor="password" className="block text-sm font-semibold text-gray-200 mb-3">
                  Password
                </label>
                <div className="relative group">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 backdrop-blur-sm"
                    placeholder="Enter your password"
                  />
                </div>
              </motion.div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="relative flex items-center justify-center space-x-3">
                  {isLoading ? (
                    <motion.div
                      className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <>
                      <span className="text-lg">Sign In</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </div>
              </motion.button>
            </form>

            <div className="mt-8 text-center space-y-4">
              <motion.a 
                href="#" 
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors duration-300 font-medium"
                whileHover={{ scale: 1.05 }}
              >
                Forgot your password?
              </motion.a>
              <div className="text-gray-400 text-sm">
                Don't have an account?{' '}
                <motion.a 
                  href="#" 
                  className="text-purple-400 hover:text-purple-300 transition-colors duration-300 font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  Sign up
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>

        
      </div>
    </div>
  );
};

export default LoginPage;