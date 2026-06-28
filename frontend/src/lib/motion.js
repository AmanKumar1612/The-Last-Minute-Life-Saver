// Global Motion System Variants
// Use strict spring physics to achieve a premium, 60fps snappy feel

export const pageVariants = {
  initial: { opacity: 0, y: 15, filter: 'blur(10px)', scale: 0.99 },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, filter: 'blur(10px)', scale: 0.99, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

export const staggerChildren = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 400, damping: 30 } }
};

export const editorialReveal = {
  hidden: { opacity: 0, y: 40, rotateX: -15, filter: 'blur(12px)' },
  show: { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 350, damping: 30, mass: 0.8 } }
};

export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } }
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } }
};

export const hoverLift = {
  rest: { scale: 1, y: 0, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  hover: { scale: 1.01, y: -4, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)', transition: { type: 'spring', stiffness: 400, damping: 25 } }
};

export const premiumLift = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } },
  hover: { y: -4, scale: 1.01, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)', transition: { type: 'spring', stiffness: 400, damping: 25 } }
};

export const cardVariants = premiumLift;

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, filter: 'blur(8px)' },
  show: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 400, damping: 30 } },
  exit: { opacity: 0, scale: 0.98, filter: 'blur(8px)', transition: { duration: 0.2 } }
};

export const shimmer = {
  hidden: { backgroundPosition: '-200% 0' },
  show: { backgroundPosition: '200% 0', transition: { repeat: Infinity, duration: 1.5, ease: 'linear' } }
};

export const viewportChart = {
  hidden: { opacity: 0, y: 40, scale: 0.95, filter: 'blur(10px)' },
  show: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 300, damping: 25, delay: 0.1 } }
};

export const magneticButton = (x = 0, y = 0) => ({
  x: x * 0.15,
  y: y * 0.15,
  transition: { type: 'spring', stiffness: 350, damping: 20, mass: 0.5 }
});

export const pulseGlow = {
  animate: {
    boxShadow: ['0 0 0 0 rgba(96, 165, 250, 0)', '0 0 0 8px rgba(96, 165, 250, 0.1)', '0 0 0 0 rgba(96, 165, 250, 0)'],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
  }
};

export const listItemVariants = {
  hidden: { opacity: 0, x: -15 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }
};
