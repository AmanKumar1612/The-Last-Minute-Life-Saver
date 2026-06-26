import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUp } from '../lib/motion';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none animate-orb" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/15 rounded-full blur-[120px] pointer-events-none animate-orb stagger-3" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-[90px] pointer-events-none animate-orb stagger-5" />

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="glass-card p-8 w-full max-w-[420px] border border-white/10 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] transition-shadow duration-500"
      >
        {/* Logo */}
        <motion.div variants={fadeUp} className="flex flex-col items-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 12 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30 cursor-pointer"
          >
            <Zap className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold gradient-text">Welcome Back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your productivity companion</p>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div variants={fadeUp}>
            <label className="text-sm text-slate-300 mb-1.5 block font-medium">Email</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-indigo-400 group-focus-within:scale-110 transition-all duration-200" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-glass w-full pl-10 hover:border-white/20 focus:border-indigo-500/50 transition-all duration-200"
                placeholder="you@example.com"
                required
              />
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <label className="text-sm text-slate-300 mb-1.5 block font-medium">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-indigo-400 group-focus-within:scale-110 transition-all duration-200" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-glass w-full pl-10 hover:border-white/20 focus:border-indigo-500/50 transition-all duration-200"
                placeholder="••••••••"
                required
              />
            </div>
          </motion.div>

          <motion.button
            variants={fadeUp}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 gap-2 text-sm cursor-pointer"
          >
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Loader2 className="w-4 h-4" />
              </motion.div>
            ) : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>

        <motion.p variants={fadeUp} className="text-center text-sm text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors hover:underline">
            Sign up
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
