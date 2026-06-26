import { motion } from 'framer-motion';

export default function FeatureSection({ 
  icon: Icon, 
  title, 
  description, 
  children, 
  reverse = false 
}) {
  return (
    <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-24 w-full py-16`}>
      {/* Text Content */}
      <motion.div 
        initial={{ opacity: 0, x: reverse ? 50 : -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex-1 space-y-6"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 backdrop-blur-sm">
          <Icon size={32} />
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
          {title}
        </h2>
        <p className="text-lg text-slate-400 leading-relaxed">
          {description}
        </p>
      </motion.div>

      {/* Visual Content (Glassmorphism Panels, graphics, etc.) */}
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="flex-1 w-full relative"
      >
        {/* Glow behind the visual */}
        <div className="absolute inset-0 bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-[22px] overflow-hidden shadow-2xl">
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
