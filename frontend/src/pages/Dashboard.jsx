import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, Zap, Brain, BarChart3 } from 'lucide-react';
import { formatTimeRemaining, formatDate } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, animate, useMotionValue, useTransform } from 'framer-motion';
import { staggerContainer, fadeUp, cardVariants, hoverLift } from '../lib/motion';

function AnimatedNumber({ value }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) || 0 : value;
    const controls = animate(count, numericValue, { duration: 1.5, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  if (typeof value === 'string' && value.includes('h')) {
    return <motion.span>{rounded}</motion.span>;
  }
  return <motion.span>{rounded}</motion.span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [tasksRes, analyticsRes] = await Promise.all([
        client.get('/tasks/list?sort_by=priority_score&sort_order=-1&limit=10'),
        client.get('/analytics').catch(() => ({ data: null })),
      ]);
      setTasks(tasksRes.data.tasks || []);
      setAnalytics(analyticsRes.data);

      client.post('/ai/coach').then(res => setAiInsights(res.data)).catch(() => {});
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const overview = analytics?.overview || {};
  const weeklyData = analytics?.weekly_productivity || [];

  const todayTasks = tasks.filter(t => {
    if (!t.deadline) return t.status !== 'completed';
    const dl = new Date(t.deadline);
    const today = new Date();
    return dl.toDateString() === today.toDateString() && t.status !== 'completed';
  });

  const upcomingDeadlines = tasks
    .filter(t => t.deadline && t.status !== 'completed')
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full" 
        />
      </div>
    );
  }

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Greeting */}
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="text-[var(--accent-primary)]">{user?.name?.split(' ')[0] || 'there'}</span> 👋
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">Here's your productivity overview</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Completed" value={overview.completed_tasks || 0} subtitle={`${overview.completion_rate || 0}% rate`} gradient="from-green-500 to-emerald-600" />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Pending" value={overview.pending_tasks || 0} subtitle={`${overview.streak_days || 0} day streak`} gradient="from-blue-500 to-cyan-600" />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Overdue" value={overview.overdue_tasks || 0} subtitle="Need attention" gradient="from-red-500 to-rose-600" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Focus Hours" value={`${analytics?.focus_hours?.this_week || 0}h`} subtitle="This week" gradient="from-blue-600 to-blue-700" isHours />
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <motion.div variants={cardVariants} whileHover="hover" className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm cursor-pointer">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight mb-5 flex items-center gap-2">
            <Zap className="w-[18px] h-[18px] text-[var(--accent-highlight)] flex-shrink-0" /> Today's Tasks
          </h2>
          {todayTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-[var(--surface-secondary)]/30 border border-dashed border-[var(--border-color)] rounded-xl text-center">
              <p className="text-[14px] font-medium text-[var(--text-primary)] mb-1">No tasks for today</p>
              <p className="text-[13px] text-[var(--text-muted)]">Enjoy your free time! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTasks.slice(0, 5).map(task => (
                <motion.div 
                  key={task.id}
                  whileHover={{ x: 4, backgroundColor: 'var(--surface-secondary)' }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[var(--background)] border border-[var(--border-color)]"
                >
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${task.priority_label === 'Critical' ? 'bg-red-500' : task.priority_label === 'High' ? 'bg-orange-500' : task.priority_label === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`} 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">{task.title}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{formatTimeRemaining(task.deadline)}</p>
                  </div>
                  {task.priority_score && (
                    <span className="text-xs font-medium px-2 py-1 rounded bg-[var(--surface-secondary)] text-[var(--text-secondary)] flex-shrink-0">
                      {task.priority_score}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* AI Insights */}
        <motion.div variants={cardVariants} whileHover="hover" className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight mb-5 flex items-center gap-2">
            <Brain className="w-[18px] h-[18px] text-[var(--accent-primary)] flex-shrink-0" /> AI Coach
          </h2>
          {aiInsights?.coaching ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{aiInsights.coaching.nudge}</p>
              {aiInsights.coaching.micro_tasks && (
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-2 font-medium">Quick wins:</p>
                  <ul className="space-y-2">
                    {aiInsights.coaching.micro_tasks.slice(0, 3).map((task, i) => (
                      <motion.li 
                        whileHover={{ x: 4, color: '#fff' }}
                        key={i} 
                        className="text-[13px] text-[var(--text-muted)] flex items-start gap-2 cursor-pointer"
                      >
                        <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">{i + 1}</span>
                        <span className="min-w-0">{task}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
              {aiInsights.coaching.focus_suggestion && (
                <motion.div whileHover={{ scale: 1.02 }} className="bg-blue-600/10 rounded-xl p-3 border border-blue-600/10">
                  <p className="text-xs text-blue-400 font-medium">{aiInsights.coaching.focus_suggestion.technique}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{aiInsights.coaching.focus_suggestion.description}</p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <div className="py-8 text-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full mx-auto mb-3" 
              />
              <p className="text-sm text-[var(--text-muted)] animate-pulse">Loading AI insights...</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Charts Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Productivity */}
        <motion.div variants={cardVariants} whileHover="hover" className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight mb-5 flex items-center gap-2">
            <BarChart3 className="w-[18px] h-[18px] text-[var(--accent-secondary)] flex-shrink-0" /> Weekly Productivity
          </h2>
          <div className="w-full h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                <Bar dataKey="tasks_completed" fill="url(#barGradient)" radius={[4, 4, 0, 0]} animationDuration={1500} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-primary)" />
                    <stop offset="100%" stopColor="var(--accent-highlight)" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div variants={cardVariants} whileHover="hover" className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight mb-5 flex items-center gap-2">
            <Clock className="w-[18px] h-[18px] text-[var(--warning)] flex-shrink-0" /> Upcoming Deadlines
          </h2>
          {upcomingDeadlines.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm py-8">No upcoming deadlines 🎯</p>
          ) : (
            <div className="space-y-3">
              {upcomingDeadlines.map(task => (
                <motion.div 
                  key={task.id} 
                  whileHover={{ x: 4, backgroundColor: 'var(--surface-secondary)' }}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[var(--background)] border border-[var(--border-color)]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">{task.title}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{formatDate(task.deadline)}</p>
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded flex-shrink-0 whitespace-nowrap ${
                    formatTimeRemaining(task.deadline) === 'Overdue' ? 'bg-red-500/10 text-[var(--danger)] border border-red-500/20' : 'bg-orange-500/10 text-[var(--warning)] border border-orange-500/20'
                  }`}>
                    {formatTimeRemaining(task.deadline)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Goal Progress */}
      {analytics?.goal_progress?.length > 0 && (
        <motion.div variants={cardVariants} whileHover="hover" className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-green-400">🎯</span> Goal Progress
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.goal_progress.map(goal => (
              <motion.div 
                key={goal.id} 
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.02] cursor-pointer"
              >
                <p className="text-sm text-white font-medium mb-2 truncate transition-colors duration-300">{goal.title}</p>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-600 rounded-full" 
                  />
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1.5"><AnimatedNumber value={goal.progress} />% · {goal.milestones_completed}/{goal.milestones_total} milestones</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function StatCard({ icon, label, value, subtitle, gradient, isHours }) {
  return (
    <motion.div 
      variants={hoverLift}
      initial="rest"
      whileHover="hover"
      className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6 flex items-center gap-4 cursor-pointer shadow-sm"
    >
      <div className={`w-10 h-10 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border-color)] flex items-center justify-center flex-shrink-0`}>
        <span className="text-[var(--text-primary)]">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
          <AnimatedNumber value={value} />{isHours && 'h'}
        </p>
        <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{label} · {subtitle}</p>
      </div>
    </motion.div>
  );
}
