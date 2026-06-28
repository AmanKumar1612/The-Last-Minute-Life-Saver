import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Command, Mail, Lock, User, Briefcase, Target, Calendar, ShieldCheck, Loader2, ArrowRight, Eye, EyeOff, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const features = [
  { text: 'Smart Task Planning', icon: Target },
  { text: 'Calendar Sync', icon: Calendar },
  { text: 'Focus Sessions', icon: ShieldCheck },
];

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', profession: '', productivity_goals: [] });
  const [showPassword, setShowPassword] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
    <div className="min-h-screen bg-[var(--background)] flex flex-col lg:flex-row overflow-hidden font-sans">
      
      {/* LEFT SIDE: Visual Story */}
      <div className="hidden lg:flex relative w-1/2 flex-col justify-between p-12 border-r border-[var(--border-color)] overflow-hidden bg-[#05050A]">
        {/* Dynamic Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-noise opacity-[0.03]" />
          <motion.div 
            animate={{ 
              x: mousePosition.x * -0.02,
              y: mousePosition.y * -0.02
            }}
            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
            className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-grid-premium opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
          />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent-primary)]/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent-secondary)]/5 rounded-full blur-[120px] pointer-events-none" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-8 h-8 rounded-md bg-[var(--text-primary)] flex items-center justify-center">
              <Command className="w-4 h-4 text-[var(--background)]" />
            </div>
            <span className="font-semibold text-[var(--text-primary)] tracking-tight text-lg">Last-Minute</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-5xl font-semibold tracking-tight text-[var(--text-primary)] leading-[1.1] mb-6">
              Start your <br />
              <span className="text-[var(--text-secondary)]">Productivity Journey</span>
            </h1>
            <p className="text-[var(--text-muted)] text-lg max-w-md leading-relaxed">
              Join thousands of professionals taking back control of their time with AI-driven planning and insights.
            </p>
          </motion.div>
        </div>

        {/* Floating Feature Cards */}
        <div className="relative z-10 flex flex-col gap-4 max-w-sm">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }}
              whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.03)' }}
              className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-secondary)]/50 backdrop-blur-sm cursor-default"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--surface)] border border-[var(--border-color)] flex items-center justify-center">
                <feature.icon className="w-4 h-4 text-[var(--accent-highlight)]" />
              </div>
              <span className="text-[var(--text-primary)] font-medium text-sm">{feature.text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative overflow-y-auto">
        {/* Mobile background */}
        <div className="absolute inset-0 bg-noise opacity-[0.02] lg:hidden z-0 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)]/5 rounded-full blur-[100px] pointer-events-none z-0" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0 }}
          className="w-full max-w-[400px] relative z-10 py-12 lg:py-0"
        >
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-12">
            <div className="w-8 h-8 rounded-md bg-[var(--text-primary)] flex items-center justify-center">
              <Command className="w-4 h-4 text-[var(--background)]" />
            </div>
            <span className="font-semibold text-[var(--text-primary)] tracking-tight">Last-Minute</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight mb-2">Create an account</h2>
            <p className="text-[var(--text-muted)] text-sm">Enter your details to get started.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-sm flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="John Doe"
              icon={User}
              required
            />

            <Input
              label="Email address"
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="name@example.com"
              icon={Mail}
              required
            />

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[var(--text-muted)] block">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--border-color)] rounded-lg pl-9 pr-10 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-highlight)] transition-colors"
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Input
              label="Profession (Optional)"
              type="text"
              value={form.profession}
              onChange={(e) => handleChange('profession', e.target.value)}
              placeholder="Student, Developer, etc."
              icon={Briefcase}
            />

            <div className="space-y-1.5 pt-1">
              <label className="text-[13px] font-medium text-[var(--text-muted)] block">Productivity Goals</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                  className="flex-1 bg-[var(--surface)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-highlight)] transition-colors"
                  placeholder="e.g., Learn ML"
                />
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={addGoal}
                  className="h-10 px-4"
                >
                  Add
                </Button>
              </div>
              
              <AnimatePresence>
                {form.productivity_goals.length > 0 && (
                  <motion.div layout className="flex flex-wrap gap-2 mt-3">
                    {form.productivity_goals.map((g, i) => (
                      <motion.span 
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        key={i} 
                        className="bg-[var(--surface-secondary)] text-[var(--text-secondary)] px-2.5 py-1 rounded border border-[var(--border-color)] text-xs flex items-center gap-1.5"
                      >
                        {g}
                        <button 
                          type="button" 
                          onClick={() => removeGoal(i)} 
                          className="text-[var(--text-muted)] hover:text-red-400 transition-colors cursor-pointer flex items-center justify-center"
                        >
                          <X size={12} />
                        </button>
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-11 text-[15px] mt-4 group"
              isLoading={loading}
            >
              {!loading && (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--text-primary)] hover:underline font-medium">
              Sign in
            </Link>
          </p>

        </motion.div>
      </div>
    </div>
  );
}
