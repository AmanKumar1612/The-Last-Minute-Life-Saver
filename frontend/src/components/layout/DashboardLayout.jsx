import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import VoiceAssistant from '../voice/VoiceAssistant';
import { useState } from 'react';

export default function DashboardLayout() {
  const [showVoice, setShowVoice] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const mainMargin = collapsed ? 'ml-[72px]' : 'ml-[256px]';

  return (
    <div className="min-h-screen">
      <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${mainMargin}`}>
        <Header onVoiceClick={() => setShowVoice(true)} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
      {showVoice && <VoiceAssistant onClose={() => setShowVoice(false)} />}
    </div>
  );
}
