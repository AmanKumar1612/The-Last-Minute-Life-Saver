import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, CheckSquare, Calendar, BarChart3,
  Target, Siren, Settings, LogOut, Zap, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useState } from 'react';
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
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-screen glass flex flex-col z-50 overflow-hidden border-r border-white/5"
    >
      {/* Logo */}
      <div className="h-16 px-4 flex items-center gap-3 border-b border-white/5 flex-shrink-0">
        <motion.div 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 cursor-pointer shadow-lg shadow-indigo-500/20"
        >
          <Zap className="w-5 h-5 text-white" />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10, transition: { duration: 0.2 } }}
              className="overflow-hidden"
            >
              <h1 className="font-bold text-sm gradient-text whitespace-nowrap leading-tight">Last-Minute</h1>
              <p className="text-[10px] text-slate-400 whitespace-nowrap">Life Saver</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const Icon = icons[item.icon];
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors duration-300 group relative z-10 ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-white/10 rounded-xl border border-white/10 shadow-lg backdrop-blur-md -z-10"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="flex-shrink-0">
                <Icon className="w-5 h-5" />
              </motion.div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
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
      <div className="px-3 py-3 border-t border-white/5 space-y-2 flex-shrink-0">
        <motion.button
          whileHover={{ x: 4 }}
          onClick={onToggleCollapse}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors w-full group cursor-pointer overflow-hidden"
        >
          <motion.div whileHover={{ scale: 1.1 }} className="flex-shrink-0">
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm whitespace-nowrap"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
        
        <motion.button
          whileHover={{ x: 4 }}
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full group cursor-pointer overflow-hidden"
        >
          <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="flex-shrink-0">
            <LogOut className="w-5 h-5" />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
}
