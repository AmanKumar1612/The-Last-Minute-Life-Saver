import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, User, Mail, Lock, Briefcase, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeUp } from '../lib/motion';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', profession: '', productivity_goals: [] });
  const [goalInput, setGoalInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  const addGoal = () => {
    if (goalInput.trim()) {
      setForm({ ...form, productivity_goals: [...form.productivity_goals, goalInput.trim()] });
      setGoalInput('');
    }
  };

  const removeGoal = (idx) => {
    setForm({ ...form, productivity_goals: form.productivity_goals.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none animate-orb" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none animate-orb stagger-3" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-[90px] pointer-events-none animate-orb stagger-5" />

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="glass-card p-8 w-full max-w-[440px] border border-white/10 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-shadow duration-500"
      >
        <motion.div variants={fadeUp} className="flex flex-col items-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 12 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30 cursor-pointer"
          >
            <Zap className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold gradient-text">Create Account</h1>
          <p className="text-slate-400 text-sm mt-1">Start your productivity journey</p>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div variants={fadeUp}>
            <label className="text-sm text-slate-300 mb-1.5 block font-medium">Full Name</label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-indigo-400 group-focus-within:scale-110 transition-all duration-200" />
              <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} className="input-glass w-full pl-10 hover:border-white/20 focus:border-indigo-500/50 transition-all duration-200" placeholder="John Doe" required />
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <label className="text-sm text-slate-300 mb-1.5 block font-medium">Email</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-indigo-400 group-focus-within:scale-110 transition-all duration-200" />
              <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className="input-glass w-full pl-10 hover:border-white/20 focus:border-indigo-500/50 transition-all duration-200" placeholder="you@example.com" required />
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <label className="text-sm text-slate-300 mb-1.5 block font-medium">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-indigo-400 group-focus-within:scale-110 transition-all duration-200" />
              <input type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} className="input-glass w-full pl-10 hover:border-white/20 focus:border-indigo-500/50 transition-all duration-200" placeholder="Min 6 characters" required minLength={6} />
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <label className="text-sm text-slate-300 mb-1.5 block font-medium">Profession <span className="text-slate-500 font-normal">(Optional)</span></label>
            <div className="relative group">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-indigo-400 group-focus-within:scale-110 transition-all duration-200" />
              <input type="text" value={form.profession} onChange={(e) => handleChange('profession', e.target.value)} className="input-glass w-full pl-10 hover:border-white/20 focus:border-indigo-500/50 transition-all duration-200" placeholder="Student, Developer, etc." />
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <label className="text-sm text-slate-300 mb-1.5 block font-medium">Productivity Goals</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                className="input-glass flex-1 min-w-0 hover:border-white/20 focus:border-indigo-500/50 transition-all duration-200"
                placeholder="e.g., Learn ML"
              />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button" 
                onClick={addGoal} 
                className="btn-secondary text-sm !px-4 !py-2.5"
              >
                Add
              </motion.button>
            </div>
            <motion.div layout className="flex flex-wrap gap-2 mt-3">
              <AnimatePresence>
                {form.productivity_goals.map((g, i) => (
                  <motion.span 
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    key={i} 
                    className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs flex items-center gap-1.5 border border-indigo-500/20"
                  >
                    {g}
                    <motion.button 
                      whileHover={{ scale: 1.2, color: '#f87171' }}
                      type="button" 
                      onClick={() => removeGoal(i)} 
                      className="transition-colors text-base leading-none cursor-pointer"
                    >
                      ×
                    </motion.button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          <motion.button 
            variants={fadeUp}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            disabled={loading} 
            className="btn-primary w-full py-3 gap-2 text-sm mt-2 cursor-pointer"
          >
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Loader2 className="w-4 h-4" />
              </motion.div>
            ) : null}
            {loading ? 'Creating Account...' : 'Create Account'}
          </motion.button>
        </form>

        <motion.p variants={fadeUp} className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors hover:underline">Sign in</Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
