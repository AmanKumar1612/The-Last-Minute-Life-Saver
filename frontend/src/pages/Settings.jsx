import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Moon, Sun, Bell, Calendar, Shield, Save, Loader2 } from 'lucide-react';

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
    <div className="space-y-6 animate-fade-in-up max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-400">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-400" /> Profile
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-glass" />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Email</label>
            <input type="email" value={user?.email || ''} className="input-glass opacity-50" disabled />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Profession</label>
            <input type="text" value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} className="input-glass" placeholder="Student, Developer, etc." />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Productivity Goals</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={goalInput} onChange={(e) => setGoalInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())} className="input-glass flex-1" placeholder="Add a goal" />
              <button onClick={addGoal} className="btn-secondary text-sm px-4">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.productivity_goals.map((g, i) => (
                <span key={i} className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                  {g} <button onClick={() => removeGoal(i)} className="hover:text-red-400">×</button>
                </span>
              ))}
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved ✓' : saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Appearance */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          {isDark ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-yellow-400" />} Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Dark Mode</p>
            <p className="text-xs text-slate-400">Toggle between dark and light theme</p>
          </div>
          <button onClick={toggleTheme} className={`w-12 h-6 rounded-full relative transition-all ${isDark ? 'bg-indigo-500' : 'bg-slate-600'}`}>
            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${isDark ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Integrations */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-400" /> Integrations
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
            <div>
              <p className="text-sm text-white">Google Calendar</p>
              <p className="text-xs text-slate-400">Connect for smart scheduling</p>
            </div>
            <button className="btn-secondary text-sm">Connect</button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
            <div>
              <p className="text-sm text-white">Push Notifications</p>
              <p className="text-xs text-slate-400">Get context-aware reminders</p>
            </div>
            <button className="btn-secondary text-sm">Enable</button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-6 border border-red-500/10">
        <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" /> Account
        </h2>
        <button onClick={logout} className="btn-danger text-sm">Sign Out</button>
      </div>
    </div>
  );
}
