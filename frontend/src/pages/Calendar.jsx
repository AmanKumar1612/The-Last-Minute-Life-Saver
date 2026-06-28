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
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">Calendar</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Schedule and plan your day</p>
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
        <motion.div variants={fadeUp} className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-8 shadow-sm max-w-xl">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 10 }}
            className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center mb-5 border border-blue-600/20"
          >
            <Link2 className="w-8 h-8 text-blue-400" />
          </motion.div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight mb-2">Connect Google Calendar</h3>
          <p className="text-sm text-[var(--text-muted)] mb-6">Link your calendar for smarter scheduling and AI planning</p>
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
        <motion.div variants={cardVariants} whileHover="hover" className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight mb-5 flex items-center gap-2">
            <CalIcon className="w-[18px] h-[18px] text-[var(--accent-highlight)] flex-shrink-0" /> Events
          </h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Loader2 className="w-6 h-6 text-[var(--accent-primary)]" />
              </motion.div>
            </div>
          ) : events.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm py-8">No events for this date</p>
          ) : (
            <div className="space-y-3">
              {events.map((evt, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ x: 4, backgroundColor: 'var(--surface-secondary)' }}
                  className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border-color)] flex items-center gap-3 transition-colors duration-300"
                >
                  <div className="w-1 h-10 rounded-full bg-gradient-to-b from-[var(--accent-primary)] to-[var(--accent-highlight)]" />
                  <div>
                    <p className="text-[13px] font-medium text-[var(--text-primary)]">{evt.summary}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{evt.start} - {evt.end}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Free Slots */}
        <motion.div variants={cardVariants} whileHover="hover" className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight mb-5 flex items-center gap-2">
            <Clock className="w-[18px] h-[18px] text-[var(--success)] flex-shrink-0" /> Free Time Slots
          </h2>
          {freeSlots.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm py-8">No free slots detected</p>
          ) : (
            <div className="space-y-3">
              {freeSlots.map((slot, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ x: 4, backgroundColor: 'rgba(16,185,129,0.1)' }}
                  className="p-3 rounded-lg bg-green-500/5 border border-green-500/10 flex items-center justify-between transition-colors duration-300"
                >
                  <div>
                    <p className="text-[13px] font-medium text-[var(--text-primary)]">{slot.start} - {slot.end}</p>
                    <p className="text-xs text-[var(--success)] mt-0.5">{slot.duration_hours}h available</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* AI Daily Plan */}
      {dailyPlan && (
        <motion.div variants={fadeUp} className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight mb-2 flex items-center gap-2">
            <span className="text-[18px]">🤖</span> AI Daily Plan
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-5">{dailyPlan.summary}</p>
          <div className="space-y-2">
            {dailyPlan.blocks?.map((block, i) => (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.01 }}
                className={`p-3 rounded-lg flex items-center gap-4 transition-colors duration-300 cursor-pointer ${block.type === 'break' ? 'bg-[var(--surface-secondary)] border border-transparent' : 'bg-[var(--background)] border border-[var(--border-color)]'}`}
              >
                <span className="text-xs text-[var(--text-secondary)] w-24 flex-shrink-0">{block.start_time} - {block.end_time}</span>
                <div className="flex-1">
                  <p className={`text-[13px] font-medium transition-colors ${block.type === 'break' ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>{block.task_title}</p>
                  {block.notes && <p className="text-xs text-[var(--text-muted)] mt-0.5">{block.notes}</p>}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded flex-shrink-0 transition-colors ${block.type === 'break' ? 'bg-[var(--surface-secondary)] text-[var(--text-muted)]' : 'bg-blue-600/10 text-blue-400'}`}>
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
