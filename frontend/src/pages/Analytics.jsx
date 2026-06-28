import { useState, useEffect } from 'react';
import client from '../api/client';
import { BarChart3, TrendingUp, Clock, AlertTriangle, Target, Flame } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar } from 'recharts';
import { motion, animate, useMotionValue, useTransform } from 'framer-motion';
import { staggerContainer, fadeUp, cardVariants, hoverLift, viewportChart, editorialReveal } from '../lib/motion';
import Skeleton from '../components/ui/Skeleton';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#f5576c'];

function AnimatedNumber({ value }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) || 0 : value;
    const controls = animate(count, numericValue, { duration: 1.5, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/analytics')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <Skeleton variant="rectangular" className="w-[200px] h-8 mb-2" />
      <Skeleton variant="rectangular" className="w-[300px] h-4 mb-8" />
      <div className="flex flex-col lg:flex-row gap-6">
        <Skeleton variant="rectangular" className="lg:w-1/3 h-[200px]" />
        <div className="lg:w-2/3 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Skeleton variant="rectangular" className="h-[200px]" />
          <Skeleton variant="rectangular" className="h-[200px]" />
          <Skeleton variant="rectangular" className="h-[200px]" />
          <Skeleton variant="rectangular" className="h-[200px]" />
        </div>
      </div>
    </div>
  );
  if (!data) return <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-12 text-center text-[var(--text-muted)] shadow-sm">No analytics data yet. Complete some tasks first!</div>;

  const overview = data.overview || {};
  const completionData = [
    { name: 'Completed', value: overview.completed_tasks || 0 },
    { name: 'Pending', value: overview.pending_tasks || 0 },
    { name: 'Overdue', value: overview.overdue_tasks || 0 },
  ];

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={editorialReveal} className="mb-12">
        <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight">Analytics</h1>
        <p className="text-[var(--text-muted)] mt-2">Operational intelligence and throughput.</p>
      </motion.div>

      {/* Asymmetrical Stats Row - Borderless */}
      <motion.div variants={fadeUp} className="flex flex-col lg:flex-row border-y divider-subtle mb-16">
        {/* Hero Stat */}
        <div className="lg:w-1/3 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r divider-subtle flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-[var(--accent-primary)]/5 rounded-full blur-3xl -mr-10 -mb-10 transition-colors group-hover:bg-[var(--accent-primary)]/10 pointer-events-none" />
          <p className="label-micro mb-4">Overall Completion</p>
          <div className="flex items-baseline gap-2 relative z-10">
            <p className="text-editorial-hero text-[var(--text-primary)] -ml-1">
              <AnimatedNumber value={overview.completion_rate || 0} />
            </p>
            <span className="text-3xl lg:text-5xl text-[var(--text-muted)]">%</span>
          </div>
        </div>

        {/* Secondary Stats Row */}
        <div className="lg:w-2/3 flex flex-col sm:flex-row">
          <MiniStat icon={<Clock />} label="Focus Hours" value={data.focus_hours?.this_week || 0} suffix="h" />
          <MiniStat icon={<AlertTriangle />} label="Missed" value={data.missed_deadlines || 0} />
          <MiniStat icon={<Flame />} label="Day Streak" value={overview.streak_days || 0} />
          <MiniStat icon={<Target />} label="Total Tasks" value={overview.total_tasks || 0} />
        </div>
      </motion.div>

      {/* Primary Charts (70/30 Split) */}
      <motion.div variants={viewportChart} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-24">
        {/* Weekly Productivity (70%) */}
        <motion.div className="lg:col-span-8 flex flex-col">
          <h2 className="label-micro mb-8">Weekly Productivity</h2>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.weekly_productivity || []}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--text-primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--text-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                <Tooltip cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }} contentStyle={{ background: 'var(--background)', border: '1px solid var(--border-color)', borderRadius: '0', color: 'var(--text-primary)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} />
                <Area type="monotone" dataKey="tasks_completed" stroke="var(--text-primary)" fill="url(#areaGrad)" strokeWidth={2} animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Completion Rate Pie (30%) */}
        <motion.div className="lg:col-span-4 flex flex-col">
          <h2 className="label-micro mb-8">Completion Breakdown</h2>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={completionData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value" animationDuration={1500} stroke="none">
                  {completionData.map((_, i) => <Cell key={i} fill={['var(--text-primary)', 'var(--text-secondary)', 'var(--surface-secondary)'][i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--background)', border: '1px solid var(--border-color)', borderRadius: '0', color: 'var(--text-primary)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-3 mt-8">
            {completionData.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b divider-subtle last:border-0 group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: ['var(--text-primary)', 'var(--text-secondary)', 'var(--surface-secondary)'][i] }} />
                  <span className="text-[13px] font-medium text-[var(--text-primary)] group-hover:opacity-70 transition-opacity">{item.name}</span>
                </div>
                <span className="text-[13px] text-[var(--text-muted)] font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Secondary Charts (30/70 Split) */}
      <motion.div variants={viewportChart} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-24 border-t divider-subtle pt-16">
        {/* Category Distribution (30%) */}
        <motion.div className="lg:col-span-5 flex flex-col">
          <h2 className="label-micro mb-8">Tasks by Category</h2>
          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.category_distribution || []} layout="vertical">
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="category" type="category" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ background: 'var(--background)', border: '1px solid var(--border-color)', borderRadius: '0', color: 'var(--text-primary)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} />
                <Bar dataKey="count" fill="var(--text-secondary)" radius={[0, 2, 2, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Goal Progress (70%) */}
        <motion.div className="lg:col-span-7 flex flex-col">
          <h2 className="label-micro mb-8">Active Goals Overview</h2>
          {(data.goal_progress || []).length === 0 ? (
            <div className="flex flex-col items-start justify-center flex-1">
              <p className="text-[14px] text-[var(--text-muted)] italic">No active objectives.</p>
            </div>
          ) : (
            <div className="flex flex-col pr-2 custom-scrollbar">
              {data.goal_progress.map(goal => (
                <div key={goal.id} className="cursor-pointer py-4 border-b divider-subtle last:border-0 group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[15px] font-medium text-[var(--text-primary)] group-hover:text-[var(--text-muted)] transition-colors truncate mr-2">{goal.title}</span>
                    <span className="label-micro"><AnimatedNumber value={goal.progress} />%</span>
                  </div>
                  <div className="w-full h-[1px] bg-[var(--surface-secondary)] overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-[var(--text-primary)]" 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function MiniStat({ icon, label, value, suffix = '' }) {
  return (
    <div className="p-6 lg:p-8 border-b sm:border-b-0 sm:border-r last:border-r-0 divider-subtle flex flex-col justify-between flex-1 group hover:bg-[var(--surface-secondary)] transition-colors">
      <div className="flex justify-between items-start mb-6">
        <span className="label-micro">{label}</span>
      </div>
      <div>
        <p className="text-4xl font-light text-[var(--text-primary)] tracking-tighter transition-colors duration-300">
          <AnimatedNumber value={value} /><span className="text-[var(--text-muted)] text-lg ml-0.5">{suffix}</span>
        </p>
      </div>
    </div>
  );
}
