export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const PRIORITY_COLORS = {
  Critical: { bg: 'from-red-500 to-red-600', text: 'text-red-400', border: 'border-red-500/30' },
  High: { bg: 'from-orange-500 to-orange-600', text: 'text-orange-400', border: 'border-orange-500/30' },
  Medium: { bg: 'from-yellow-500 to-yellow-600', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  Low: { bg: 'from-green-500 to-green-600', text: 'text-green-400', border: 'border-green-500/30' },
};

export const RISK_COLORS = {
  'High Risk': { text: 'text-red-400', bg: 'bg-red-500/20' },
  'Warning': { text: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  'Safe': { text: 'text-green-400', bg: 'bg-green-500/20' },
};

export const CATEGORIES = ['work', 'study', 'personal', 'health', 'finance', 'other'];
export const IMPORTANCE_LEVELS = ['low', 'medium', 'high', 'critical'];

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/tasks', label: 'Tasks', icon: 'CheckSquare' },
  { path: '/calendar', label: 'Calendar', icon: 'Calendar' },
  { path: '/analytics', label: 'Analytics', icon: 'BarChart3' },
  { path: '/goals', label: 'Goals', icon: 'Target' },
  { path: '/rescue', label: 'Rescue Mode', icon: 'Siren' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
];
