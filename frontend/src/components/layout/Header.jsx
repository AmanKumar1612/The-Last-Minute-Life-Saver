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
    : 'US';

  return (
    <header className="sticky top-0 z-40 h-16 px-8 flex items-center justify-between gap-4 flex-shrink-0 border-b border-[var(--border-color)] bg-[var(--background)]/80 backdrop-blur-md">
      {/* Search */}
      <div className="flex-1 max-w-md relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--text-primary)] transition-colors duration-200" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[var(--surface)] border border-transparent rounded-md pl-9 py-1.5 text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-color)] focus:bg-[var(--surface-secondary)] transition-all duration-200"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
          <kbd className="hidden sm:inline-flex items-center justify-center rounded border border-[var(--border-color)] bg-[var(--surface-secondary)] px-1.5 font-mono text-[10px] font-medium text-[var(--text-muted)]">
            ⌘ K
          </kbd>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onVoiceClick}
          className="p-2 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors flex-shrink-0 relative group"
          title="Voice Command"
        >
          <Mic className="w-[18px] h-[18px]" />
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors flex-shrink-0"
        >
          {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>

        <button 
          className="p-2 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors relative flex-shrink-0"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[var(--accent-indigo-light)] rounded-full" />
        </button>

        <div className="w-px h-6 bg-[var(--border-color)] mx-2" />

        {/* User Avatar */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-7 h-7 rounded-full bg-[var(--surface-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[10px] font-medium text-[var(--text-primary)] flex-shrink-0 group-hover:border-[var(--text-secondary)] transition-colors">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
