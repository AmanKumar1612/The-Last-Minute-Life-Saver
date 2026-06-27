import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Command } from 'lucide-react';
import PremiumHero from '../components/landing/PremiumHero';
import LandingFeatures from '../components/landing/LandingFeatures';
import Button from '../components/ui/Button';

// Github Icon Component
const GithubIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 50], ["rgba(11, 13, 18, 0)", "rgba(11, 13, 18, 0.8)"]);
  const navBorder = useTransform(scrollY, [0, 50], ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.08)"]);
  const navBackdrop = useTransform(scrollY, [0, 50], ["blur(0px)", "blur(12px)"]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] overflow-x-hidden font-sans">
      
      {/* Premium Minimalist Navigation */}
      <motion.nav 
        style={{ backgroundColor: navBg, borderColor: navBorder, backdropFilter: navBackdrop, WebkitBackdropFilter: navBackdrop }}
        className="fixed top-0 w-full z-50 border-b transition-colors duration-200"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-8 h-8 rounded-md bg-[var(--text-primary)] flex items-center justify-center">
              <Command className="w-4 h-4 text-[var(--background)]" />
            </div>
            <span className="font-semibold text-[var(--text-primary)] tracking-tight">Last-Minute</span>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="https://github.com/AmanKumar1612/The-Last-Minute-Life-Saver" target="_blank" rel="noreferrer" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              <GithubIcon size={20} />
            </a>
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Sign in
            </button>
            <Button variant="primary" size="sm" onClick={() => navigate('/signup')}>
              Get Started
            </Button>
          </div>
        </div>
      </motion.nav>

      <main className="relative z-10">
        <PremiumHero />
        <LandingFeatures />

        {/* Final CTA */}
        <section className="relative py-40 bg-[var(--background)] border-t border-[var(--border-color)] overflow-hidden">
          {/* Extremely subtle background glow */}
          <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[var(--accent-indigo)]/5 rounded-[100%] blur-[100px] pointer-events-none" />

          <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-semibold text-[var(--text-primary)] mb-6 tracking-tight leading-tight"
            >
              Ready to reclaim <br /> your focus?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-xl text-[var(--text-muted)] mb-10"
            >
              Join the elite professionals who have mastered their time.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center gap-4"
            >
              <Button variant="primary" size="lg" onClick={() => navigate('/signup')}>
                Start for free
              </Button>
              <Button variant="secondary" size="lg" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Back to top
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Clean Minimalist Footer */}
        <footer className="border-t border-[var(--border-color)] bg-[var(--surface)] py-12 relative z-10">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Command className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="text-[var(--text-secondary)] font-medium text-sm">Last-Minute Lifesaver</span>
            </div>
            <p className="text-[var(--text-muted)] text-sm">
              © {new Date().getFullYear()} Designed with precision.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
