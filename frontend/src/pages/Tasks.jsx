import { useState, useEffect } from 'react';
import client from '../api/client';
import { Plus, Trash2, CheckCircle, Clock, AlertTriangle, ChevronDown, Sparkles, X, Loader2 } from 'lucide-react';
import { formatTimeRemaining, capitalizeFirst } from '../utils/helpers';
import { CATEGORIES, IMPORTANCE_LEVELS } from '../utils/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeUp, hoverLift } from '../lib/motion';

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
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="text-sm text-slate-400">{tasks.length} tasks total</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={prioritizeAll} 
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Sparkles className="w-4 h-4 text-purple-400" /> AI Prioritize
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)} 
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> New Task
          </motion.button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex gap-3 flex-wrap">
        <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} className="input-glass py-2 px-4 text-sm w-36">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
        <select value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })} className="input-glass py-2 px-4 text-sm w-36">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{capitalizeFirst(c)}</option>)}
        </select>
      </motion.div>

      {/* Task List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full" 
          />
        </div>
      ) : tasks.length === 0 ? (
        <motion.div variants={fadeUp} className="glass-card p-12 text-center">
          <p className="text-slate-400">No tasks yet. Create your first task!</p>
        </motion.div>
      ) : (
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="space-y-3"
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

  return (
    <motion.div 
      layout
      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.03)' }}
      className={`glass-card p-4 transition-all duration-300 ${isCompleted ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Complete checkbox */}
        <motion.button 
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
          onClick={onComplete} 
          disabled={isCompleted} 
          className={`mt-0.5 flex-shrink-0 cursor-pointer ${isCompleted ? 'text-green-500' : 'text-slate-500 hover:text-green-400'} transition-colors`}
        >
          <CheckCircle className="w-5 h-5" />
        </motion.button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`text-sm font-medium ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>{task.title}</h3>
            {task.priority_label && (
              <span className={`priority-${task.priority_label.toLowerCase()}`}>
                {task.priority_label} {task.priority_score ? `(${task.priority_score})` : ''}
              </span>
            )}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400">{capitalizeFirst(task.category)}</span>
          </div>

          {task.description && <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{task.description}</p>}

          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
            {task.deadline && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 flex-shrink-0" /> {formatTimeRemaining(task.deadline)}
              </span>
            )}
            {task.estimated_hours && <span>{task.estimated_hours}h est.</span>}
            {task.risk_percentage != null && (
              <span className={`flex items-center gap-1 ${task.risk_percentage >= 70 ? 'text-red-400' : task.risk_percentage >= 40 ? 'text-yellow-400' : 'text-green-400'}`}>
                <AlertTriangle className="w-3 h-3 flex-shrink-0" /> {task.risk_percentage}% risk
              </span>
            )}
          </div>

          {/* Subtasks */}
          {task.subtasks?.length > 0 && (
            <div className="mt-3">
              <motion.button 
                whileHover={{ x: 2 }}
                onClick={() => setExpanded(!expanded)} 
                className="text-xs text-indigo-400 flex items-center gap-1 hover:text-indigo-300 transition-colors cursor-pointer"
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
                    className="mt-2 space-y-1.5 pl-2 border-l border-white/5 overflow-hidden"
                  >
                    {task.subtasks.map((st, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div className={`w-3 h-3 rounded-full border flex-shrink-0 ${st.completed ? 'bg-green-500 border-green-500' : 'border-slate-500'}`} />
                        <span className={`min-w-0 ${st.completed ? 'text-slate-400 line-through' : 'text-slate-300'}`}>{st.title}</span>
                        {st.estimated_hours && <span className="text-slate-500 ml-auto flex-shrink-0">{st.estimated_hours}h</span>}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {!isCompleted && !task.subtasks?.length && (
            <motion.button 
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(99,102,241,0.1)' }}
              whileTap={{ scale: 0.9 }}
              onClick={onBreakdown} 
              disabled={breakdownLoading} 
              className="p-2 rounded-lg text-indigo-400 transition-all cursor-pointer" 
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
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(239,68,68,0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={onDelete} 
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 transition-all cursor-pointer"
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
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="glass-card p-6 w-full max-w-lg border border-white/10 shadow-2xl shadow-black/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Create New Task</h2>
          <motion.button 
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-1 block font-medium">Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-glass w-full" placeholder="What needs to be done?" required />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-1 block font-medium">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-glass w-full h-20" placeholder="Add details..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300 mb-1 block font-medium">Deadline</label>
              <input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="input-glass w-full" />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1 block font-medium">Estimated Hours</label>
              <input type="number" step="0.5" min="0" value={form.estimated_hours} onChange={(e) => setForm({ ...form, estimated_hours: e.target.value })} className="input-glass w-full" placeholder="e.g., 3" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300 mb-1 block font-medium">Importance</label>
              <select value={form.importance} onChange={(e) => setForm({ ...form, importance: e.target.value })} className="input-glass w-full">
                {IMPORTANCE_LEVELS.map(l => <option key={l} value={l}>{capitalizeFirst(l)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1 block font-medium">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-glass w-full">
                {CATEGORIES.map(c => <option key={c} value={c}>{capitalizeFirst(c)}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
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
              className="btn-primary flex-1 py-3 gap-2"
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Loader2 className="w-4 h-4" />
                </motion.div>
              ) : <Plus className="w-4 h-4" />}
              {loading ? 'Creating...' : 'Create Task'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
