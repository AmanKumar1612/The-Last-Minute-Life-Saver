import { useState, useEffect } from 'react';
import client from '../api/client';
import { Calendar as CalIcon, Clock, Loader2, Link2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUp, cardVariants } from '../lib/motion';

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
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-sm text-slate-400">Schedule and plan your day</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input-glass py-2 text-sm w-auto cursor-pointer" />
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generatePlan} 
            disabled={planLoading} 
            className="btn-primary flex items-center gap-2 text-sm"
          >
            {planLoading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Loader2 className="w-4 h-4" />
              </motion.div>
            ) : <CalIcon className="w-4 h-4" />}
            AI Plan
          </motion.button>
        </div>
      </motion.div>

      {!connected && (
        <motion.div variants={fadeUp} className="glass-card p-8 text-center border border-white/10">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 10 }}
            className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20"
          >
            <Link2 className="w-8 h-8 text-indigo-400" />
          </motion.div>
          <h3 className="text-lg font-semibold text-white mb-2">Connect Google Calendar</h3>
          <p className="text-sm text-slate-400 mb-4">Link your calendar for smarter scheduling and AI planning</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={connectCalendar} 
            className="btn-primary"
          >
            Connect Calendar
          </motion.button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events */}
        <motion.div variants={cardVariants} whileHover="hover" className="glass-card p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CalIcon className="w-5 h-5 text-blue-400" /> Events
          </h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Loader2 className="w-6 h-6 text-indigo-400" />
              </motion.div>
            </div>
          ) : events.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No events for this date</p>
          ) : (
            <div className="space-y-3">
              {events.map((evt, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ x: 6, backgroundColor: 'rgba(255,255,255,0.06)' }}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.02] flex items-center gap-3 transition-colors duration-300"
                >
                  <div className="w-1 h-10 rounded-full bg-gradient-to-b from-blue-500 to-cyan-500" />
                  <div>
                    <p className="text-sm text-white">{evt.summary}</p>
                    <p className="text-xs text-slate-400">{evt.start} - {evt.end}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Free Slots */}
        <motion.div variants={cardVariants} whileHover="hover" className="glass-card p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-400" /> Free Time Slots
          </h2>
          {freeSlots.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No free slots detected</p>
          ) : (
            <div className="space-y-3">
              {freeSlots.map((slot, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ x: 6, backgroundColor: 'rgba(34,197,94,0.1)' }}
                  className="p-3 rounded-xl bg-green-500/5 border border-green-500/10 flex items-center justify-between transition-colors duration-300"
                >
                  <div>
                    <p className="text-sm text-white">{slot.start} - {slot.end}</p>
                    <p className="text-xs text-green-400">{slot.duration_hours}h available</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* AI Daily Plan */}
      {dailyPlan && (
        <motion.div variants={fadeUp} className="glass-card p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <span className="text-xl">🤖</span> AI Daily Plan
          </h2>
          <p className="text-sm text-slate-400 mb-4">{dailyPlan.summary}</p>
          <div className="space-y-2">
            {dailyPlan.blocks?.map((block, i) => (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.01 }}
                className={`p-3 rounded-xl flex items-center gap-3 transition-colors duration-300 cursor-pointer ${block.type === 'break' ? 'bg-slate-500/5 hover:bg-slate-500/10' : 'bg-indigo-500/5 border border-indigo-500/10 hover:border-indigo-500/30 hover:bg-indigo-500/10'}`}
              >
                <span className="text-xs text-slate-400 w-24 flex-shrink-0">{block.start_time} - {block.end_time}</span>
                <div className="flex-1">
                  <p className={`text-sm transition-colors ${block.type === 'break' ? 'text-slate-400' : 'text-white'}`}>{block.task_title}</p>
                  {block.notes && <p className="text-xs text-slate-500">{block.notes}</p>}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${block.type === 'break' ? 'bg-slate-500/20 text-slate-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                  {block.type}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
