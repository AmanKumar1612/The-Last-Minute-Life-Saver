import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import VoiceAssistant from '../voice/VoiceAssistant';
import CinematicBackground from './CinematicBackground';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from '../../lib/motion';

export default function DashboardLayout() {
  const [showVoice, setShowVoice] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const mainMargin = collapsed ? 'ml-[72px]' : 'ml-[256px]';

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CinematicBackground />
      <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${mainMargin}`}>
        <Header onVoiceClick={() => setShowVoice(true)} />
        <AnimatePresence mode="wait">
          <motion.main 
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 p-6 overflow-auto relative z-10"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
      {showVoice && <VoiceAssistant onClose={() => setShowVoice(false)} />}
    </div>
  );
}
