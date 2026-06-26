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
          className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full" 
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
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="gradient-text">{user?.name?.split(' ')[0] || 'there'}</span> 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">Here's your productivity overview</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Completed" value={overview.completed_tasks || 0} subtitle={`${overview.completion_rate || 0}% rate`} gradient="from-green-500 to-emerald-600" />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Pending" value={overview.pending_tasks || 0} subtitle={`${overview.streak_days || 0} day streak`} gradient="from-blue-500 to-cyan-600" />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Overdue" value={overview.overdue_tasks || 0} subtitle="Need attention" gradient="from-red-500 to-rose-600" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Focus Hours" value={`${analytics?.focus_hours?.this_week || 0}h`} subtitle="This week" gradient="from-purple-500 to-indigo-600" isHours />
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <motion.div variants={cardVariants} whileHover="hover" className="lg:col-span-2 glass-card p-6 cursor-pointer">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400 flex-shrink-0 animate-pulse" /> Today's Tasks
          </h2>
          {todayTasks.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No tasks for today. Enjoy your free time! 🎉</p>
          ) : (
            <div className="space-y-3">
              {todayTasks.slice(0, 5).map(task => (
                <motion.div 
                  key={task.id}
                  whileHover={{ x: 6, backgroundColor: 'rgba(255,255,255,0.06)' }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.02]"
                >
                  <motion.div 
                    whileHover={{ scale: 1.2 }}
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${task.priority_label === 'Critical' ? 'bg-red-500 shadow-md shadow-red-500/30' : task.priority_label === 'High' ? 'bg-orange-500 shadow-md shadow-orange-500/30' : task.priority_label === 'Medium' ? 'bg-yellow-500 shadow-md shadow-yellow-500/30' : 'bg-green-500 shadow-md shadow-green-500/30'}`} 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate transition-colors duration-300">{task.title}</p>
                    <p className="text-xs text-slate-400">{formatTimeRemaining(task.deadline)}</p>
                  </div>
                  {task.priority_score && (
                    <span className="text-xs font-medium px-2 py-1 rounded-lg bg-white/5 text-slate-300 flex-shrink-0 transition-all duration-300">
                      {task.priority_score}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* AI Insights */}
        <motion.div variants={cardVariants} whileHover="hover" className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400 flex-shrink-0 animate-float" /> AI Coach
          </h2>
          {aiInsights?.coaching ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed">{aiInsights.coaching.nudge}</p>
              {aiInsights.coaching.micro_tasks && (
                <div>
                  <p className="text-xs text-slate-400 mb-2 font-medium">Quick wins:</p>
                  <ul className="space-y-2">
                    {aiInsights.coaching.micro_tasks.slice(0, 3).map((task, i) => (
                      <motion.li 
                        whileHover={{ x: 4, color: '#fff' }}
                        key={i} 
                        className="text-xs text-slate-300 flex items-start gap-2 cursor-pointer"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">{i + 1}</span>
                        <span className="min-w-0">{task}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
              {aiInsights.coaching.focus_suggestion && (
                <motion.div whileHover={{ scale: 1.02 }} className="bg-indigo-500/10 rounded-xl p-3 border border-indigo-500/10">
                  <p className="text-xs text-indigo-400 font-medium">{aiInsights.coaching.focus_suggestion.technique}</p>
                  <p className="text-xs text-slate-400 mt-1">{aiInsights.coaching.focus_suggestion.description}</p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <div className="py-8 text-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full mx-auto mb-3" 
              />
              <p className="text-sm text-slate-400 animate-pulse">Loading AI insights...</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Charts Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Productivity */}
        <motion.div variants={cardVariants} whileHover="hover" className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400 flex-shrink-0" /> Weekly Productivity
          </h2>
          <div className="w-full h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="tasks_completed" fill="url(#barGradient)" radius={[6, 6, 0, 0]} animationDuration={1500} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div variants={cardVariants} whileHover="hover" className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-400 flex-shrink-0 animate-pulse" /> Upcoming Deadlines
          </h2>
          {upcomingDeadlines.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No upcoming deadlines 🎯</p>
          ) : (
            <div className="space-y-3">
              {upcomingDeadlines.map(task => (
                <motion.div 
                  key={task.id} 
                  whileHover={{ x: 6, backgroundColor: 'rgba(255,255,255,0.06)' }}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.02]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white truncate transition-colors duration-300">{task.title}</p>
                    <p className="text-xs text-slate-400">{formatDate(task.deadline)}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-lg flex-shrink-0 whitespace-nowrap transition-transform duration-300 ${
                    formatTimeRemaining(task.deadline) === 'Overdue' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
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
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" 
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1.5"><AnimatedNumber value={goal.progress} />% · {goal.milestones_completed}/{goal.milestones_total} milestones</p>
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
      className="glass-card p-5 flex items-center gap-4 cursor-pointer"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
        <span className="text-white">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-white transition-colors duration-300">
          <AnimatedNumber value={value} />{isHours && 'h'}
        </p>
        <p className="text-xs text-slate-400 truncate">{label} · {subtitle}</p>
      </div>
    </motion.div>
  );
}
