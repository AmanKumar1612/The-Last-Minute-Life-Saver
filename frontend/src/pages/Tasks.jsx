import { useState, useEffect } from 'react';
import client from '../api/client';
import { Plus, Trash2, CheckCircle, CheckSquare, Clock, AlertTriangle, ChevronDown, Sparkles, X, Loader2 } from 'lucide-react';
import { formatTimeRemaining, capitalizeFirst } from '../utils/helpers';
import { CATEGORIES, IMPORTANCE_LEVELS } from '../utils/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeUp, hoverLift } from '../lib/motion';
import Skeleton from '../components/ui/Skeleton';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ status: '', category: '' });
  const [breakdownLoading, setBreakdownLoading] = useState({});

  useEffect(() => { loadTasks(); }, [filter]);

  const loadTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.set('status', filter.status);
      if (filter.category) params.set('category', filter.category);
      params.set('sort_by', 'priority_score');
      params.set('sort_order', '-1');
      const res = await client.get(`/tasks/list?${params}`);
      setTasks(res.data.tasks || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const createTask = async (data) => {
    await client.post('/tasks/create', data);
    setShowForm(false);
    loadTasks();
  };

  const deleteTask = async (id) => {
    await client.delete(`/tasks/delete/${id}`);
    loadTasks();
  };

  const completeTask = async (id) => {
    await client.patch(`/tasks/${id}/complete`);
    loadTasks();
  };

  const breakdownTask = async (id) => {
    setBreakdownLoading(prev => ({ ...prev, [id]: true }));
    try {
      await client.post(`/ai/breakdown/${id}`);
      loadTasks();
    } catch (err) { console.error(err); }
    finally { setBreakdownLoading(prev => ({ ...prev, [id]: false })); }
  };

  const prioritizeAll = async () => {
    await client.post('/ai/prioritize');
    loadTasks();
  };

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b divider-subtle">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight mb-2">Priority Queue</h1>
          <p className="text-[var(--text-muted)] text-sm">Managing {tasks.length} open objectives.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          <div className="flex gap-2">
            <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} className="bg-transparent text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent hover:border-[var(--border-color)] rounded-full px-3 py-1.5 transition-colors cursor-pointer outline-none">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
            <select value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })} className="bg-transparent text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent hover:border-[var(--border-color)] rounded-full px-3 py-1.5 transition-colors cursor-pointer outline-none">
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{capitalizeFirst(c)}</option>)}
            </select>
          </div>
          <div className="h-4 w-[1px] bg-[var(--border-color)] hidden sm:block mx-1"></div>
          <div className="flex items-center gap-2">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={prioritizeAll} 
              className="text-[13px] font-medium text-blue-500 hover:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" /> AI Prioritize
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)} 
              className="text-[13px] font-medium text-[var(--background)] bg-[var(--text-primary)] hover:opacity-90 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors shadow-lg shadow-white/5"
            >
              <Plus className="w-3.5 h-3.5" /> New Task
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Task List */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton variant="rectangular" className="h-[120px]" />
          <Skeleton variant="rectangular" className="h-[120px]" />
          <Skeleton variant="rectangular" className="h-[120px]" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-[var(--surface)] border border-dashed border-[var(--border-color)] rounded-xl text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--surface-secondary)] flex items-center justify-center mb-4">
            <CheckSquare className="w-6 h-6 text-[var(--text-muted)]" />
          </div>
          <p className="text-[15px] font-medium text-[var(--text-primary)] mb-1">No tasks found</p>
          <p className="text-[13px] text-[var(--text-muted)]">Create your first task to get started.</p>
        </div>
      ) : (
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col"
        >
          <AnimatePresence mode="popLayout">
            {tasks.map(task => (
              <motion.div
                layout
                key={task.id}
                variants={fadeUp}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)', transition: { duration: 0.2 } }}
              >
                <TaskCard
                  task={task}
                  onDelete={() => deleteTask(task.id)}
                  onComplete={() => completeTask(task.id)}
                  onBreakdown={() => breakdownTask(task.id)}
                  breakdownLoading={breakdownLoading[task.id]}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showForm && <TaskFormModal onClose={() => setShowForm(false)} onSubmit={createTask} />}
      </AnimatePresence>
    </motion.div>
  );
}

