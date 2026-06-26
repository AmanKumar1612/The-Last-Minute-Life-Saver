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
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-400">Manage your account and preferences</p>
      </motion.div>

      {/* Profile */}
      <motion.div variants={cardVariants} whileHover="hover" className="glass-card p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-400" /> Profile
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-glass w-full" />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Email</label>
            <input type="email" value={user?.email || ''} className="input-glass w-full opacity-50 cursor-not-allowed" disabled />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Profession</label>
            <input type="text" value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} className="input-glass w-full" placeholder="Student, Developer, etc." />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Productivity Goals</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={goalInput} onChange={(e) => setGoalInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())} className="input-glass flex-1" placeholder="Add a goal" />
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
                    className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-indigo-500/30"
                  >
                    {g} 
                    <motion.button 
                      whileHover={{ scale: 1.2, color: '#f87171' }}
                      onClick={() => removeGoal(i)} 
                      className="cursor-pointer"
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
            className={`btn-primary flex items-center gap-2 mt-4 ${saved ? 'bg-green-500 hover:bg-green-600 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : ''}`}
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
      <motion.div variants={cardVariants} whileHover="hover" className="glass-card p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
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
            <p className="text-sm text-white">Theme Mode</p>
            <p className="text-xs text-slate-400">Toggle between dark and light theme</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme} 
            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isDark ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-600'}`}
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
      <motion.div variants={cardVariants} whileHover="hover" className="glass-card p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-400" /> Integrations
        </h2>
        <div className="space-y-4">
          <motion.div whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.06)' }} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] transition-colors border border-white/[0.02]">
            <div>
              <p className="text-sm text-white">Google Calendar</p>
              <p className="text-xs text-slate-400">Connect for smart scheduling</p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-secondary text-sm">Connect</motion.button>
          </motion.div>
          <motion.div whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.06)' }} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] transition-colors border border-white/[0.02]">
            <div>
              <p className="text-sm text-white">Push Notifications</p>
              <p className="text-xs text-slate-400">Get context-aware reminders</p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-secondary text-sm">Enable</motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={fadeUp} className="glass-card p-6 border border-red-500/20 bg-red-500/5">
        <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" /> Account
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
