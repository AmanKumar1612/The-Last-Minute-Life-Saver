import { useState, useEffect } from 'react';
import client from '../api/client';
import { Calendar as CalIcon, Clock, Loader2, Link2 } from 'lucide-react';

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [freeSlots, setFreeSlots] = useState([]);
  const [dailyPlan, setDailyPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const connectCalendar = async () => {
    try {
      const res = await client.get('/calendar/auth-url');
      window.open(res.data.auth_url, '_blank');
    } catch (err) {
      console.error('Calendar auth error:', err);
    }
  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await client.get(`/calendar/events?date=${selectedDate}`);
      if (res.data.connected === false) {
        setConnected(false);
        setEvents([]);
        setFreeSlots([]);
        return;
      }
      setEvents(res.data.events || []);
      setConnected(true);
      const slotsRes = await client.get(`/calendar/free-slots?date=${selectedDate}`);
      setFreeSlots(slotsRes.data.free_slots || []);
    } catch {
      setConnected(false);
    } finally { setLoading(false); }
  };

  const generatePlan = async () => {
    setPlanLoading(true);
    try {
      const res = await client.post('/ai/schedule', { date: selectedDate, available_hours: 8, start_hour: 9, end_hour: 22 });
      setDailyPlan(res.data);
    } catch (err) { console.error(err); }
    finally { setPlanLoading(false); }
  };

  useEffect(() => { loadEvents(); }, [selectedDate]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-sm text-slate-400">Schedule and plan your day</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input-glass py-2 text-sm w-auto" />
          <button onClick={generatePlan} disabled={planLoading} className="btn-primary flex items-center gap-2 text-sm">
            {planLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalIcon className="w-4 h-4" />}
            AI Plan
          </button>
        </div>
      </div>

      {!connected && (
        <div className="glass-card p-8 text-center">
          <Link2 className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Connect Google Calendar</h3>
          <p className="text-sm text-slate-400 mb-4">Link your calendar for smarter scheduling</p>
          <button onClick={connectCalendar} className="btn-primary">Connect Calendar</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CalIcon className="w-5 h-5 text-blue-400" /> Events
          </h2>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
          ) : events.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No events for this date</p>
          ) : (
            <div className="space-y-3">
              {events.map((evt, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.03] flex items-center gap-3">
                  <div className="w-1 h-10 rounded-full bg-gradient-to-b from-blue-500 to-cyan-500" />
                  <div>
                    <p className="text-sm text-white">{evt.summary}</p>
                    <p className="text-xs text-slate-400">{evt.start} - {evt.end}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Free Slots */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-400" /> Free Time Slots
          </h2>
          {freeSlots.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No free slots detected</p>
          ) : (
            <div className="space-y-3">
              {freeSlots.map((slot, i) => (
                <div key={i} className="p-3 rounded-xl bg-green-500/5 border border-green-500/10 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">{slot.start} - {slot.end}</p>
                    <p className="text-xs text-green-400">{slot.duration_hours}h available</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Daily Plan */}
      {dailyPlan && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-2">🤖 AI Daily Plan</h2>
          <p className="text-sm text-slate-400 mb-4">{dailyPlan.summary}</p>
          <div className="space-y-2">
            {dailyPlan.blocks?.map((block, i) => (
              <div key={i} className={`p-3 rounded-xl flex items-center gap-3 ${block.type === 'break' ? 'bg-slate-500/5' : 'bg-indigo-500/5 border border-indigo-500/10'}`}>
                <span className="text-xs text-slate-400 w-24 flex-shrink-0">{block.start_time} - {block.end_time}</span>
                <div className="flex-1">
                  <p className={`text-sm ${block.type === 'break' ? 'text-slate-400' : 'text-white'}`}>{block.task_title}</p>
                  {block.notes && <p className="text-xs text-slate-500">{block.notes}</p>}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${block.type === 'break' ? 'bg-slate-500/20 text-slate-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                  {block.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
