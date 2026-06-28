import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Brain, Clock, ShieldCheck, Zap, Workflow, BarChart3 } from 'lucide-react';
import { Card } from '../ui/Card';

const features = [
  {
    icon: Brain,
    title: "Cognitive Scheduling",
    description: "Our engine doesn't just list tasks. It understands your peak productivity hours and automatically slots high-focus work when you're most alert.",
    colSpan: "col-span-12 lg:col-span-8",
    bgClass: "bg-gradient-to-br from-[var(--surface-secondary)] to-[#0B0D12]"
  },
  {
    icon: Clock,
    title: "Predictive Deadlines",
    description: "Identify blockers before they happen. We forecast delivery risks using historical data.",
    colSpan: "col-span-12 md:col-span-6 lg:col-span-4",
    bgClass: "bg-[var(--surface)]"
  },
  {
    icon: ShieldCheck,
    title: "Fortress Mode",
    description: "Block all distractions with one click. We mute Slack, close tabs, and play focus audio.",
    colSpan: "col-span-12 md:col-span-6 lg:col-span-4",
    bgClass: "bg-[var(--surface)]"
  },
  {
    icon: Workflow,
    title: "Automated Handoffs",
    description: "When you finish a task, we automatically notify the next stakeholder in the chain without you lifting a finger.",
    colSpan: "col-span-12 lg:col-span-8",
    bgClass: "bg-gradient-to-tl from-[var(--surface-secondary)] to-[#11141B]"
  }
];

export default function LandingFeatures() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-100, 100]);

  return (
    <section ref={sectionRef} id="demo" className="py-32 relative bg-[var(--background)]">
      
      {/* ─── Sticky Storytelling Header ─── */}
      <div className="max-w-7xl mx-auto px-6 mb-24 sticky top-32 z-20 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl bg-[var(--background)]/80 backdrop-blur-xl p-8 rounded-3xl border border-[var(--border-color)] shadow-2xl pointer-events-auto"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-[var(--accent-highlight)]" />
            <h2 className="text-sm font-semibold text-[var(--accent-highlight)] uppercase tracking-wider">The Platform</h2>
          </div>
          <h3 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-4 leading-tight">
            Designed for execution. <br /> Built for speed.
          </h3>
          <p className="text-[var(--text-muted)] text-lg leading-relaxed">
            Every feature is meticulously crafted to remove friction. We strip away the unnecessary, leaving only the tools you need to do your best work.
          </p>
        </motion.div>
      </div>

      {/* ─── Asymmetrical Bento Grid ─── */}
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-12 gap-6">
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`${feature.colSpan} group`}
            >
              <Card className={`h-full min-h-[300px] p-8 flex flex-col justify-between overflow-hidden relative ${feature.bgClass} hover:border-[var(--border-hover)] transition-colors duration-500`}>
                <div className="absolute inset-0 bg-noise opacity-[0.02]" />
                
                {/* Glow effect on hover */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)]/0 rounded-full blur-[80px] group-hover:bg-[var(--accent-primary)]/10 transition-colors duration-700" />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-color)] flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500">
                    <feature.icon className="w-5 h-5 text-[var(--text-primary)]" />
                  </div>
                  <h4 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-[var(--text-muted)] leading-relaxed max-w-md">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── Parallax Metrics Section ─── */}
      <div className="max-w-7xl mx-auto px-6 mt-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div style={{ y: y1 }} className="space-y-8">
            <h3 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">
              Metrics that matter.
            </h3>
            <p className="text-[var(--text-muted)] text-lg">
              Gain unparalleled visibility into your workflow. Our analytics engine processes your habits in real-time, delivering actionable insights without overwhelming you with data.
            </p>
            <div className="flex gap-12 pt-4">
              <div>
                <div className="text-4xl font-bold text-[var(--text-primary)] mb-1">42%</div>
                <div className="text-sm text-[var(--text-muted)]">Average time saved</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[var(--text-primary)] mb-1">2.4x</div>
                <div className="text-sm text-[var(--text-muted)]">Deep work multiplier</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div style={{ y: y2 }} className="relative aspect-square md:aspect-video lg:aspect-square bg-[var(--surface)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl p-8 flex items-center justify-center">
            <div className="absolute inset-0 bg-grid-premium opacity-50" />
            
            {/* Abstract Chart Mockup */}
            <div className="relative z-10 w-full max-w-sm aspect-square">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="var(--surface-secondary)" strokeWidth="12" fill="none" />
                <motion.circle 
                  cx="50" cy="50" r="40" 
                  stroke="var(--accent-highlight)" 
                  strokeWidth="12" 
                  fill="none" 
                  strokeDasharray="251" 
                  initial={{ strokeDashoffset: 251 }}
                  whileInView={{ strokeDashoffset: 60 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <BarChart3 className="w-8 h-8 text-[var(--text-primary)] mb-2" />
                <span className="text-2xl font-bold text-[var(--text-primary)]">76%</span>
                <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Efficiency</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

    </section>
  );
}
