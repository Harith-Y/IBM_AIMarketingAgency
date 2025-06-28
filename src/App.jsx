import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import HistoryPage from './pages/HistoryPage';
import Toast from './components/Toast';

const App = () => {
  const [toasts, setToasts] = useState([]);

  // useEffect(() => {
  //   const token = localStorage.getItem('authToken');
  //   if (token) {
  //     setUser({ token });
  //   }
  // }, []);

  const showToast = (message, type) => {
    const id = Date.now().toString();
    const newToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    //setUser(null);
    showToast('Logged out successfully!', 'success');
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 relative overflow-hidden">
        {/* Glowing animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl"
            animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"
            animate={{ x: [0, -100, 0], y: [0, 50, 0], scale: [1, 1.3, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-60 h-60 bg-gradient-to-r from-emerald-400/10 to-teal-600/10 rounded-full blur-2xl"
            animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Animated routing */}
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/"
              element={<Navigate to={localStorage.getItem("authToken") ? '/dashboard' : '/login'} replace />}
            />
            <Route
              path="/login"
              element={
                <motion.div
                  key="login"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  <LoginPage showToast={showToast} />
                </motion.div>
              }
            />
            <Route
              path="/register"
              element={
                <motion.div
                  key="register"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  <RegisterPage showToast={showToast} />
                </motion.div>
              }
            />
            <Route
              path="/dashboard"
              element={
                localStorage.getItem("authToken") ? (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  >
                    <Dashboard onLogout={logout} showToast={showToast} />
                  </motion.div>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/history"
              element={
                localStorage.getItem("authToken") ? (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  >
                    <HistoryPage onLogout={logout} showToast={showToast} />
                  </motion.div>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="*"
              element={<Navigate to={localStorage.getItem("authToken") ? '/dashboard' : '/login'} replace />}
            />
          </Routes>
        </AnimatePresence>

        {/* Toast Container */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          <AnimatePresence>
            {toasts.map((toast) => (
              <Toast
                key={toast.id}
                message={toast.message}
                type={toast.type}
                onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </Router>
  );
};

export default App;
