import { useState, useEffect } from 'react';
import client from '../api/client';
import { BarChart3, TrendingUp, Clock, AlertTriangle, Target, Flame } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar } from 'recharts';
import { motion, animate, useMotionValue, useTransform } from 'framer-motion';
import { staggerContainer, fadeUp, cardVariants, hoverLift } from '../lib/motion';

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
    <div className="flex justify-center py-20">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full" />
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
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">Analytics</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Your productivity insights</p>
      </motion.div>

      {/* Asymmetrical Stats Row */}
      <motion.div variants={fadeUp} className="flex flex-col lg:flex-row gap-6">
        {/* Hero Stat */}
        <div className="lg:w-1/3 bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-8 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mb-10 transition-colors group-hover:bg-emerald-500/10 pointer-events-none" />
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">Overall Completion</p>
          <div className="flex items-end gap-3 relative z-10">
            <p className="text-7xl font-light text-[var(--text-primary)] tracking-tighter">
              <AnimatedNumber value={overview.completion_rate || 0} />%
            </p>
            <TrendingUp className="w-8 h-8 text-emerald-500 mb-2" />
          </div>
        </div>

        {/* Secondary Stats Grid */}
        <div className="lg:w-2/3 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MiniStat icon={<Clock />} label="Focus Hours" value={data.focus_hours?.this_week || 0} suffix="h" color="text-blue-500" />
          <MiniStat icon={<AlertTriangle />} label="Missed" value={data.missed_deadlines || 0} color="text-[var(--danger)]" />
          <MiniStat icon={<Flame />} label="Day Streak" value={overview.streak_days || 0} color="text-orange-500" />
          <MiniStat icon={<Target />} label="Total Tasks" value={overview.total_tasks || 0} color="text-[var(--accent-primary)]" />
        </div>
      </motion.div>

      {/* Primary Charts (70/30 Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Productivity (70%) */}
        <motion.div variants={cardVariants} whileHover="hover" className="lg:col-span-8 bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
          <h2 className="text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[var(--accent-highlight)]" /> Weekly Productivity
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.weekly_productivity || []}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} contentStyle={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
              <Area type="monotone" dataKey="tasks_completed" stroke="var(--accent-primary)" fill="url(#areaGrad)" strokeWidth={2} animationDuration={2000} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Completion Rate Pie (30%) */}
        <motion.div variants={cardVariants} whileHover="hover" className="lg:col-span-4 bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6">Completion Breakdown</h2>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={completionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" animationDuration={1500}>
                  {completionData.map((_, i) => <Cell key={i} fill={['#10b981', '#3b82f6', '#ef4444'][i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {completionData.map((item, i) => (
              <motion.div whileHover={{ scale: 1.05 }} key={i} className="flex flex-col items-center gap-1 text-[13px] cursor-pointer">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: ['#10b981', '#3b82f6', '#ef4444'][i] }} />
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{item.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Secondary Charts (30/70 Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Distribution (30%) */}
        <motion.div variants={cardVariants} whileHover="hover" className="lg:col-span-4 bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
          <h2 className="text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6">Tasks by Category</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.category_distribution || []} layout="vertical">
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="category" type="category" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
              <Bar dataKey="count" fill="var(--accent-primary)" radius={[0, 4, 4, 0]} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Goal Progress (70%) */}
        <motion.div variants={cardVariants} whileHover="hover" className="lg:col-span-8 bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
          <h2 className="text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" /> Active Goals
          </h2>
          {(data.goal_progress || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] bg-[var(--surface-secondary)]/30 border border-dashed border-[var(--border-color)] rounded-xl text-center">
              <p className="text-[13px] text-[var(--text-muted)]">No goals tracked yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {data.goal_progress.map(goal => (
                <motion.div whileHover={{ scale: 1.02 }} key={goal.id} className="cursor-pointer bg-[var(--background)] border border-[var(--border-color)] p-4 rounded-xl flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-medium text-[var(--text-primary)] truncate mr-2">{goal.title}</span>
                    <span className="text-xs text-[var(--text-muted)] font-bold"><AnimatedNumber value={goal.progress} />%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--surface-secondary)] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-[var(--text-secondary)] rounded-full" 
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

function MiniStat({ icon, label, value, suffix = '', color }) {
  return (
    <motion.div 
      variants={hoverLift}
      initial="rest"
      whileHover="hover"
      className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-4 cursor-pointer shadow-sm flex flex-col justify-between h-full"
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[13px] font-medium text-[var(--text-muted)]`}>{label}</span>
        <motion.span whileHover={{ scale: 1.1 }} className={`w-4 h-4 ${color} transition-colors flex-shrink-0`}>{icon}</motion.span>
      </div>
      <div>
        <p className="text-xl font-semibold text-[var(--text-primary)] tracking-tight transition-colors duration-300">
          <AnimatedNumber value={value} />{suffix}
        </p>
      </div>
    </motion.div>
  );
}