function TaskCard({ task, onDelete, onComplete, onBreakdown, breakdownLoading }) {
  const [expanded, setExpanded] = useState(false);
  const isCompleted = task.status === 'completed';
  const isCritical = task.priority_label === 'Critical' && !isCompleted;

  return (
    <motion.div 
      layout
      whileHover={{ backgroundColor: 'var(--surface-secondary)' }}
      className={`transition-colors duration-300 relative group border-b divider-subtle last:border-0 py-6 px-4 ${
        isCompleted ? 'opacity-60' : ''
      }`}
    >
      {isCritical && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-[3px] bg-red-500 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity" />}
      
      <div className="flex items-start gap-5">
        {/* Complete checkbox */}
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onComplete} 
          disabled={isCompleted} 
          className={`mt-1 flex-shrink-0 cursor-pointer ${isCompleted ? 'text-emerald-500' : 'text-[var(--border-color)] hover:text-emerald-400 group-hover:text-[var(--text-muted)]'} transition-colors`}
        >
          <CheckCircle className={isCritical ? "w-6 h-6" : "w-5 h-5"} />
        </motion.button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 flex-wrap mb-1">
            <h3 className={`text-lg font-medium tracking-tight ${isCompleted ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
              {task.title}
            </h3>
            {task.priority_label && (
              <span className={`text-[10px] uppercase font-bold tracking-widest ${
                isCritical ? 'text-red-500' : task.priority_label === 'High' ? 'text-orange-500' : task.priority_label === 'Medium' ? 'text-yellow-500' : 'text-emerald-500'
              }`}>
                {task.priority_label} {task.priority_score ? `[${task.priority_score}]` : ''}
              </span>
            )}
          </div>

          {task.description && <p className={`text-[14px] text-[var(--text-secondary)] leading-relaxed mb-4 max-w-3xl line-clamp-2`}>{task.description}</p>}

          <div className="flex items-center gap-6 text-[12px] font-medium text-[var(--text-muted)] flex-wrap">
            <span className="uppercase tracking-widest text-[10px] border border-[var(--border-color)] px-2 py-0.5 rounded-full">{capitalizeFirst(task.category)}</span>
            
            {task.deadline && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {formatTimeRemaining(task.deadline)}
              </span>
            )}
            {task.estimated_hours && <span>{task.estimated_hours}h est.</span>}
            {task.risk_percentage != null && (
              <span className={`flex items-center gap-1.5 ${task.risk_percentage >= 70 ? 'text-[var(--danger)]' : task.risk_percentage >= 40 ? 'text-[var(--warning)]' : 'text-emerald-500'}`}>
                <AlertTriangle className="w-3.5 h-3.5" /> {task.risk_percentage}% risk
              </span>
            )}
          </div>

          {/* Subtasks */}
          {task.subtasks?.length > 0 && (
            <div className="mt-4">
              <motion.button 
                whileHover={{ x: 2 }}
                onClick={() => setExpanded(!expanded)} 
                className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-primary)] flex items-center gap-1 hover:text-[var(--accent-highlight)] transition-colors cursor-pointer"
              >
                <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
                  <ChevronDown className="w-3 h-3" />
                </motion.div>
                {task.subtasks.length} subtasks
              </motion.button>
              <AnimatePresence>
                {expanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 space-y-2 pl-3 border-l-2 border-[var(--border-color)] overflow-hidden"
                  >
                    {task.subtasks.map((st, i) => (
                      <div key={i} className="flex items-center gap-3 text-[13px]">
                        <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${st.completed ? 'bg-emerald-500 border-emerald-500' : 'border-[var(--text-muted)]'}`} />
                        <span className={`min-w-0 ${st.completed ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-primary)] font-medium'}`}>{st.title}</span>
                        {st.estimated_hours && <span className="text-[var(--text-muted)] ml-auto flex-shrink-0 font-bold">{st.estimated_hours}h</span>}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Actions - Appear on hover */}
        <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
          {!isCompleted && !task.subtasks?.length && (
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onBreakdown} 
              disabled={breakdownLoading} 
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white transition-colors cursor-pointer border border-transparent hover:border-[var(--accent-highlight)]" 
              title="AI Breakdown"
            >
              {breakdownLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Loader2 className="w-4 h-4" />
                </motion.div>
              ) : <Sparkles className="w-4 h-4" />}
            </motion.button>
          )}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDelete} 
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-red-500 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function TaskFormModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ title: '', description: '', deadline: '', estimated_hours: '', importance: 'medium', category: 'other' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = { ...form };
    if (data.deadline) data.deadline = new Date(data.deadline).toISOString();
    if (data.estimated_hours) data.estimated_hours = parseFloat(data.estimated_hours);
    else delete data.estimated_hours;
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
        className="bg-[var(--surface)] border border-[var(--border-color)] p-8 rounded-xl w-full max-w-3xl shadow-2xl shadow-black/50"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-light text-[var(--text-primary)] tracking-tight">Create New Task</h2>
          <motion.button 
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose} 
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer w-8 h-8 flex items-center justify-center rounded-full bg-[var(--surface-secondary)]"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column - Main Details */}
            <div className="flex-1 space-y-6">
              <div>
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 block">Task Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-glass w-full text-lg py-3" placeholder="What needs to be done?" required />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-glass w-full min-h-[180px] resize-none" placeholder="Add context, details, or notes..." />
              </div>
            </div>

            {/* Right Column - Metadata */}
            <div className="w-full md:w-64 space-y-5">
              <div className="p-5 rounded-xl bg-[var(--surface-secondary)]/30 border border-[var(--border-color)] space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 flex items-center gap-1.5"><Clock className="w-3 h-3"/> Deadline</label>
                  <input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="input-glass w-full text-[13px] py-2 px-3" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 block">Est. Hours</label>
                  <input type="number" step="0.5" min="0" value={form.estimated_hours} onChange={(e) => setForm({ ...form, estimated_hours: e.target.value })} className="input-glass w-full text-[13px] py-2 px-3" placeholder="e.g., 3" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3 text-[var(--warning)]"/> Importance</label>
                  <select value={form.importance} onChange={(e) => setForm({ ...form, importance: e.target.value })} className="input-glass w-full text-[13px] py-2 px-3">
                    {IMPORTANCE_LEVELS.map(l => <option key={l} value={l}>{capitalizeFirst(l)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 block">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-glass w-full text-[13px] py-2 px-3">
                    {CATEGORIES.map(c => <option key={c} value={c}>{capitalizeFirst(c)}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 mt-6 border-t border-[var(--border-color)]">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button" 
              onClick={onClose} 
              className="btn-secondary flex-1 py-3"
            >
              Cancel
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={loading} 
              className="btn-primary flex-[2] py-3 gap-2"
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Loader2 className="w-4 h-4" />
                </motion.div>
              ) : <Plus className="w-4 h-4" />}
              {loading ? 'Creating Task...' : 'Create Task'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
