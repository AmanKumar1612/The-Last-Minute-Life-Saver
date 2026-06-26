import { motion } from 'framer-motion';
import { Bot, CheckCircle, Zap, Shield, Database, Cloud } from 'lucide-react';

const orbitingTasks = [
  { id: 1, icon: <CheckCircle size={20} />, title: 'Optimize DB', angle: 0, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 2, icon: <Zap size={20} />, title: 'Run Diagnostics', angle: 60, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { id: 3, icon: <Shield size={20} />, title: 'Security Scan', angle: 120, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 4, icon: <Database size={20} />, title: 'Sync Data', angle: 180, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 5, icon: <Cloud size={20} />, title: 'Deploy Nodes', angle: 240, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  { id: 6, icon: <Bot size={20} />, title: 'Train Model', angle: 300, color: 'text-rose-400', bg: 'bg-rose-400/10' }
];

export default function HeroCore() {
  return (
    <div className="relative flex items-center justify-center w-full h-[600px]">
      {/* Background glowing gradients */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-96 h-96 bg-indigo-600/40 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute w-80 h-80 bg-fuchsia-600/30 rounded-full blur-[80px]"
        />
      </div>

      {/* Center AI Core */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-48 h-48 border border-white/10 rounded-full border-dashed"
        />
        
        {/* Inner Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-32 h-32 border border-indigo-500/30 rounded-full"
        />

        {/* The Core */}
        <motion.div
          animate={{ 
            boxShadow: [
              "0 0 20px 0px rgba(99, 102, 241, 0.4)",
              "0 0 60px 20px rgba(99, 102, 241, 0.6)",
              "0 0 20px 0px rgba(99, 102, 241, 0.4)"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/50 backdrop-blur-xl border border-white/20"
        >
          <Bot className="text-white drop-shadow-md" size={32} />
        </motion.div>
      </div>

      {/* Orbiting Elements */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] rounded-full border border-white/5"
      >
        {orbitingTasks.map((task) => (
          <div
            key={task.id}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              transform: `translate(-50%, -50%) rotate(${task.angle}deg) translateY(-200px) rotate(-${task.angle}deg) sm:translateY(-250px)`,
            }}
          >
            <motion.div
              animate={{ rotate: -360 }} // Counter-rotate to keep upright
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className={`flex items-center gap-3 p-3 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl ${task.bg}`}
            >
              <div className={task.color}>{task.icon}</div>
              <span className="text-sm font-medium text-white/90 whitespace-nowrap pr-2 hidden sm:block">
                {task.title}
              </span>
            </motion.div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
