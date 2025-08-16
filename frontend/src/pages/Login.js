import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Heart } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground.tsx';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/mood-gate'); // Show mood question first
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Bubble config (generate once for smooth animation)
  const bubbleColors = [
    'rgba(255,255,255,0.35)',
    'rgba(255,255,255,0.25)',
    'rgba(255,255,255,0.18)',
  ];
  const [bubbles] = useState(() =>
    Array.from({ length: 16 }).map((_, i) => ({
      size: Math.random() * 160 + 100,
      left: Math.random() * 90 + '%',
      top: Math.random() * 90 + '%',
      color: bubbleColors[i % bubbleColors.length],
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 6,
      blur: Math.random() * 8 + 6,
      opacity: Math.random() * 0.3 + 0.3,
      direction: i % 2 === 0 ? 1 : -1,
      rotate: Math.random() * 30 - 15,
    }))
  );

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #e3f0ff 0%, #f8faff 100%)' }}>
      <AnimatedBackground />
      {/* Animated Bubbles */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        {bubbles.map((bubble, i) => (
          <motion.div
            key={i}
            initial={{ y: 0, scale: 1, rotate: 0 }}
            animate={{
              y: bubble.direction * 100,
              scale: 1.08,
              rotate: bubble.rotate,
            }}
            transition={{ repeat: Infinity, repeatType: 'reverse', duration: bubble.duration, delay: bubble.delay, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              left: bubble.left,
              top: bubble.top,
              width: bubble.size,
              height: bubble.size,
              borderRadius: '50%',
              background: bubble.color,
              boxShadow: `0 0 80px 20px ${bubble.color}, inset 0 0 40px 10px #fff8`,
              filter: `blur(${bubble.blur}px)`,
              opacity: bubble.opacity,
              zIndex: 1,
              transition: 'background 0.3s',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute',
              top: '20%',
              left: '20%',
              width: '60%',
              height: '60%',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #fff8 60%, transparent 100%)',
              opacity: 0.7,
              filter: 'blur(4px)',
            }} />
          </motion.div>
        ))}
      </div>
      {/* Login Card and Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-md w-full space-y-8 z-10"
      >
        {/* Logo and Title */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-4 shadow-lg"
          >
            <Heart className="text-white" size={32} />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight"
            style={{letterSpacing: '-1px'}}
          >
            Welcome Back
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-black mb-2 tracking-tight"
            style={{letterSpacing: '-1px'}}
          >
            Sign in to continue your mental health journey
          </motion.p>
        </div>

        {/* Login Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card space-y-6"
          onSubmit={handleSubmit}
        >
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-base font-semibold text-gray-800 mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`input-field ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-red-600"
              >
                {errors.email}
              </motion.p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-base font-semibold text-gray-800 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`input-field pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-red-600"
              >
                {errors.password}
              </motion.p>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full bg-gradient-to-r from-purple-500 to-pink-400 text-white font-bold py-3 text-lg rounded-xl shadow-md transition-all duration-200 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{letterSpacing: '0.5px'}}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="spinner mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </motion.button>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-base text-gray-500">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-purple-500 hover:text-pink-400 transition-colors underline"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </motion.form>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-black text-base mt-4"
        >
          <p className="font-serif font-semibold italic tracking-wide drop-shadow-sm">
            Your mental health matters <span role="img" aria-label="blue heart">💙</span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
