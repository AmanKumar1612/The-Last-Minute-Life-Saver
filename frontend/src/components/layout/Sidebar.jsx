import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, CheckSquare, Calendar, BarChart3,
  Target, Siren, Settings, LogOut, Zap, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useState } from 'react';

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-[256px]';

  return (
    <aside className={`fixed left-0 top-0 h-screen glass flex flex-col transition-all duration-300 ease-in-out z-50 ${sidebarWidth}`}>
      {/* Logo */}
      <div className="h-16 px-4 flex items-center gap-3 border-b border-white/5 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 animate-float hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer">
          <Zap className="w-5 h-5 text-white animate-lightning" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden animate-fade-in-up">
            <h1 className="font-bold text-sm gradient-text whitespace-nowrap leading-tight">Last-Minute</h1>
            <p className="text-[10px] text-slate-400 whitespace-nowrap">Life Saver</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const Icon = icons[item.icon];
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group border relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border-indigo-500/30 shadow-lg shadow-indigo-500/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border-transparent hover:translate-x-1'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap group-hover:translate-x-0.5 transition-transform duration-300">
                  {item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse + Logout */}
      <div className="px-3 py-3 border-t border-white/5 space-y-1 flex-shrink-0">
        <button
          onClick={onToggleCollapse}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300 w-full group hover:translate-x-1 cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
          ) : (
            <ChevronLeft className="w-5 h-5 flex-shrink-0 group-hover:-translate-x-0.5 transition-transform duration-300" />
          )}
          {!collapsed && <span className="text-sm whitespace-nowrap">Collapse</span>}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 w-full group hover:translate-x-1 cursor-pointer"
        >
          <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
          {!collapsed && <span className="text-sm font-medium whitespace-nowrap">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
