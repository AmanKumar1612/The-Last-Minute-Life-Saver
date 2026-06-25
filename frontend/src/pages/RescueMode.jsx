import { useState } from 'react';
import client from '../api/client';
import { Siren, Plus, Trash2, Loader2, Clock, AlertTriangle, Sparkles } from 'lucide-react';

export default function RescueMode() {
  const [deadline, setDeadline] = useState('');
  const [availableHours, setAvailableHours] = useState(4);
  const [tasks, setTasks] = useState([{ title: '', estimated_hours: 1 }]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const addTask = () => setTasks([...tasks, { title: '', estimated_hours: 1 }]);
  const removeTask = (i) => setTasks(tasks.filter((_, idx) => idx !== i));
  const updateTask = (i, field, value) => {
    const updated = [...tasks];
    updated[i] = { ...updated[i], [field]: field === 'estimated_hours' ? parseFloat(value) || 0 : value };
    setTasks(updated);
  };

  const generatePlan = async () => {
    if (!deadline || tasks.some(t => !t.title)) return;
    setLoading(true);
    try {
      const res = await client.post('/ai/rescue-plan', {
        deadline: new Date(deadline).toISOString(),
        tasks: tasks.filter(t => t.title),
        available_hours: availableHours,
      });
      setPlan(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Siren className="w-5 h-5 text-white" />
          </div>
          Emergency Rescue Mode
        </h1>
        <p className="text-sm text-slate-400 mt-1">About to miss a deadline? Let AI create a recovery plan.</p>
      </div>

      {/* Input Form */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Deadline *</label>
            <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="input-glass" />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Available Hours</label>
            <input type="number" min="0.5" step="0.5" value={availableHours} onChange={(e) => setAvailableHours(parseFloat(e.target.value))} className="input-glass" />
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-slate-300">Remaining Tasks *</label>
            <button onClick={addTask} className="text-xs text-indigo-400 flex items-center gap-1 hover:text-indigo-300">
              <Plus className="w-3 h-3" /> Add Task
            </button>
          </div>
          <div className="space-y-3">
            {tasks.map((task, i) => (
              <div key={i} className="flex gap-3">
                <input type="text" value={task.title} onChange={(e) => updateTask(i, 'title', e.target.value)} className="input-glass flex-1" placeholder="Task name" />
                <input type="number" min="0.25" step="0.25" value={task.estimated_hours} onChange={(e) => updateTask(i, 'estimated_hours', e.target.value)} className="input-glass w-24" placeholder="Hours" />
                {tasks.length > 1 && (
                  <button onClick={() => removeTask(i)} className="text-slate-400 hover:text-red-400 p-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button onClick={generatePlan} disabled={loading || !deadline || tasks.every(t => !t.title)} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Generating Rescue Plan...' : 'Generate Rescue Plan'}
        </button>
      </div>

      {/* Rescue Plan Results */}
      {plan && (
        <div className="space-y-4">
          {/* Feasibility */}
          <div className={`glass-card p-4 border-l-4 ${plan.is_feasible ? 'border-green-500' : 'border-red-500'}`}>
            <div className="flex items-center gap-2 mb-1">
              {plan.is_feasible ? (
                <span className="text-green-400 text-sm font-semibold">✅ Feasible</span>
              ) : (
                <span className="text-red-400 text-sm font-semibold">⚠️ Tight Schedule</span>
              )}
            </div>
            <p className="text-sm text-slate-300">{plan.feasibility_note}</p>
          </div>

          {/* Scope Reductions */}
          {plan.scope_reductions?.length > 0 && (
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-yellow-400 mb-2">💡 Suggested Scope Reductions</h3>
              <ul className="space-y-1">
                {plan.scope_reductions.map((s, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Timeline */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" /> Recovery Timeline
            </h3>
            <div className="relative pl-6">
              <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500" />
              {plan.timeline?.map((block, i) => (
                <div key={i} className="relative mb-4 last:mb-0">
                  <div className={`absolute -left-4 w-3 h-3 rounded-full border-2 ${block.type === 'break' ? 'bg-slate-600 border-slate-500' : 'bg-indigo-500 border-indigo-400'}`} />
                  <div className={`p-3 rounded-xl ml-2 ${block.type === 'break' ? 'bg-slate-500/5' : 'bg-indigo-500/5 border border-indigo-500/10'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">{block.start_time} - {block.end_time}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${block.type === 'break' ? 'bg-slate-500/20 text-slate-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                        {block.type}
                      </span>
                    </div>
                    <p className={`text-sm font-medium ${block.type === 'break' ? 'text-slate-400' : 'text-white'}`}>{block.task}</p>
                    {block.focus_tip && <p className="text-xs text-slate-400 mt-1">{block.focus_tip}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Motivation */}
          {plan.motivational_message && (
            <div className="glass-card p-6 text-center border border-indigo-500/10">
              <p className="text-lg text-white">{plan.motivational_message}</p>
              {plan.estimated_completion_time && (
                <p className="text-sm text-indigo-400 mt-2">Estimated completion: {plan.estimated_completion_time}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
