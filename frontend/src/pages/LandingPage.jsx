import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Brain, Clock, ShieldCheck } from 'lucide-react';
import HeroCore from '../components/landing/HeroCore';
import FeatureSection from '../components/landing/FeatureSection';

// Github Icon Component
const GithubIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

// Particle Background Component
function ParticleBackground() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate random particles
    const particleCount = 50;
    const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: `${p.y}vh`, x: `${p.x}vw` }}
          animate={{ 
            opacity: [0, 0.5, 0],
            y: [`${p.y}vh`, `${p.y - 20}vh`] 
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear"
          }}
          className="absolute rounded-full bg-indigo-300"
          style={{ width: p.size, height: p.size }}
        />
      ))}
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  
  // Parallax effects
  const yHeroText = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityHeroText = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="min-h-screen bg-[#05050A] text-slate-200 overflow-x-hidden selection:bg-indigo-500/30 font-sans">
      <ParticleBackground />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <span className="font-semibold text-white tracking-wide">Last-Minute Lifesaver</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/AmanKumar1612/The-Last-Minute-Life-Saver" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
              <GithubIcon size={20} />
            </a>
            <button 
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-full transition-all shadow-[0_0_15px_rgba(79,70,229,0.5)]"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Cinematic Hero Section */}
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden">
          {/* Radial Gradient for deep space feel */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#05050A]/80 to-[#05050A] pointer-events-none" />

          <motion.div 
            style={{ y: yHeroText, opacity: opacityHeroText }}
            className="text-center max-w-4xl px-6 relative z-20 mt-12"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8 backdrop-blur-md"
            >
              <Sparkles size={14} />
              <span>AI-Powered Task Orchestration</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight"
            >
              Master Your Time with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400">
                Cognitive Intelligence
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto"
            >
              Stop reacting, start orchestrating. Our AI command center intelligently prioritizes tasks, protects your focus, and ensures you hit every deadline.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button 
                onClick={() => navigate('/signup')}
                className="group relative px-8 py-4 bg-indigo-600 rounded-full font-medium text-white text-lg overflow-hidden transition-all hover:scale-105"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative flex items-center gap-2">
                  Enter Command Center <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </motion.div>
          </motion.div>

          {/* AI Core Component - Placed below text or behind it based on layout */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
            className="w-full max-w-5xl mt-[-50px] md:mt-[-100px] relative z-10"
          >
            <HeroCore />
          </motion.div>
        </section>

        {/* Dynamic Timeline / Scroll Storytelling */}
        <section className="max-w-7xl mx-auto px-6 py-32 relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent -translate-x-1/2 hidden lg:block" />

          <div className="space-y-32">
            <FeatureSection 
              icon={Brain}
              title="Intelligent Prioritization"
              description="Our cognitive engine analyzes your workload, deadlines, and past habits to automatically rank tasks. Focus on what truly matters, exactly when it matters."
            >
              <div className="p-6 md:p-8 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`p-4 rounded-xl border ${i === 1 ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-white/5 border-white/5'} flex items-center gap-4`}>
                    <div className={`w-3 h-3 rounded-full ${i === 1 ? 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]' : 'bg-slate-600'}`} />
                    <div className="flex-1">
                      <div className="h-4 w-1/3 bg-white/20 rounded-full mb-2" />
                      <div className="h-2 w-1/4 bg-white/10 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </FeatureSection>

            <FeatureSection 
              icon={Clock}
              title="Predictive Deadlines"
              description="Never get caught off guard. We predict blockers and suggest timeline adjustments before crises occur, keeping your delivery schedule completely smooth."
              reverse
            >
              <div className="p-8 h-[300px] flex items-end gap-2">
                {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className={`flex-1 rounded-t-lg ${i === 3 ? 'bg-indigo-500' : 'bg-white/10'}`}
                  />
                ))}
              </div>
            </FeatureSection>

            <FeatureSection 
              icon={ShieldCheck}
              title="Fortress Focus Mode"
              description="When you need deep work, engage Fortress Mode. We block distractions, mute notifications, and provide ambient environments tailored to your cognitive flow."
            >
              <div className="h-[300px] flex items-center justify-center p-8">
                <motion.div 
                  animate={{ 
                    boxShadow: [
                      "0 0 0px 0px rgba(99, 102, 241, 0)",
                      "0 0 0px 20px rgba(99, 102, 241, 0.1)",
                      "0 0 0px 40px rgba(99, 102, 241, 0)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-32 h-32 rounded-full border-2 border-indigo-500 flex items-center justify-center bg-indigo-500/10 backdrop-blur-md"
                >
                  <ShieldCheck size={48} className="text-indigo-400" />
                </motion.div>
              </div>
            </FeatureSection>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-900/20 top-auto h-96 bg-gradient-to-t from-indigo-900/40 to-transparent pointer-events-none" />
          
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to upgrade your workflow?</h2>
            <p className="text-xl text-slate-400 mb-10">Join thousands of professionals mastering their time.</p>
            <button 
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-white text-indigo-900 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              Deploy Your Instance
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
