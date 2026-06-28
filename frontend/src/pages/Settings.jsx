import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Moon, Sun, Bell, Calendar, Shield, Save, Loader2 } from 'lucide-react';
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
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">Settings</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Manage your account and preferences</p>
      </motion.div>

      {/* Profile */}
      <motion.div variants={cardVariants} whileHover="hover" className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight mb-5 flex items-center gap-2">
          <User className="w-[18px] h-[18px] text-[var(--accent-highlight)] flex-shrink-0" /> Profile
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-[13px] font-medium text-[var(--text-muted)] mb-1 block">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-premium w-full" />
          </div>
          <div>
            <label className="text-[13px] font-medium text-[var(--text-muted)] mb-1 block">Email</label>
            <input type="email" value={user?.email || ''} className="input-premium w-full opacity-50 cursor-not-allowed" disabled />
          </div>
          <div>
            <label className="text-[13px] font-medium text-[var(--text-muted)] mb-1 block">Profession</label>
            <input type="text" value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} className="input-premium w-full" placeholder="Student, Developer, etc." />
          </div>
          <div>
            <label className="text-[13px] font-medium text-[var(--text-muted)] mb-1 block">Productivity Goals</label>
            <div className="flex gap-2 mb-3">
              <input type="text" value={goalInput} onChange={(e) => setGoalInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())} className="input-premium flex-1" placeholder="Add a goal" />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addGoal} 
                className="btn-secondary text-sm px-4 cursor-pointer"
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
                    className="bg-[var(--surface-secondary)] text-[var(--text-secondary)] px-3 py-1 rounded border border-[var(--border-color)] text-xs flex items-center gap-1"
                  >
                    {g} 
                    <motion.button 
                      whileHover={{ scale: 1.2, color: '#ef4444' }}
                      onClick={() => removeGoal(i)} 
                      className="cursor-pointer text-[var(--text-muted)] hover:text-red-400"
                    >
                      ×
                    </motion.button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave} 
            disabled={saving} 
            className={`btn-primary flex items-center justify-center gap-2 mt-6 w-full sm:w-auto ${saved ? 'bg-green-500 hover:bg-green-600 border-green-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : ''}`}
          >
            {saving ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Loader2 className="w-4 h-4" />
              </motion.div>
            ) : <Save className="w-4 h-4" />}
            {saved ? 'Saved ✓' : saving ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div variants={cardVariants} whileHover="hover" className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight mb-5 flex items-center gap-2">
          <motion.div
            initial={false}
            animate={{ rotate: isDark ? -180 : 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            {isDark ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
          </motion.div>
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-[var(--text-primary)]">Theme Mode</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Toggle between dark and light theme</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme} 
            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isDark ? 'bg-[var(--accent-primary)] shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'bg-slate-600'}`}
          >
            <motion.div 
              layout
              className="w-5 h-5 rounded-full bg-white absolute top-0.5"
              initial={false}
              animate={{ left: isDark ? '24px' : '2px' }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>
      </motion.div>

      {/* Integrations */}
      <motion.div variants={cardVariants} whileHover="hover" className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight mb-5 flex items-center gap-2">
          <Calendar className="w-[18px] h-[18px] text-[var(--success)] flex-shrink-0" /> Integrations
        </h2>
        <div className="space-y-3">
          <motion.div whileHover={{ x: 4, backgroundColor: 'var(--surface-secondary)' }} className="flex items-center justify-between p-3 rounded-lg bg-[var(--background)] transition-colors border border-[var(--border-color)]">
            <div>
              <p className="text-[13px] font-medium text-[var(--text-primary)]">Google Calendar</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Connect for smart scheduling</p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-secondary text-sm">Connect</motion.button>
          </motion.div>
          <motion.div whileHover={{ x: 4, backgroundColor: 'var(--surface-secondary)' }} className="flex items-center justify-between p-3 rounded-lg bg-[var(--background)] transition-colors border border-[var(--border-color)]">
            <div>
              <p className="text-[13px] font-medium text-[var(--text-primary)]">Push Notifications</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Get context-aware reminders</p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-secondary text-sm">Enable</motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={fadeUp} className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 shadow-sm">
        <h2 className="text-[15px] font-semibold text-[var(--danger)] tracking-tight mb-5 flex items-center gap-2">
          <Shield className="w-[18px] h-[18px]" /> Account
        </h2>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout} 
          className="btn-danger text-sm"
        >
          Sign Out
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
