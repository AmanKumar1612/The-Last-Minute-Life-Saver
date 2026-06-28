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
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b divider-subtle mb-12">
        <div className="flex items-center gap-4">
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
            className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30"
          >
            <Siren className="w-5 h-5 text-red-500" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight mb-2">Rescue Protocol</h1>
            <p className="text-[var(--text-muted)] text-sm">AI-generated emergency recovery plans.</p>
          </div>
        </div>
      </motion.div>

      {/* Input Form */}
      <motion.div variants={fadeUp} className="flex flex-col mb-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          <div className="md:col-span-5 space-y-8">
            <h2 className="label-micro mb-6">Constraints</h2>
            <div>
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">Hard Deadline *</label>
              <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="input-glass w-full text-[14px] py-3 bg-[var(--background)] cursor-pointer" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 block">Available Hours</label>
              <input type="number" min="0.5" step="0.5" value={availableHours} onChange={(e) => setAvailableHours(parseFloat(e.target.value))} className="input-glass w-full text-[14px] py-3 bg-[var(--background)]" />
            </div>
            
            <div className="pt-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generatePlan} 
                disabled={loading || !deadline || tasks.every(t => !t.title)} 
                className="text-[14px] font-medium px-8 py-4 rounded-lg flex items-center justify-center gap-2 transition-colors bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 w-full"
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Loader2 className="w-4 h-4" />
                  </motion.div>
                ) : <Sparkles className="w-4 h-4" />}
                {loading ? 'Synthesizing...' : 'Generate Rescue Plan'}
              </motion.button>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="label-micro">Pending Objectives *</h2>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addTask} 
                className="text-[12px] font-medium text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--text-primary)] px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add Item
              </motion.button>
            </div>
            <motion.div layout className="flex flex-col">
              <AnimatePresence>
                {tasks.map((task, i) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    key={i} 
                    className="flex gap-3 relative py-3 border-b divider-subtle last:border-0"
                  >
                    <input type="text" value={task.title} onChange={(e) => updateTask(i, 'title', e.target.value)} className="bg-transparent border-none text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none flex-1" placeholder="Task name..." />
                    <div className="flex items-center gap-2 border border-[var(--border-color)] rounded-lg px-2 py-1 focus-within:border-[var(--text-primary)] transition-colors">
                      <input type="number" min="0.25" step="0.25" value={task.estimated_hours} onChange={(e) => updateTask(i, 'estimated_hours', e.target.value)} className="bg-transparent border-none text-[13px] text-[var(--text-primary)] w-12 text-center focus:outline-none" placeholder="Hrs" />
                      <span className="text-[10px] text-[var(--text-muted)] uppercase">hrs</span>
                    </div>
                    {tasks.length > 1 && (
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeTask(i)} 
                        className="text-[var(--text-muted)] hover:text-red-500 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-red-500/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Rescue Plan Results */}
      <AnimatePresence>
        {plan && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col border-t divider-subtle pt-12 mt-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              
              {/* Left Column: Feasibility & Motivation */}
              <div className="lg:col-span-4 space-y-8">
                {/* Feasibility */}
                <motion.div 
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className={`border-l-2 pl-4 py-1 ${plan.is_feasible ? 'border-[var(--text-primary)]' : 'border-red-500'}`}
                >
                  <h3 className={`text-[12px] font-bold uppercase tracking-widest mb-2 ${plan.is_feasible ? 'text-[var(--text-primary)]' : 'text-red-500'}`}>
                    {plan.is_feasible ? 'Feasible' : 'Tight Schedule'}
                  </h3>
                  <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">{plan.feasibility_note}</p>
                </motion.div>

                {/* Scope Reductions */}
                {plan.scope_reductions?.length > 0 && (
                  <motion.div variants={fadeUp} className="border-l-2 border-yellow-500/50 pl-4 py-1">
                    <h3 className="text-[12px] font-bold uppercase tracking-widest text-yellow-500 mb-3">Scope Reductions</h3>
                    <ul className="space-y-3">
                      {plan.scope_reductions.map((s, i) => (
                        <motion.li 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          key={i} 
                          className="text-[13px] text-[var(--text-secondary)] flex items-start gap-2"
                        >
                          <span className="text-yellow-500 mt-0.5 opacity-50">—</span> {s}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Motivation */}
                {plan.motivational_message && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="pt-8 mt-8 border-t divider-subtle"
                  >
                    <p className="text-[15px] text-[var(--text-primary)] font-light italic leading-relaxed">"{plan.motivational_message}"</p>
                    {plan.estimated_completion_time && (
                      <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-4">Est. Completion: {plan.estimated_completion_time}</p>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Right Column: Timeline */}
              <div className="lg:col-span-8">
                <motion.div variants={fadeUp} className="flex flex-col">
                  <h2 className="label-micro mb-8">Recovery Timeline</h2>
                  <div className="relative">
                    <div className="absolute left-[3px] top-2 bottom-2 w-[1px] bg-[var(--border-color)]" />
                    <div className="space-y-6">
                      {plan.timeline?.map((block, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          key={i} 
                          className="relative flex items-start gap-6 group"
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 z-10 transition-colors duration-300 ${block.type === 'break' ? 'bg-[var(--border-color)] group-hover:bg-[var(--text-muted)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-[12px] font-mono text-[var(--text-muted)]">{block.start_time} - {block.end_time}</span>
                              <span className={`text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded ${block.type === 'break' ? 'bg-[var(--surface-secondary)] text-[var(--text-muted)]' : 'bg-red-500/10 text-red-400'}`}>
                                {block.type}
                              </span>
                            </div>
                            <p className={`text-[15px] font-medium transition-colors ${block.type === 'break' ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>{block.task}</p>
                            {block.focus_tip && <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 line-clamp-2">{block.focus_tip}</p>}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
