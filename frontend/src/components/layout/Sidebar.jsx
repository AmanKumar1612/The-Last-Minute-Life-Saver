import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, CheckSquare, Calendar, BarChart3,
  Target, Siren, Settings, LogOut, Command, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const icons = { LayoutDashboard, CheckSquare, Calendar, BarChart3, Target, Siren, Settings };

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/tasks', label: 'Tasks', icon: 'CheckSquare' },
  { path: '/calendar', label: 'Calendar', icon: 'Calendar' },
  { path: '/analytics', label: 'Analytics', icon: 'BarChart3' },
  { path: '/goals', label: 'Goals', icon: 'Target' },
  { path: '/rescue', label: 'Rescue Mode', icon: 'Siren' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
];

export default function Sidebar({ collapsed, onToggleCollapse }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside 
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-screen bg-[var(--surface)] flex flex-col z-50 overflow-hidden border-r border-[var(--border-color)]"
    >
      {/* Logo */}
      <div className="h-16 px-4 flex items-center gap-3 border-b border-[var(--border-color)] flex-shrink-0">
        <div className="w-8 h-8 rounded-md bg-[var(--text-primary)] flex items-center justify-center flex-shrink-0">
          <Command className="w-4 h-4 text-[var(--background)]" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10, transition: { duration: 0.2 } }}
              className="overflow-hidden"
            >
              <h1 className="font-semibold text-sm text-[var(--text-primary)] whitespace-nowrap tracking-tight">Last-Minute</h1>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const Icon = icons[item.icon];
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 group relative z-10 ${
                isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
              }`}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-[var(--surface-secondary)] rounded-lg -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div className="flex-shrink-0">
                <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-[13px] font-medium whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse + Logout */}
      <div className="px-3 py-4 border-t border-[var(--border-color)] space-y-1 flex-shrink-0">
        <button
          onClick={onToggleCollapse}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors w-full group cursor-pointer overflow-hidden"
        >
          <div className="flex-shrink-0">
            {collapsed ? <ChevronRight className="w-[18px] h-[18px]" /> : <ChevronLeft className="w-[18px] h-[18px]" />}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-[13px] font-medium whitespace-nowrap"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-500/10 transition-colors w-full group cursor-pointer overflow-hidden"
        >
          <div className="flex-shrink-0">
            <LogOut className="w-[18px] h-[18px]" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-[13px] font-medium whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
