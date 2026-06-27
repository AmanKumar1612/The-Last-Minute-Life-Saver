import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import VoiceAssistant from '../voice/VoiceAssistant';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 10, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, filter: 'blur(4px)', transition: { duration: 0.3, ease: 'easeIn' } }
};

export default function DashboardLayout() {
  const [showVoice, setShowVoice] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const mainMargin = collapsed ? 'ml-[72px]' : 'ml-[256px]';

  return (
    <div className="min-h-screen bg-[var(--background)] relative flex">
      <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      
      <div className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${mainMargin}`}>
        <Header onVoiceClick={() => setShowVoice(true)} />
        
        <div className="flex-1 overflow-auto relative">
          <AnimatePresence mode="wait">
            <motion.main 
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="p-8 max-w-7xl mx-auto w-full"
            >
              <Outlet />
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
      
      {showVoice && <VoiceAssistant onClose={() => setShowVoice(false)} />}
    </div>
  );
}
