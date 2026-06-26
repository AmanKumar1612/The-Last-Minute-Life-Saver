import { useState, useEffect } from 'react';
import client from '../api/client';
import { Target, Plus, Trash2, Sparkles, X, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeUp, cardVariants } from '../lib/motion';

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
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Goals</h1>
          <p className="text-sm text-slate-400">Track your long-term goals with AI milestones</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)} 
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> New Goal
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full" />
        </div>
      ) : goals.length === 0 ? (
        <motion.div variants={fadeUp} className="glass-card p-12 text-center border border-white/10">
          <Target className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
          <p className="text-slate-400">No goals yet. Set your first goal!</p>
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {goals.map(goal => (
              <motion.div 
                layout
                key={goal.id} 
                variants={cardVariants} 
                whileHover="hover"
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="glass-card p-6 border border-white/10"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold transition-colors">{goal.title}</h3>
                    {goal.description && <p className="text-xs text-slate-400 mt-1">{goal.description}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    {!goal.milestones?.length && (
                      <motion.button 
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(99,102,241,0.1)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => generateMilestones(goal.id)} 
                        disabled={milestoneLoading[goal.id]} 
                        className="p-2 rounded-lg text-indigo-400 cursor-pointer" 
                        title="AI Generate Milestones"
                      >
                        {milestoneLoading[goal.id] ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                            <Loader2 className="w-4 h-4" />
                          </motion.div>
                        ) : <Sparkles className="w-4 h-4" />}
                      </motion.button>
                    )}
                    <motion.button 
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(239,68,68,0.1)' }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteGoal(goal.id)} 
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Progress</span>
                    <span className="text-xs text-indigo-400 font-medium">{goal.progress || 0}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress || 0}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" 
                    />
                  </div>
                </div>

                {/* Milestones */}
                {goal.milestones?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 font-medium">Milestones</p>
                    {goal.milestones.map((m, i) => (
                      <motion.button 
                        whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.03)' }}
                        whileTap={{ scale: 0.98 }}
                        key={i} 
                        onClick={() => toggleMilestone(goal.id, i)} 
                        className="flex items-center gap-2 w-full text-left p-2 rounded-lg transition-colors cursor-pointer"
                      >
                        <motion.div whileHover={{ scale: 1.2 }}>
                          <CheckCircle className={`w-4 h-4 flex-shrink-0 ${m.completed ? 'text-green-500' : 'text-slate-500'}`} />
                        </motion.div>
                        <span className={`text-xs transition-colors ${m.completed ? 'text-slate-400 line-through' : 'text-slate-300'}`}>{m.title}</span>
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {showForm && <GoalFormModal onClose={() => setShowForm(false)} onSubmit={createGoal} />}
      </AnimatePresence>
    </motion.div>
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="glass-card p-6 w-full max-w-md border border-white/10 shadow-2xl shadow-black/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Create New Goal</h2>
          <motion.button 
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose} 
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Goal Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-glass w-full" placeholder="e.g., Learn Machine Learning" required />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-glass w-full h-20 resize-none" placeholder="What do you want to achieve?" />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Target Date</label>
            <input type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} className="input-glass w-full cursor-pointer" />
          </div>
          <div className="flex gap-3 pt-2">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button" 
              onClick={onClose} 
              className="btn-secondary flex-1"
            >
              Cancel
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={loading} 
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Loader2 className="w-4 h-4" />
                </motion.div>
              ) : <Target className="w-4 h-4" />}
              Create Goal
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
