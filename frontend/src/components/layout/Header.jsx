import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Bell, Moon, Sun, Search, Mic } from 'lucide-react';
import { useState } from 'react';

export default function Header({ onVoiceClick }) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <header className="glass-light sticky top-0 z-40 h-16 px-6 flex items-center justify-between gap-4 flex-shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-md relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-indigo-400 group-focus-within:scale-110 transition-all duration-300" />
        <input
          type="text"
          placeholder="Search tasks, goals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-glass w-full pl-10 py-2 text-sm focus:border-indigo-500/50 hover:border-white/20 transition-all duration-300"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Voice */}
        <button
          onClick={onVoiceClick}
          className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 hover:text-white hover:bg-indigo-500/25 border border-indigo-500/20 flex-shrink-0 relative cursor-pointer group transition-all duration-300 hover:scale-105 active:scale-95"
          title="Voice Assistant"
        >
          <Mic className="w-4 h-4 group-hover:scale-115 transition-transform duration-300" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all duration-300 flex-shrink-0 cursor-pointer group hover:scale-105 active:scale-95"
        >
          {isDark ? (
            <Sun className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
          ) : (
            <Moon className="w-4 h-4 group-hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>

        {/* Notifications */}
        <button className="p-2.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all duration-300 relative flex-shrink-0 cursor-pointer group hover:scale-105 active:scale-95">
          <Bell className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-3 ml-2 pl-3 border-l border-white/10 group cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 group-hover:scale-110 group-hover:shadow-indigo-500/30 group-hover:shadow-md transition-all duration-300">
            {initials}
          </div>
          <div className="hidden sm:block min-w-0">
            <p className="text-sm font-medium text-white truncate group-hover:text-indigo-300 transition-colors duration-300">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.profession || 'Productivity Hero'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
