import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, Zap, Brain, BarChart3 } from 'lucide-react';
import { formatTimeRemaining, formatDate } from '../utils/helpers';
import { PRIORITY_COLORS } from '../utils/constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="gradient-text">{user?.name?.split(' ')[0] || 'there'}</span> 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">Here's your productivity overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Completed" value={overview.completed_tasks || 0} subtitle={`${overview.completion_rate || 0}% rate`} gradient="from-green-500 to-emerald-600" />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Pending" value={overview.pending_tasks || 0} subtitle={`${overview.streak_days || 0} day streak`} gradient="from-blue-500 to-cyan-600" />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Overdue" value={overview.overdue_tasks || 0} subtitle="Need attention" gradient="from-red-500 to-rose-600" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Focus Hours" value={`${analytics?.focus_hours?.this_week || 0}h`} subtitle="This week" gradient="from-purple-500 to-indigo-600" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400 flex-shrink-0" /> Today's Tasks
          </h2>
          {todayTasks.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No tasks for today. Enjoy your free time! 🎉</p>
          ) : (
            <div className="space-y-3">
              {todayTasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.priority_label === 'Critical' ? 'bg-red-500' : task.priority_label === 'High' ? 'bg-orange-500' : task.priority_label === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{task.title}</p>
                    <p className="text-xs text-slate-400">{formatTimeRemaining(task.deadline)}</p>
                  </div>
                  {task.priority_score && (
                    <span className="text-xs font-medium px-2 py-1 rounded-lg bg-white/5 text-slate-300 flex-shrink-0">
                      {task.priority_score}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400 flex-shrink-0" /> AI Coach
          </h2>
          {aiInsights?.coaching ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed">{aiInsights.coaching.nudge}</p>
              {aiInsights.coaching.micro_tasks && (
                <div>
                  <p className="text-xs text-slate-400 mb-2 font-medium">Quick wins:</p>
                  <ul className="space-y-2">
                    {aiInsights.coaching.micro_tasks.slice(0, 3).map((task, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">{i + 1}</span>
                        <span className="min-w-0">{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {aiInsights.coaching.focus_suggestion && (
                <div className="bg-indigo-500/10 rounded-xl p-3 border border-indigo-500/10">
                  <p className="text-xs text-indigo-400 font-medium">{aiInsights.coaching.focus_suggestion.technique}</p>
                  <p className="text-xs text-slate-400 mt-1">{aiInsights.coaching.focus_suggestion.description}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">Loading AI insights...</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Productivity */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400 flex-shrink-0" /> Weekly Productivity
          </h2>
          <div className="w-full h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="tasks_completed" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-400 flex-shrink-0" /> Upcoming Deadlines
          </h2>
          {upcomingDeadlines.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No upcoming deadlines 🎯</p>
          ) : (
            <div className="space-y-3">
              {upcomingDeadlines.map(task => (
                <div key={task.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03]">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white truncate">{task.title}</p>
                    <p className="text-xs text-slate-400">{formatDate(task.deadline)}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-lg flex-shrink-0 whitespace-nowrap ${
                    formatTimeRemaining(task.deadline) === 'Overdue' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {formatTimeRemaining(task.deadline)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Goal Progress */}
      {analytics?.goal_progress?.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-green-400">🎯</span> Goal Progress
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.goal_progress.map(goal => (
              <div key={goal.id} className="p-4 rounded-xl bg-white/[0.03]">
                <p className="text-sm text-white font-medium mb-2 truncate">{goal.title}</p>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${goal.progress}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">{goal.progress}% · {goal.milestones_completed}/{goal.milestones_total} milestones</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, subtitle, gradient }) {
  return (
    <div className="glass-card p-5 flex items-center gap-4 !transform-none">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
        <span className="text-white">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-400 truncate">{label} · {subtitle}</p>
      </div>
    </div>
  );
}
