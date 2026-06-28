import { useState, useEffect } from 'react';
import client from '../api/client';
import { Calendar as CalIcon, Clock, Loader2, Link2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUp, cardVariants } from '../lib/motion';
import Skeleton from '../components/ui/Skeleton';

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
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b divider-subtle mb-8">
        <div>
          <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight mb-2">Schedule</h1>
          <p className="text-[var(--text-muted)] text-sm">Time allocation and capacity planning.</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent hover:border-[var(--border-color)] rounded-full px-3 py-1.5 transition-colors cursor-pointer outline-none" />
          <div className="h-4 w-[1px] bg-[var(--border-color)] mx-1"></div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generatePlan} 
            disabled={planLoading} 
            className="text-[13px] font-medium text-blue-500 hover:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-1.5 rounded-full flex items-center gap-1.5 transition-colors"
          >
            {planLoading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Loader2 className="w-3.5 h-3.5" />
              </motion.div>
            ) : <CalIcon className="w-3.5 h-3.5" />}
            AI Auto-Plan
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
        {/* Events */}
        <motion.div className="flex flex-col">
          <h2 className="label-micro mb-6">Scheduled Events</h2>
          {loading ? (
            <div className="space-y-4">
              <Skeleton variant="rectangular" className="h-12" />
              <Skeleton variant="rectangular" className="h-12" />
            </div>
          ) : events.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm py-4 italic">No events scheduled.</p>
          ) : (
            <div className="flex flex-col">
              {events.map((evt, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ backgroundColor: 'var(--surface-secondary)' }}
                  className="py-4 border-b divider-subtle last:border-0 flex items-start gap-4 transition-colors duration-300 group px-2 -mx-2 rounded-lg"
                >
                  <div className="w-0.5 h-8 mt-0.5 bg-[var(--text-primary)] opacity-50 group-hover:opacity-100 transition-opacity" />
                  <div>
                    <p className="text-[14px] font-medium text-[var(--text-primary)] leading-tight">{evt.summary}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">{evt.start} - {evt.end}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Free Slots */}
        <motion.div className="flex flex-col">
          <h2 className="label-micro mb-6">Available Capacity</h2>
          {freeSlots.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm py-4 italic">No free slots detected.</p>
          ) : (
            <div className="flex flex-col">
              {freeSlots.map((slot, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ backgroundColor: 'var(--surface-secondary)' }}
                  className="py-4 border-b divider-subtle last:border-0 flex items-start justify-between transition-colors duration-300 group px-2 -mx-2 rounded-lg"
                >
                  <div>
                    <p className="text-[14px] font-medium text-[var(--text-primary)] font-mono">{slot.start} - {slot.end}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Available Block</p>
                  </div>
                  <span className="text-[13px] font-medium text-[var(--text-secondary)]">{slot.duration_hours}h</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* AI Daily Plan */}
      {dailyPlan && (
        <motion.div variants={fadeUp} className="flex flex-col border-t divider-subtle pt-12">
          <h2 className="label-micro mb-6">Generated Itinerary</h2>
          <p className="text-sm text-[var(--text-muted)] mb-8 max-w-2xl">{dailyPlan.summary}</p>
          
          <div className="flex flex-col">
            {dailyPlan.blocks?.map((block, i) => (
              <motion.div 
                key={i} 
                whileHover={{ backgroundColor: 'var(--surface-secondary)' }}
                className={`py-4 px-3 -mx-3 border-b divider-subtle last:border-0 flex items-start sm:items-center flex-col sm:flex-row gap-2 sm:gap-6 transition-colors duration-300 ${block.type === 'break' ? 'opacity-60' : ''}`}
              >
                <span className="text-[13px] font-mono text-[var(--text-secondary)] w-32 flex-shrink-0">{block.start_time} - {block.end_time}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[14px] font-medium transition-colors ${block.type === 'break' ? 'text-[var(--text-muted)] italic' : 'text-[var(--text-primary)]'}`}>{block.task_title}</p>
                  {block.notes && <p className="text-[13px] text-[var(--text-muted)] mt-1 truncate">{block.notes}</p>}
                </div>
                <span className={`label-micro px-2 py-1 rounded flex-shrink-0 transition-colors ${block.type === 'break' ? 'text-[var(--text-muted)] border border-[var(--border-color)]' : 'text-blue-400 bg-blue-500/10'}`}>
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
