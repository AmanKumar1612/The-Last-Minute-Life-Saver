import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, Zap, Brain, BarChart3 } from 'lucide-react';
import { formatTimeRemaining, formatDate } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, animate, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeUp, cardVariants, hoverLift, viewportChart, editorialReveal } from '../lib/motion';
import Skeleton from '../components/ui/Skeleton';

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

  if (loading) return (
    <div className="space-y-6">
      <Skeleton variant="rectangular" className="w-[200px] h-8 mb-2" />
      <Skeleton variant="rectangular" className="w-[300px] h-4 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Skeleton variant="rectangular" className="lg:col-span-4 lg:row-span-2 h-[400px]" />
        <Skeleton variant="rectangular" className="lg:col-span-8 h-[200px]" />
        <Skeleton variant="rectangular" className="lg:col-span-8 h-[200px]" />
      </div>
    </div>
  );

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Greeting */}
      <motion.div variants={editorialReveal} className="mb-12">
        <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="font-medium">{user?.name?.split(' ')[0] || 'there'}</span>.
        </h1>
        <p className="text-[var(--text-muted)] mt-2">Here is your operational overview.</p>
      </motion.div>

      {/* Asymmetrical Stats Bento - Borderless */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-0 border-y divider-subtle mb-16">
        {/* Hero Stat */}
        <div className="lg:col-span-2 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r divider-subtle flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-[var(--accent-primary)]/5 rounded-full blur-3xl -mr-40 -mt-40 transition-all duration-700 group-hover:bg-[var(--accent-primary)]/10" />
          <div className="relative z-10 flex flex-col items-start h-full justify-center">
            <p className="label-micro mb-4">Productivity Score</p>
            <p className="text-editorial-hero text-[var(--text-primary)] -ml-1">
              <AnimatedNumber value={overview.completion_rate || 0} /><span className="text-3xl lg:text-5xl text-[var(--text-muted)] ml-1">%</span>
            </p>
          </div>
          <div className="relative z-10 mt-12 flex items-center gap-12 text-sm">
            <div className="flex flex-col gap-1 text-[var(--text-secondary)]"><span className="label-micro">Completed</span> <span className="font-medium text-xl text-[var(--text-primary)]">{overview.completed_tasks || 0}</span></div>
            <div className="flex flex-col gap-1 text-[var(--text-secondary)]"><span className="label-micro">Pending</span> <span className="font-medium text-xl text-[var(--text-primary)]">{overview.pending_tasks || 0}</span></div>
          </div>
        </div>

        {/* Secondary Stats Vertical Stack */}
        <div className="flex flex-col">
          <div className="p-8 lg:p-12 border-b divider-subtle flex flex-col justify-center flex-1 group hover:bg-[var(--surface-secondary)] transition-colors">
            <div className="flex justify-between items-start w-full">
              <div>
                <p className="label-micro mb-2">Focus Hours</p>
                <p className="text-5xl font-light text-[var(--text-primary)] tracking-tighter"><AnimatedNumber value={analytics?.focus_hours?.this_week || 0} /><span className="text-xl text-[var(--text-muted)] ml-1">h</span></p>
              </div>
            </div>
          </div>
          <div className="p-8 lg:p-12 flex flex-col justify-center flex-1 group hover:bg-[var(--surface-secondary)] transition-colors">
            <div className="flex justify-between items-start w-full">
              <div>
                <p className="label-micro mb-2">Overdue Tasks</p>
                <p className="text-5xl font-light text-[var(--danger)] tracking-tighter"><AnimatedNumber value={overview.overdue_tasks || 0} /></p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Grid - Borderless layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-24">
        {/* AI Insights - Editorial Pull Quote */}
        <motion.div variants={fadeUp} className="lg:col-span-5 flex flex-col relative">
          <h2 className="label-micro mb-8">AI Intelligence</h2>
          {aiInsights?.coaching ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 flex-1">
              <p className="text-2xl lg:text-3xl text-[var(--text-primary)] leading-tight font-light italic tracking-tight text-balance">
                "{aiInsights.coaching.nudge}"
              </p>
              
              {aiInsights.coaching.focus_suggestion && (
                <div className="pl-6 border-l-2 divider-subtle mt-8">
                  <p className="label-micro mb-2">{aiInsights.coaching.focus_suggestion.technique}</p>
                  <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">{aiInsights.coaching.focus_suggestion.description}</p>
                </div>
              )}

              {aiInsights.coaching.micro_tasks && (
                <div className="mt-8 pt-8 border-t divider-subtle">
                  <p className="label-micro mb-6">Suggested Actions</p>
                  <ul className="space-y-4">
                    {aiInsights.coaching.micro_tasks.slice(0, 3).map((task, i) => (
                      <li key={i} className="text-[14px] text-[var(--text-secondary)] flex items-start gap-4">
                        <span className="text-[10px] font-bold mt-1 text-[var(--text-muted)]">0{i + 1}</span>
                        <span className="min-w-0">{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="py-12 flex flex-col items-start flex-1">
              <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <p className="text-2xl font-light text-[var(--text-muted)] italic">Synthesizing insights...</p>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Today's Tasks */}
        <motion.div variants={fadeUp} className="lg:col-span-7 flex flex-col">
          <h2 className="label-micro mb-8">Priority Queue</h2>
          {todayTasks.length === 0 ? (
            <div className="flex flex-col items-start justify-center py-12">
              <p className="text-xl font-light text-[var(--text-muted)]">Inbox zero achieved.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {todayTasks.slice(0, 5).map(task => (
                <motion.div 
                  key={task.id}
                  whileHover={{ x: 8 }}
                  className="flex flex-col gap-1 py-5 border-b divider-subtle group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[16px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-highlight)] transition-colors">{task.title}</p>
                    <span className="label-micro text-[var(--text-secondary)]">{formatTimeRemaining(task.deadline)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Charts Row - Borderless */}
      <motion.div variants={viewportChart} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-24">
        {/* Weekly Productivity */}
        <motion.div className="lg:col-span-8 flex flex-col">
          <h2 className="label-micro mb-8">Weekly Throughput</h2>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ background: 'var(--background)', border: '1px solid var(--border-color)', borderRadius: '0', color: 'var(--text-primary)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} />
                <Bar dataKey="tasks_completed" fill="var(--text-primary)" radius={[2, 2, 0, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div className="lg:col-span-4 flex flex-col">
          <h2 className="label-micro mb-8">Upcoming Deadlines</h2>
          {upcomingDeadlines.length === 0 ? (
            <div className="flex flex-col items-start py-8">
              <p className="text-xl font-light text-[var(--text-muted)]">Clear.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {upcomingDeadlines.slice(0, 5).map(task => (
                <div key={task.id} className="py-4 border-b divider-subtle last:border-0 flex items-baseline justify-between gap-4">
                  <p className="text-[14px] font-medium text-[var(--text-primary)] truncate">{task.title}</p>
                  <span className="label-micro text-right text-[var(--text-secondary)] whitespace-nowrap">
                    {formatDate(task.deadline)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Goal Progress */}
      {analytics?.goal_progress?.length > 0 && (
        <motion.div variants={fadeUp} className="border-t divider-subtle pt-12 pb-24">
          <h2 className="label-micro mb-8">Active Objectives</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Featured Goal */}
            {analytics.goal_progress[0] && (
              <div className="lg:col-span-2 relative overflow-hidden group">
                <p className="text-3xl font-light text-[var(--text-primary)] mb-6 tracking-tight">{analytics.goal_progress[0].title}</p>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-light tracking-tighter text-[var(--text-primary)]">{analytics.goal_progress[0].progress}</span><span className="text-[var(--text-muted)]">%</span>
                </div>
                <div className="w-full h-[1px] bg-[var(--surface-secondary)] overflow-hidden mt-6">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${analytics.goal_progress[0].progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-[var(--text-primary)]" 
                  />
                </div>
              </div>
            )}
            
            {/* Secondary Goals */}
            {analytics.goal_progress.length > 1 && (
              <div className="flex flex-col justify-center">
                {analytics.goal_progress.slice(1, 4).map(goal => (
                  <div key={goal.id} className="group cursor-pointer py-4 border-b divider-subtle last:border-0">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[14px] font-medium text-[var(--text-primary)] truncate pr-4 group-hover:opacity-70 transition-opacity">{goal.title}</p>
                      <span className="label-micro">{goal.progress}%</span>
                    </div>
                    <div className="w-full h-[1px] bg-[var(--surface-secondary)] overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                        className="h-full bg-[var(--text-secondary)]" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}


