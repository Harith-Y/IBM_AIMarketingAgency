import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import Toast from './components/Toast';

const App = () => {
  const [user, setUser] = useState(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('marketingai_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const showToast = (message, type) => {
    const id = Date.now().toString();
    const newToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('marketingai_users')) || [];
    const match = users.find(u => u.email === email && u.password === password);
    if (match) {
      localStorage.setItem('marketingai_user', JSON.stringify(match));
      setUser(match);
      showToast('Logged in successfully!', 'success');
      return true;
    }
    showToast('Invalid credentials.', 'error');
    return false;
  };

  const register = (email, password, firstName, lastName) => {
    const users = JSON.parse(localStorage.getItem('marketingai_users')) || [];
    if (users.some(u => u.email === email)) {
      showToast('Email already exists.', 'error');
      return false;
    }
    const newUser = { email, password, firstName, lastName };
    localStorage.setItem('marketingai_users', JSON.stringify([...users, newUser]));
    showToast('Registration successful! Please log in.', 'success');
    return true;
  };

  const logout = () => {
    localStorage.removeItem('marketingai_user');
    setUser(null);
    showToast('You have been logged out.', 'info');
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 relative overflow-hidden">
        {/* Glowing animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-60 h-60 bg-gradient-to-r from-emerald-400/10 to-teal-600/10 rounded-full blur-2xl"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        {/* Animated page routing */}
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/"
              element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
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
                  <LoginPage onLogin={login} />
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
                  <RegisterPage onRegister={register} />
                </motion.div>
              }
            />
            <Route
              path="/dashboard"
              element={
                user ? (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  >
                    <Dashboard user={user} onLogout={logout} showToast={showToast} />
                  </motion.div>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            {/* Catch-all route for any undefined path */}
            <Route
              path="*"
              element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
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