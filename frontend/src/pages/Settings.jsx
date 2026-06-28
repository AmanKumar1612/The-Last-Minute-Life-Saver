import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Moon, Sun, Bell, Calendar, Shield, Save, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeUp, cardVariants } from '../lib/motion';

export default function Settings() {
  const { user, updateProfile, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [form, setForm] = useState({
    name: user?.name || '',
    profession: user?.profession || '',
    productivity_goals: user?.productivity_goals || [],
  });
  const [goalInput, setGoalInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const addGoal = () => {
    if (goalInput.trim()) {
      setForm({ ...form, productivity_goals: [...form.productivity_goals, goalInput.trim()] });
      setGoalInput('');
    }
  };

  const removeGoal = (idx) => setForm({ ...form, productivity_goals: form.productivity_goals.filter((_, i) => i !== idx) });

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-2xl"
    >
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b divider-subtle mb-12">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight mb-2">Settings</h1>
          <p className="text-[var(--text-muted)] text-sm">Account configuration and preferences.</p>
        </div>
      </motion.div>

      {/* Profile */}
      <motion.div className="flex flex-col mb-12">
        <h2 className="label-micro mb-8">Personal Information</h2>
        
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">Full Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-glass w-full text-[14px] py-3 bg-[var(--background)]" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">Email Address</label>
              <input type="email" value={user?.email || ''} className="input-glass w-full text-[14px] py-3 opacity-50 cursor-not-allowed bg-[var(--background)]" disabled />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">Profession / Role</label>
              <input type="text" value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} className="input-glass w-full text-[14px] py-3 bg-[var(--background)]" placeholder="Student, Developer, etc." />
            </div>
          </div>

          <div className="pt-4">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">Productivity Goals</label>
            <div className="flex gap-3 mb-4">
              <input type="text" value={goalInput} onChange={(e) => setGoalInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())} className="input-glass flex-1 text-[14px] py-3 bg-[var(--background)]" placeholder="What are you striving for?" />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addGoal} 
                className="text-[13px] font-medium text-[var(--background)] bg-[var(--text-primary)] hover:opacity-90 px-6 rounded-lg transition-colors shadow-lg shadow-white/5"
              >
                Add
              </motion.button>
            </div>
            <motion.div layout className="flex flex-wrap gap-2">
              <AnimatePresence>
                {form.productivity_goals.map((g, i) => (
                  <motion.span 
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    key={i} 
                    className="bg-[var(--surface-secondary)] text-[var(--text-secondary)] px-3 py-1.5 rounded-full border border-[var(--border-color)] text-[12px] flex items-center gap-2 group transition-colors"
                  >
                    {g} 
                    <motion.button 
                      whileHover={{ scale: 1.2 }}
                      onClick={() => removeGoal(i)} 
                      className="cursor-pointer text-[var(--text-muted)] hover:text-red-400 opacity-50 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </motion.button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
          
          <div className="pt-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave} 
              disabled={saving} 
              className={`text-[14px] font-medium px-8 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${saved ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'}`}
            >
              {saving ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Loader2 className="w-4 h-4" />
                </motion.div>
              ) : <Save className="w-4 h-4" />}
              {saved ? 'Saved ✓' : saving ? 'Saving...' : 'Save Profile'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Preferences & Integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 pt-8 border-t divider-subtle">
        {/* Appearance */}
        <motion.div className="flex flex-col">
          <h2 className="label-micro mb-6">Interface</h2>
          <div className="flex items-center justify-between py-4 border-b divider-subtle last:border-0">
            <div>
              <p className="text-[14px] font-medium text-[var(--text-primary)]">Theme Mode</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Toggle dark and light aesthetics</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme} 
              className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isDark ? 'bg-[var(--text-primary)]' : 'bg-[var(--surface-secondary)] border border-[var(--border-color)]'}`}
            >
              <motion.div 
                layout
                className={`w-4 h-4 rounded-full absolute top-1 ${isDark ? 'bg-[var(--background)]' : 'bg-[var(--text-primary)]'}`}
                initial={false}
                animate={{ left: isDark ? '28px' : '4px' }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>
        </motion.div>

        {/* Integrations */}
        <motion.div className="flex flex-col">
          <h2 className="label-micro mb-6">Connections</h2>
          <div className="flex items-center justify-between py-4 border-b divider-subtle last:border-0 group">
            <div>
              <p className="text-[14px] font-medium text-[var(--text-primary)]">Google Calendar</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Sync your schedule</p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-[12px] font-medium px-4 py-1.5 rounded-full border border-[var(--border-color)] hover:border-[var(--text-primary)] transition-colors">Connect</motion.button>
          </div>
          <div className="flex items-center justify-between py-4 border-b divider-subtle last:border-0 group">
            <div>
              <p className="text-[14px] font-medium text-[var(--text-primary)]">Push Notifications</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Context-aware alerts</p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-[12px] font-medium px-4 py-1.5 rounded-full border border-[var(--border-color)] hover:border-[var(--text-primary)] transition-colors">Enable</motion.button>
          </div>
        </motion.div>
      </div>

      {/* Danger Zone */}
      <motion.div variants={fadeUp} className="pt-12 mt-12 border-t divider-subtle flex items-center justify-between">
        <div>
          <h2 className="label-micro text-red-500 mb-2">Danger Zone</h2>
          <p className="text-xs text-[var(--text-muted)]">Log out of your current session.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout} 
          className="text-[13px] font-medium text-red-500 hover:text-white border border-red-500/30 hover:bg-red-500 px-6 py-2 rounded-lg transition-colors"
        >
          Sign Out
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
