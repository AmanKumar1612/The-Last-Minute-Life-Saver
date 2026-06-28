import { useState } from 'react';
import client from '../api/client';
import { Siren, Plus, Trash2, Loader2, Clock, AlertTriangle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeUp, hoverLift } from '../lib/motion';

export default function RescueMode() {
  const [deadline, setDeadline] = useState('');
  const [availableHours, setAvailableHours] = useState(4);
  const [tasks, setTasks] = useState([{ title: '', estimated_hours: 1 }]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const addTask = () => setTasks([...tasks, { title: '', estimated_hours: 1 }]);
  const removeTask = (i) => setTasks(tasks.filter((_, idx) => idx !== i));
  const updateTask = (i, field, value) => {
    const updated = [...tasks];
    updated[i] = { ...updated[i], [field]: field === 'estimated_hours' ? parseFloat(value) || 0 : value };
    setTasks(updated);
  };

  const generatePlan = async () => {
    if (!deadline || tasks.some(t => !t.title)) return;
    setLoading(true);
    try {
      const res = await client.post('/ai/rescue-plan', {
        deadline: new Date(deadline).toISOString(),
        tasks: tasks.filter(t => t.title),
        available_hours: availableHours,
      });
      setPlan(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              boxShadow: [
                "0 0 0 0 rgba(239, 68, 68, 0.4)",
                "0 0 0 10px rgba(239, 68, 68, 0)",
                "0 0 0 0 rgba(239, 68, 68, 0)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center"
          >
            <Siren className="w-5 h-5 text-white" />
          </motion.div>
          Emergency Rescue Mode
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-2">About to miss a deadline? Let AI create a recovery plan.</p>
      </motion.div>

      {/* Input Form */}
      <motion.div variants={fadeUp} className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="text-[13px] font-medium text-[var(--text-muted)] mb-1 block">Deadline *</label>
            <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="input-premium w-full cursor-pointer" />
          </div>
          <div>
            <label className="text-[13px] font-medium text-[var(--text-muted)] mb-1 block">Available Hours</label>
            <input type="number" min="0.5" step="0.5" value={availableHours} onChange={(e) => setAvailableHours(parseFloat(e.target.value))} className="input-premium w-full" />
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[13px] font-medium text-[var(--text-muted)]">Remaining Tasks *</label>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addTask} 
              className="text-xs text-[var(--accent-primary)] flex items-center gap-1 hover:text-[var(--accent-highlight)] cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Task
            </motion.button>
          </div>
          <motion.div layout className="space-y-3">
            <AnimatePresence>
              {tasks.map((task, i) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  key={i} 
                  className="flex gap-3 relative"
                >
                  <input type="text" value={task.title} onChange={(e) => updateTask(i, 'title', e.target.value)} className="input-premium flex-1" placeholder="Task name" />
                  <input type="number" min="0.25" step="0.25" value={task.estimated_hours} onChange={(e) => updateTask(i, 'estimated_hours', e.target.value)} className="input-premium w-24" placeholder="Hours" />
                  {tasks.length > 1 && (
                    <motion.button 
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(239,68,68,0.1)' }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeTask(i)} 
                      className="text-[var(--text-muted)] hover:text-[var(--danger)] p-2 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generatePlan} 
          disabled={loading || !deadline || tasks.every(t => !t.title)} 
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-4"
        >
          {loading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Loader2 className="w-4 h-4" />
            </motion.div>
          ) : <Sparkles className="w-4 h-4" />}
          {loading ? 'Generating Rescue Plan...' : 'Generate Rescue Plan'}
        </motion.button>
      </motion.div>

      {/* Rescue Plan Results */}
      <AnimatePresence>
        {plan && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Feasibility */}
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className={`bg-[var(--surface)] p-5 rounded-xl shadow-sm border-l-4 ${plan.is_feasible ? 'border-[var(--success)]' : 'border-[var(--danger)]'}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {plan.is_feasible ? (
                  <span className="text-[var(--success)] text-sm font-semibold">✅ Feasible</span>
                ) : (
                  <span className="text-[var(--danger)] text-sm font-semibold">⚠️ Tight Schedule</span>
                )}
              </div>
              <p className="text-[13px] text-[var(--text-muted)]">{plan.feasibility_note}</p>
            </motion.div>

            {/* Scope Reductions */}
            {plan.scope_reductions?.length > 0 && (
              <motion.div variants={fadeUp} className="bg-[var(--surface)] border border-yellow-500/10 p-5 rounded-xl shadow-sm">
                <h3 className="text-[13px] font-semibold text-yellow-500 mb-3">💡 Suggested Scope Reductions</h3>
                <ul className="space-y-2">
                  {plan.scope_reductions.map((s, i) => (
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={i} 
                      className="text-xs text-[var(--text-muted)] flex items-start gap-2 bg-yellow-500/5 p-2 rounded-lg"
                    >
                      <span className="text-yellow-500 mt-0.5">•</span> {s}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Timeline */}
            <motion.div variants={fadeUp} className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight mb-5 flex items-center gap-2">
                <Clock className="w-[18px] h-[18px] text-[var(--accent-primary)] flex-shrink-0" /> Recovery Timeline
              </h3>
              <div className="relative pl-6">
                <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 via-blue-600 to-slate-600" />
                {plan.timeline?.map((block, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="relative mb-4 last:mb-0"
                  >
                    <div className={`absolute -left-4 w-3 h-3 rounded-full border-2 ${block.type === 'break' ? 'bg-slate-600 border-slate-500' : 'bg-blue-600 border-blue-400'}`} />
                    <motion.div 
                      whileHover={{ x: 4, backgroundColor: block.type === 'break' ? 'var(--surface-secondary)' : 'rgba(37,99,235,0.05)' }}
                      className={`p-4 rounded-lg ml-2 transition-colors duration-300 ${block.type === 'break' ? 'bg-[var(--background)]' : 'bg-blue-600/5 border border-blue-600/10'}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-[var(--text-secondary)]">{block.start_time} - {block.end_time}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded ${block.type === 'break' ? 'bg-[var(--surface-secondary)] text-[var(--text-muted)]' : 'bg-[var(--accent-primary)]/10 text-[var(--accent-highlight)]'}`}>
                          {block.type}
                        </span>
                      </div>
                      <p className={`text-[13px] font-medium ${block.type === 'break' ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>{block.task}</p>
                      {block.focus_tip && <p className="text-xs text-[var(--text-muted)] mt-1.5">{block.focus_tip}</p>}
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Motivation */}
            {plan.motivational_message && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-[var(--surface)] border border-[var(--accent-primary)]/20 p-6 rounded-xl shadow-sm text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-blue-600/5 to-slate-600/5 animate-pulse" />
                <p className="text-[15px] text-[var(--text-primary)] relative z-10 font-semibold">{plan.motivational_message}</p>
                {plan.estimated_completion_time && (
                  <p className="text-[13px] font-medium text-[var(--accent-primary)] mt-2 relative z-10">Estimated completion: {plan.estimated_completion_time}</p>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
