import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Stars } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center space-y-6"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        {/* Outer rotating ring */}
        <motion.div 
          className="w-20 h-20 border-4 border-transparent border-t-cyan-400 border-r-purple-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner rotating ring */}
        <motion.div 
          className="absolute inset-2 w-16 h-16 border-4 border-transparent border-b-pink-400 border-l-emerald-400 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <Sparkles className="h-8 w-8 text-white" />
          </motion.div>
        </div>

        {/* Floating particles */}
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{
            y: [-10, 10, -10],
            x: [-5, 5, -5],
            rotate: [0, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Zap className="h-4 w-4 text-yellow-400" />
        </motion.div>

        <motion.div
          className="absolute -bottom-2 -left-2"
          animate={{
            y: [10, -10, 10],
            x: [5, -5, 5],
            rotate: [360, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Stars className="h-4 w-4 text-purple-400" />
        </motion.div>
      </div>

      <motion.div 
        className="text-center space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <motion.h3 
          className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          Generating Content
        </motion.h3>
        <motion.p 
          className="text-gray-400 text-sm max-w-xs"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          Our AI is crafting personalized marketing content with advanced analytics for you...
        </motion.p>
        
        {/* Progress dots */}
        <div className="flex justify-center space-x-2 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoadingSpinner;