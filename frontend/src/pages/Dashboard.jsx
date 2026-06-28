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

      {/* Asymmetrical Stats Bento */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hero Stat */}
        <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-8 flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-64 h-64 bg-[var(--accent-primary)]/5 rounded-full blur-3xl -mr-20 -mt-20 transition-all duration-700 group-hover:bg-[var(--accent-primary)]/10" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] mb-2 uppercase tracking-widest">Productivity Score</p>
              <p className="text-6xl font-light text-[var(--text-primary)] tracking-tighter">
                <AnimatedNumber value={overview.completion_rate || 0} />%
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[var(--surface-secondary)] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[var(--accent-highlight)]" />
            </div>
          </div>
          <div className="relative z-10 mt-10 flex items-center gap-8 text-sm">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <span className="font-medium text-[var(--text-primary)]">{overview.completed_tasks || 0}</span> Completed</div>
            <div className="flex items-center gap-2 text-[var(--text-secondary)]"><Clock className="w-4 h-4 text-blue-500" /> <span className="font-medium text-[var(--text-primary)]">{overview.pending_tasks || 0}</span> Pending</div>
          </div>
        </div>

        {/* Secondary Stats Vertical Stack */}
        <div className="flex flex-col gap-6">
          <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm flex items-center justify-between flex-1 group">
            <div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Focus Hours</p>
              <p className="text-3xl font-light text-[var(--text-primary)]"><AnimatedNumber value={analytics?.focus_hours?.this_week || 0} />h</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[var(--surface-secondary)] flex items-center justify-center transition-colors group-hover:bg-blue-500/10">
              <Zap className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm flex items-center justify-between flex-1 group">
            <div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Overdue</p>
              <p className="text-3xl font-light text-[var(--danger)]"><AnimatedNumber value={overview.overdue_tasks || 0} /></p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[var(--surface-secondary)] flex items-center justify-center transition-colors group-hover:bg-red-500/10">
              <AlertTriangle className="w-4 h-4 text-[var(--danger)]" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* AI Insights - Vertical spanning */}
        <motion.div variants={cardVariants} whileHover="hover" className="lg:col-span-4 lg:row-span-2 bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6 flex items-center gap-2">
            <Brain className="w-4 h-4 text-[var(--accent-primary)]" /> AI Coach
          </h2>
          {aiInsights?.coaching ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 flex-1">
              <p className="text-[15px] text-[var(--text-primary)] leading-relaxed font-light">"{aiInsights.coaching.nudge}"</p>
              
              {aiInsights.coaching.focus_suggestion && (
                <div className="bg-[var(--surface-secondary)] rounded-xl p-4 border border-[var(--border-color)]">
                  <p className="text-xs font-semibold text-[var(--accent-highlight)] mb-1 uppercase tracking-wider">{aiInsights.coaching.focus_suggestion.technique}</p>
                  <p className="text-[13px] text-[var(--text-secondary)]">{aiInsights.coaching.focus_suggestion.description}</p>
                </div>
              )}

              {aiInsights.coaching.micro_tasks && (
                <div className="mt-auto pt-6 border-t border-[var(--border-color)]">
                  <p className="text-[10px] text-[var(--text-muted)] mb-3 font-bold uppercase tracking-widest">Suggested Micro-Tasks</p>
                  <ul className="space-y-3">
                    {aiInsights.coaching.micro_tasks.slice(0, 3).map((task, i) => (
                      <motion.li 
                        whileHover={{ x: 4, color: 'var(--text-primary)' }}
                        key={i} 
                        className="text-[13px] text-[var(--text-secondary)] flex items-start gap-3 cursor-pointer group"
                      >
                        <span className="w-5 h-5 rounded bg-[var(--surface-secondary)] text-[var(--text-muted)] flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5 group-hover:bg-[var(--accent-primary)]/10 group-hover:text-[var(--accent-highlight)] transition-colors">{i + 1}</span>
                        <span className="min-w-0">{task}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center flex-1 text-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full mb-4" 
              />
              <p className="text-sm text-[var(--text-muted)] animate-pulse">Generating insights...</p>
            </div>
          )}
        </motion.div>

        {/* Today's Tasks */}
        <motion.div variants={cardVariants} whileHover="hover" className="lg:col-span-8 bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm cursor-pointer">
          <h2 className="text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-5 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[var(--accent-highlight)]" /> Today's Priorities
          </h2>
          {todayTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-[var(--surface-secondary)]/30 border border-dashed border-[var(--border-color)] rounded-xl text-center">
              <p className="text-[14px] font-medium text-[var(--text-primary)] mb-1">No tasks for today</p>
              <p className="text-[13px] text-[var(--text-muted)]">Enjoy your free time! 🎉</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {todayTasks.slice(0, 4).map(task => (
                <motion.div 
                  key={task.id}
                  whileHover={{ y: -2, backgroundColor: 'var(--surface-secondary)' }}
                  className="flex flex-col gap-2 p-4 rounded-xl bg-[var(--background)] border border-[var(--border-color)] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-[14px] font-medium text-[var(--text-primary)] truncate pr-4">{task.title}</p>
                    <motion.div 
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${task.priority_label === 'Critical' ? 'bg-red-500' : task.priority_label === 'High' ? 'bg-orange-500' : task.priority_label === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`} 
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">{formatTimeRemaining(task.deadline)}</p>
                    {task.priority_score && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--surface-secondary)] text-[var(--text-secondary)]">
                        {task.priority_score}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

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
        <motion.div variants={cardVariants} whileHover="hover" className="lg:col-span-8 bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-5 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--warning)]" /> Upcoming Deadlines
          </h2>
          {upcomingDeadlines.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1">
              <p className="text-[var(--text-muted)] text-sm">No upcoming deadlines 🎯</p>
            </div>
          ) : (
            <div className="space-y-2 flex-1 flex flex-col justify-center">
              {upcomingDeadlines.slice(0, 4).map(task => (
                <motion.div 
                  key={task.id} 
                  whileHover={{ x: 4, backgroundColor: 'var(--surface-secondary)' }}
                  className="flex items-center justify-between gap-4 py-2 border-b border-[var(--border-color)] last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-[var(--text-primary)] truncate">{task.title}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-[12px] text-[var(--text-muted)] hidden sm:block">{formatDate(task.deadline)}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded flex-shrink-0 whitespace-nowrap ${
                      formatTimeRemaining(task.deadline) === 'Overdue' ? 'bg-red-500/10 text-[var(--danger)] border border-red-500/20' : 'bg-orange-500/10 text-[var(--warning)] border border-orange-500/20'
                    }`}>
                      {formatTimeRemaining(task.deadline)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Goal Progress - Redesigned Asymmetrically */}
      {analytics?.goal_progress?.length > 0 && (
        <motion.div variants={cardVariants} whileHover="hover" className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
          <h2 className="text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="text-emerald-500">🎯</span> Active Goals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Featured Goal (Largest) */}
            {analytics.goal_progress[0] && (
              <div className="md:col-span-7 bg-[var(--surface-secondary)] border border-[var(--border-color)] rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mb-10 pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Primary Focus</p>
                <p className="text-xl font-semibold text-[var(--text-primary)] mb-4">{analytics.goal_progress[0].title}</p>
                <div className="w-full h-1.5 bg-[var(--background)] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${analytics.goal_progress[0].progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-emerald-500 rounded-full" 
                  />
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-[var(--text-muted)] font-medium">
                  <span>{analytics.goal_progress[0].progress}% Complete</span>
                  <span>{analytics.goal_progress[0].milestones_completed}/{analytics.goal_progress[0].milestones_total} milestones</span>
                </div>
              </div>
            )}
            
            {/* Secondary Goals (Stacked) */}
            {analytics.goal_progress.length > 1 && (
              <div className="md:col-span-5 flex flex-col gap-4 justify-center">
                {analytics.goal_progress.slice(1, 4).map(goal => (
                  <div key={goal.id} className="group cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[13px] font-medium text-[var(--text-primary)] truncate pr-4 group-hover:text-[var(--accent-highlight)] transition-colors">{goal.title}</p>
                      <span className="text-[11px] font-bold text-[var(--text-muted)]">{goal.progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-[var(--surface-secondary)] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                        className="h-full bg-[var(--text-secondary)] rounded-full" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}div>
      )}
    </motion.div>
  );
}


