import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Bell, Moon, Sun, Search, Mic } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { hoverLift } from '../../lib/motion';

export default function Header({ onVoiceClick }) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="glass sticky top-0 z-40 h-16 px-6 flex items-center justify-between gap-4 flex-shrink-0 border-b border-white/5 bg-[#05050A]/40 backdrop-blur-xl"
    >
      {/* Search */}
      <motion.div 
        whileFocus={{ scale: 1.02 }}
        className="flex-1 max-w-md relative group"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-indigo-400 group-focus-within:scale-110 transition-all duration-300" />
        <input
          type="text"
          placeholder="Search tasks, goals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-glass w-full pl-10 py-2 text-sm focus:border-indigo-500/50 hover:border-white/20 transition-all duration-300 bg-white/5 focus:bg-white/10"
        />
      </motion.div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Voice */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onVoiceClick}
          className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 hover:text-white hover:bg-indigo-500/25 border border-indigo-500/20 flex-shrink-0 relative cursor-pointer group shadow-[0_0_15px_rgba(99,102,241,0.15)] hover:shadow-[0_0_25px_rgba(99,102,241,0.3)] transition-shadow"
          title="Voice Assistant"
        >
          <Mic className="w-4 h-4" />
        </motion.button>

        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: isDark ? 45 : -12 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors flex-shrink-0 cursor-pointer border border-transparent hover:border-white/10"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </motion.button>

        {/* Notifications */}
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 12 }}
          whileTap={{ scale: 0.95 }}
          className="p-2.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors relative flex-shrink-0 cursor-pointer border border-transparent hover:border-white/10"
        >
          <Bell className="w-4 h-4" />
          <motion.span 
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" 
          />
        </motion.button>

        {/* User Avatar */}
        <motion.div 
          variants={hoverLift}
          initial="rest"
          whileHover="hover"
          className="flex items-center gap-3 ml-2 pl-3 border-l border-white/10 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-lg shadow-indigo-500/20 border border-white/10">
            {initials}
          </div>
          <div className="hidden sm:block min-w-0">
            <p className="text-sm font-medium text-white truncate group-hover:text-indigo-300 transition-colors">{user?.name || 'User'}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.profession || 'Productivity Hero'}</p>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}
