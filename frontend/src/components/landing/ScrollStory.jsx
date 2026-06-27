import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Brain, Clock, ShieldCheck } from 'lucide-react';
import { TiltCard } from './PremiumCards';

const features = [
  {
    icon: Brain,
    title: "Intelligent Prioritization",
    description: "Our cognitive engine analyzes your workload, deadlines, and past habits to automatically rank tasks. Focus on what truly matters, exactly when it matters.",
    illustration: (
      <div className="relative w-full h-[300px] flex items-center justify-center">
        <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl animate-pulse-glow" />
        <div className="space-y-4 w-3/4 z-10">
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i} 
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.2, type: 'spring' }}
              viewport={{ once: false, margin: "-50px" }}
              className={`p-4 rounded-xl border ${i === 1 ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-white/5 border-white/5'} flex items-center gap-4 glass`}
            >
              <div className={`w-3 h-3 rounded-full ${i === 1 ? 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)] animate-pulse' : 'bg-slate-600'}`} />
              <div className="flex-1">
                <div className="h-4 w-1/3 bg-white/20 rounded-full mb-2" />
                <div className="h-2 w-1/4 bg-white/10 rounded-full" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  },
  {
    icon: Clock,
    title: "Predictive Deadlines",
    description: "Never get caught off guard. We predict blockers and suggest timeline adjustments before crises occur, keeping your delivery schedule completely smooth.",
    illustration: (
      <div className="relative w-full h-[300px] flex items-end gap-2 p-6 overflow-hidden rounded-2xl bg-white/5">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-white opacity-20 mask-image-gradient-b" />
        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
          <motion.div 
            key={i}
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            transition={{ duration: 0.8, delay: i * 0.1, type: "spring", bounce: 0.4 }}
            viewport={{ once: false }}
            className={`flex-1 rounded-t-lg relative z-10 ${i === 3 ? 'bg-gradient-to-t from-indigo-600 to-purple-400 shadow-[0_0_20px_rgba(129,140,248,0.4)]' : 'bg-white/10'}`}
          />
        ))}
      </div>
    )
  },
  {
    icon: ShieldCheck,
    title: "Fortress Focus Mode",
    description: "When you need deep work, engage Fortress Mode. We block distractions, mute notifications, and provide ambient environments tailored to your cognitive flow.",
    illustration: (
      <div className="relative w-full h-[300px] flex items-center justify-center rounded-2xl overflow-hidden bg-[#0A0A10]">
        <motion.div 
          animate={{ 
            boxShadow: [
              "0 0 0px 0px rgba(99, 102, 241, 0)",
              "0 0 0px 40px rgba(99, 102, 241, 0.1)",
              "0 0 0px 80px rgba(99, 102, 241, 0)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-32 h-32 rounded-full border border-indigo-500/50 flex items-center justify-center bg-indigo-500/10 backdrop-blur-md relative z-10"
        >
          <ShieldCheck size={48} className="text-indigo-400" />
        </motion.div>
        
        {/* Orbital rings */}
        <div className="absolute w-64 h-64 border border-white/5 rounded-full animate-spin-slow" />
        <div className="absolute w-96 h-96 border border-white/5 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '35s' }} />
      </div>
    )
  }
];

export default function ScrollStory() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <section ref={containerRef} className="relative py-32 bg-[#05050A]">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center mb-32">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            A Workflow <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Reimagined</span>
          </motion.h2>
        </div>

        <div className="space-y-32">
          {features.map((feature, index) => (
            <div key={index} className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-24`}>
              
              {/* Text Content */}
              <motion.div 
                initial={{ opacity: 0, x: index % 2 === 1 ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex-1 space-y-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 shadow-lg shadow-indigo-500/10">
                  <feature.icon size={32} className="text-indigo-400" />
                </div>
                <h3 className="text-3xl font-bold text-white tracking-tight">{feature.title}</h3>
                <p className="text-xl text-slate-400 leading-relaxed font-light">
                  {feature.description}
                </p>
              </motion.div>

              {/* Illustration / Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, rotateY: index % 2 === 1 ? -15 : 15 }}
                whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                viewport={{ once: false, margin: "-100px" }}
                transition={{ duration: 0.8, type: "spring" }}
                className="flex-1 w-full perspective-1000"
              >
                <TiltCard>
                  {feature.illustration}
                </TiltCard>
              </motion.div>
              
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
