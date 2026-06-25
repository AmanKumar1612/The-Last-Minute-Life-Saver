import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, User, Mail, Lock, Briefcase, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative">
      <div className="absolute top-20 right-20 w-72 h-72 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="glass-card p-8 w-full max-w-[420px] animate-fade-in-up">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">Create Account</h1>
          <p className="text-slate-400 text-sm mt-1">Start your productivity journey</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-sm text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-1.5 block font-medium">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} className="input-glass w-full pl-10" placeholder="John Doe" required />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-1.5 block font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className="input-glass w-full pl-10" placeholder="you@example.com" required />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-1.5 block font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} className="input-glass w-full pl-10" placeholder="Min 6 characters" required minLength={6} />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-1.5 block font-medium">Profession <span className="text-slate-500 font-normal">(Optional)</span></label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input type="text" value={form.profession} onChange={(e) => handleChange('profession', e.target.value)} className="input-glass w-full pl-10" placeholder="Student, Developer, etc." />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-1.5 block font-medium">Productivity Goals</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                className="input-glass flex-1 min-w-0"
                placeholder="e.g., Learn ML"
              />
              <button type="button" onClick={addGoal} className="btn-secondary text-sm !px-4 !py-2.5">Add</button>
            </div>
            {form.productivity_goals.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.productivity_goals.map((g, i) => (
                  <span key={i} className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs flex items-center gap-1.5 border border-indigo-500/20">
                    {g}
                    <button type="button" onClick={() => removeGoal(i)} className="hover:text-red-400 transition-colors text-base leading-none">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 gap-2 text-sm mt-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
