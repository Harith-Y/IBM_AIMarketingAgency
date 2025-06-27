import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'info':
        return <Info className="h-5 w-5 text-cyan-400" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-200';
      case 'error':
        return 'from-red-500/20 to-pink-500/20 border-red-500/30 text-red-200';
      case 'info':
        return 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-200';
    }
  };

  return (
    <motion.div 
      className={`${getStyles()} bg-gradient-to-r backdrop-blur-xl border rounded-2xl p-4 shadow-2xl max-w-sm relative overflow-hidden`}
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl"
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          >
            {getIcon()}
          </motion.div>
          <p className="text-sm font-semibold">{message}</p>
        </div>
        <motion.button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Toast;