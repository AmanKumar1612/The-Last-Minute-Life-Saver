import { useState, useEffect } from 'react';
import client from '../api/client';
import { Target, Plus, Trash2, Sparkles, X, Loader2, CheckCircle } from 'lucide-react';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [milestoneLoading, setMilestoneLoading] = useState({});

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    try {
      const res = await client.get('/goals/list');
      setGoals(res.data.goals || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const createGoal = async (data) => {
    await client.post('/goals/create', data);
    setShowForm(false);
    loadGoals();
  };

  const deleteGoal = async (id) => {
    await client.delete(`/goals/delete/${id}`);
    loadGoals();
  };

  const generateMilestones = async (id) => {
    setMilestoneLoading({ ...milestoneLoading, [id]: true });
    try {
      await client.post(`/goals/${id}/generate-milestones`);
      loadGoals();
    } catch (err) { console.error(err); }
    finally { setMilestoneLoading({ ...milestoneLoading, [id]: false }); }
  };

  const toggleMilestone = async (goalId, milestoneIdx) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const milestones = [...goal.milestones];
    milestones[milestoneIdx] = { ...milestones[milestoneIdx], completed: !milestones[milestoneIdx].completed };
    await client.put(`/goals/update/${goalId}`, { milestones });
    loadGoals();
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Goals</h1>
          <p className="text-sm text-slate-400">Track your long-term goals with AI milestones</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>
      ) : goals.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Target className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
          <p className="text-slate-400">No goals yet. Set your first goal!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map(goal => (
            <div key={goal.id} className="glass-card p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold">{goal.title}</h3>
                  {goal.description && <p className="text-xs text-slate-400 mt-1">{goal.description}</p>}
                </div>
                <div className="flex items-center gap-1">
                  {!goal.milestones?.length && (
                    <button onClick={() => generateMilestones(goal.id)} disabled={milestoneLoading[goal.id]} className="p-2 rounded-lg hover:bg-indigo-500/10 text-indigo-400" title="AI Generate Milestones">
                      {milestoneLoading[goal.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    </button>
                  )}
                  <button onClick={() => deleteGoal(goal.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">Progress</span>
                  <span className="text-xs text-indigo-400 font-medium">{goal.progress || 0}%</span>
                </div>
                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700" style={{ width: `${goal.progress || 0}%` }} />
                </div>
              </div>

              {/* Milestones */}
              {goal.milestones?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400 font-medium">Milestones</p>
                  {goal.milestones.map((m, i) => (
                    <button key={i} onClick={() => toggleMilestone(goal.id, i)} className="flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-white/[0.03] transition-all">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${m.completed ? 'text-green-500' : 'text-slate-500'}`} />
                      <span className={`text-xs ${m.completed ? 'text-slate-400 line-through' : 'text-slate-300'}`}>{m.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && <GoalFormModal onClose={() => setShowForm(false)} onSubmit={createGoal} />}
    </div>
  );
}

function GoalFormModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ title: '', description: '', target_date: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = { ...form };
    if (data.target_date) data.target_date = new Date(data.target_date).toISOString();
    else delete data.target_date;
    await onSubmit(data);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-card p-6 w-full max-w-md animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Create New Goal</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Goal Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-glass" placeholder="e.g., Learn Machine Learning" required />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-glass h-20 resize-none" placeholder="What do you want to achieve?" />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Target Date</label>
            <input type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} className="input-glass" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
              Create Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
