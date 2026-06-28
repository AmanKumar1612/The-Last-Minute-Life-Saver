import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Command, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, CheckCircle2, Calendar, Target, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';

const features = [
  { text: 'Smart Task Planning', icon: Target },
  { text: 'Calendar Sync', icon: Calendar },
  { text: 'Focus Sessions', icon: ShieldCheck },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
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
              Your AI Productivity <br />
              <span className="text-[var(--text-secondary)]">Companion</span>
            </h1>
            <p className="text-[var(--text-muted)] text-lg max-w-md leading-relaxed">
              Stop reacting, start orchestrating. Our command center intelligently prioritizes tasks and protects your focus.
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        {/* Mobile background */}
        <div className="absolute inset-0 bg-noise opacity-[0.02] lg:hidden z-0 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)]/5 rounded-full blur-[100px] pointer-events-none z-0" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0 }}
          className="w-full max-w-[400px] relative z-10"
        >
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-12">
            <div className="w-8 h-8 rounded-md bg-[var(--text-primary)] flex items-center justify-center">
              <Command className="w-4 h-4 text-[var(--background)]" />
            </div>
            <span className="font-semibold text-[var(--text-primary)] tracking-tight">Last-Minute</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight mb-2">Welcome back</h2>
            <p className="text-[var(--text-muted)] text-sm">Enter your credentials to access your workspace.</p>
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              icon={Mail}
              required
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-medium text-[var(--text-muted)]">Password</label>
                <a href="#" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--border-color)] rounded-lg pl-9 pr-10 py-2 text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-highlight)] transition-colors"
                  placeholder="••••••••"
                  required
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

            <Button
              type="submit"
              variant="primary"
              className="w-full h-11 text-[15px] mt-2 group"
              isLoading={loading}
            >
              {!loading && (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px bg-[var(--border-color)] flex-1" />
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Or continue with</span>
            <div className="h-px bg-[var(--border-color)] flex-1" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="secondary" className="w-full text-sm font-normal">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>
            <Button variant="secondary" className="w-full text-sm font-normal">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              GitHub
            </Button>
          </div>

          <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[var(--text-primary)] hover:underline font-medium">
              Create one
            </Link>
          </p>

        </motion.div>
      </div>
    </div>
  );
}
