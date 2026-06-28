import { useState, useEffect } from 'react';
import client from '../api/client';
import { Target, Plus, Trash2, Sparkles, X, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeUp, cardVariants } from '../lib/motion';
import Skeleton from '../components/ui/Skeleton';

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
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b divider-subtle">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight mb-2">Objectives</h1>
          <p className="text-[var(--text-muted)] text-sm">Strategic direction and long-term targets.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)} 
          className="text-[13px] font-medium text-[var(--background)] bg-[var(--text-primary)] hover:opacity-90 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors shadow-lg shadow-white/5"
        >
          <Plus className="w-3.5 h-3.5" /> New Objective
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Skeleton variant="rectangular" className="md:col-span-12 lg:col-span-8 h-[250px]" />
          <Skeleton variant="rectangular" className="md:col-span-6 lg:col-span-4 h-[250px]" />
          <Skeleton variant="rectangular" className="md:col-span-6 lg:col-span-4 h-[250px]" />
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-[var(--surface)] border border-dashed border-[var(--border-color)] rounded-xl text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--surface-secondary)] flex items-center justify-center mb-4">
            <Target className="w-6 h-6 text-[var(--text-muted)]" />
          </div>
          <p className="text-[15px] font-medium text-[var(--text-primary)] mb-1">No goals found</p>
          <p className="text-[13px] text-[var(--text-muted)]">Set a new goal to start tracking progress.</p>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <AnimatePresence mode="popLayout">
            {goals.map((goal, index) => (
              <motion.div 
                layout
                key={goal.id} 
                variants={cardVariants} 
                whileHover="hover"
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm flex flex-col relative overflow-hidden group ${
                  index === 0 ? 'md:col-span-12 lg:col-span-8' : 'md:col-span-6 lg:col-span-4'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                {index === 0 && (
                  <div className="absolute right-0 top-0 w-64 h-64 bg-[var(--text-primary)]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-[var(--text-primary)]/10 transition-colors" />
                )}
                
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div>
                    {index === 0 && <p className="label-micro mb-3">Primary Focus</p>}
                    <h3 className={`font-light text-[var(--text-primary)] tracking-tight transition-colors ${index === 0 ? 'text-4xl' : 'text-2xl'}`}>{goal.title}</h3>
                    {goal.description && <p className={`text-[var(--text-secondary)] mt-3 ${index === 0 ? 'text-base max-w-xl' : 'text-[13px] line-clamp-2'}`}>{goal.description}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    {!goal.milestones?.length && (
                      <motion.button 
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(99,102,241,0.1)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => generateMilestones(goal.id)} 
                        disabled={milestoneLoading[goal.id]} 
                        className="p-2 rounded-lg text-[var(--accent-primary)] cursor-pointer" 
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
                      className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8 mt-auto relative z-10">
                  <div className="flex items-end justify-between mb-3">
                    <span className="label-micro">Progress</span>
                    <span className={`text-[var(--text-primary)] font-light tracking-tighter ${index === 0 ? 'text-5xl' : 'text-3xl'}`}>{goal.progress || 0}<span className="text-[var(--text-muted)] text-xl ml-1">%</span></span>
                  </div>
                  <div className={`w-full bg-[var(--surface-secondary)] overflow-hidden ${index === 0 ? 'h-1' : 'h-[1px]'}`}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress || 0}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-[var(--text-primary)]" 
                    />
                  </div>
                </div>

                {/* Milestones */}
                {goal.milestones?.length > 0 && (
                  <div className="space-y-3 relative z-10 border-t divider-subtle pt-6 mt-2">
                    <p className="label-micro">Key Milestones</p>
                    <div className={index === 0 ? "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2" : "space-y-2"}>
                      {goal.milestones.map((m, i) => (
                        <motion.button 
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          key={i} 
                          onClick={() => toggleMilestone(goal.id, i)} 
                          className="flex items-center gap-3 w-full text-left py-2 border-b border-transparent hover:border-[var(--border-color)] transition-all cursor-pointer group"
                        >
                          <motion.div whileHover={{ scale: 1.2 }}>
                            <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${m.completed ? 'text-emerald-500' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'}`} />
                          </motion.div>
                          <span className={`text-[13px] font-medium transition-colors ${m.completed ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>{m.title}</span>
                        </motion.button>
                      ))}
                    </div>
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
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-[var(--surface)] border border-[var(--border-color)] p-8 w-full max-w-md rounded-xl shadow-2xl shadow-black/50"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">Create New Goal</h2>
          <motion.button 
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose} 
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[13px] font-medium text-[var(--text-muted)] mb-1 block">Goal Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-premium w-full" placeholder="e.g., Learn Machine Learning" required />
          </div>
          <div>
            <label className="text-[13px] font-medium text-[var(--text-muted)] mb-1 block">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-premium w-full h-20 resize-none" placeholder="What do you want to achieve?" />
          </div>
          <div>
            <label className="text-[13px] font-medium text-[var(--text-muted)] mb-1 block">Target Date</label>
            <input type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} className="input-premium w-full cursor-pointer" />
          </div>
          <div className="flex gap-3 pt-4">
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
