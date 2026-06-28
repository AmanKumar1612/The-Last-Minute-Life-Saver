import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Calendar as CalendarIcon, Clock, ShieldCheck, Zap } from 'lucide-react';
import Button from '../ui/Button';

// Mock interactive widget for the hero
const MockDashboardWidget = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 0.6 }}
    className="absolute -right-12 top-20 w-64 bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-4 shadow-2xl z-20 backdrop-blur-md hidden lg:block"
  >
    <div className="flex items-center justify-between mb-4">
      <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">AI Priority</h4>
      <div className="flex items-center gap-1 text-[var(--accent-secondary)] bg-[var(--accent-secondary)]/10 px-2 py-0.5 rounded text-[10px] font-medium">
        <Zap className="w-3 h-3" />
        Optimization Active
      </div>
    </div>
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-[var(--surface-secondary)]/50 hover:bg-[var(--surface-secondary)] transition-colors cursor-default border border-transparent hover:border-[var(--border-color)]">
          <div className={`w-8 h-8 rounded-md flex items-center justify-center ${i === 1 ? 'bg-red-500/10 text-red-400' : 'bg-blue-600/10 text-blue-400'}`}>
            {i === 1 ? <Clock className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-sm font-medium text-[var(--text-primary)]">{i === 1 ? 'Finalize Q3 Pitch' : 'Deep Work Session'}</div>
            <div className="text-[11px] text-[var(--text-muted)]">{i === 1 ? 'Due in 2 hours' : 'Protected time'}</div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

export default function PremiumHero() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityParallax = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-12 overflow-hidden border-b border-[var(--border-color)]">
      {/* Subtle Grid & Glow Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-premium opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--accent-primary)]/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[var(--accent-secondary)]/5 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4" />
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left: Typography & CTAs (Asymmetrical layout) */}
          <motion.div 
            style={{ y: yParallax, opacity: opacityParallax }}
            className="flex-1 w-full text-center lg:text-left pt-12 lg:pt-0"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-color)] bg-[var(--surface)] text-[13px] font-medium text-[var(--text-secondary)] mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--accent-secondary)] animate-pulse" />
              Intelligence Engine v2.0 Live
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl lg:text-6xl font-semibold text-[var(--text-primary)] tracking-tight leading-[1.1] mb-6"
            >
              Orchestrate work.<br />
              <span className="text-[var(--text-secondary)]">Automate chaos.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg text-[var(--text-muted)] max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed"
            >
              The first AI companion that doesn't just list your tasks—it actively restructures your day, protects your focus, and predicts deadlines before they break.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Button 
                variant="primary" 
                size="lg" 
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-lg" />
                <span className="relative flex items-center">
                  Start Building Free <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto"
              >
                Explore Platform
              </Button>
            </motion.div>
          </motion.div>

          {/* Right: Live Interactive Preview */}
          <motion.div 
            initial={{ opacity: 0, x: 50, rotateY: 15, perspective: 1000 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1.2, delay: 0.3, type: "spring", bounce: 0.2 }}
            className="flex-1 w-full relative"
          >
            <MockDashboardWidget />
            
            {/* The Main Dashboard Mockup */}
            <div className="relative rounded-2xl border border-[var(--border-color)] bg-[var(--background)] shadow-2xl overflow-hidden aspect-[4/3] group">
              {/* Fake Browser Header */}
              <div className="h-10 border-b border-[var(--border-color)] bg-[var(--surface)] flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
              </div>
              
              {/* Dashboard Content Mockup */}
              <div className="p-6 flex h-[calc(100%-40px)] bg-[#05050A]">
                {/* Mock Sidebar */}
                <div className="w-16 border-r border-[var(--border-color)] flex flex-col gap-4 py-2 opacity-50">
                  <div className="w-8 h-8 rounded bg-[var(--surface-secondary)] mx-auto mb-4" />
                  <div className="w-8 h-8 rounded bg-[var(--surface-secondary)] mx-auto" />
                  <div className="w-8 h-8 rounded bg-[var(--surface-secondary)] mx-auto" />
                </div>
                {/* Mock Main Area */}
                <div className="flex-1 pl-6 flex flex-col gap-4">
                  <div className="h-8 w-1/3 bg-[var(--surface)] rounded-md border border-[var(--border-color)]" />
                  <div className="flex gap-4 h-24">
                    <div className="flex-1 bg-[var(--surface)] border border-[var(--border-color)] rounded-xl relative overflow-hidden group-hover:border-[var(--accent-highlight)] transition-colors duration-500">
                       <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/5 to-transparent" />
                    </div>
                    <div className="flex-1 bg-[var(--surface)] border border-[var(--border-color)] rounded-xl" />
                    <div className="flex-1 bg-[var(--surface)] border border-[var(--border-color)] rounded-xl" />
                  </div>
                  <div className="flex-1 bg-[var(--surface)] border border-[var(--border-color)] rounded-xl flex items-center justify-center relative overflow-hidden">
                    {/* Animated chart line mockup */}
                    <motion.svg className="absolute w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <motion.path 
                        d="M0,100 L0,50 Q25,20 50,50 T100,20 L100,100 Z" 
                        fill="url(#grad)" 
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2, delay: 1 }}
                      />
                      <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent-highlight)" />
                          <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                      </defs>
                    </motion.svg>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
