import { useState, useEffect } from 'react';
import client from '../api/client';
import { BarChart3, TrendingUp, Clock, AlertTriangle, Target, Flame } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar } from 'recharts';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#f5576c'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/analytics')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>;
  if (!data) return <div className="glass-card p-12 text-center text-slate-400">No analytics data yet. Complete some tasks first!</div>;

  const overview = data.overview || {};
  const completionData = [
    { name: 'Completed', value: overview.completed_tasks || 0 },
    { name: 'Pending', value: overview.pending_tasks || 0 },
    { name: 'Overdue', value: overview.overdue_tasks || 0 },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-slate-400">Your productivity insights</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MiniStat icon={<TrendingUp />} label="Completion Rate" value={`${overview.completion_rate || 0}%`} color="text-green-400" />
        <MiniStat icon={<Clock />} label="Focus Hours" value={`${data.focus_hours?.this_week || 0}h`} color="text-blue-400" />
        <MiniStat icon={<AlertTriangle />} label="Missed Deadlines" value={data.missed_deadlines || 0} color="text-red-400" />
        <MiniStat icon={<Flame />} label="Streak" value={`${overview.streak_days || 0} days`} color="text-orange-400" />
        <MiniStat icon={<Target />} label="Total Tasks" value={overview.total_tasks || 0} color="text-purple-400" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Productivity */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" /> Weekly Productivity
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.weekly_productivity || []}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              <Area type="monotone" dataKey="tasks_completed" stroke="#667eea" fill="url(#areaGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Completion Rate Pie */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Completion Breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={completionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                {completionData.map((_, i) => <Cell key={i} fill={['#22c55e', '#667eea', '#ef4444'][i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {completionData.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ background: ['#22c55e', '#667eea', '#ef4444'][i] }} />
                <span className="text-slate-400">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Tasks by Category</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.category_distribution || []} layout="vertical">
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="category" type="category" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="count" fill="#764ba2" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Goal Progress */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-400" /> Goal Progress
          </h2>
          {(data.goal_progress || []).length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No goals tracked yet</p>
          ) : (
            <div className="space-y-4">
              {data.goal_progress.map(goal => (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white truncate mr-2">{goal.title}</span>
                    <span className="text-xs text-indigo-400 font-medium">{goal.progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700" style={{ width: `${goal.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value, color }) {
  return (
    <div className="glass-card p-4 text-center">
      <span className={`w-5 h-5 mx-auto block mb-2 ${color}`}>{icon}</span>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}
