// Global Motion System Variants
// Use spring physics and a consistent feel across the app

export const pageVariants = {
  initial: { opacity: 0, y: 20, filter: 'blur(10px)', scale: 0.98 },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -20, filter: 'blur(10px)', scale: 0.98, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const staggerChildren = {
  hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export const hoverLift = {
  rest: { scale: 1, y: 0, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' },
  hover: { scale: 1.02, y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', transition: { type: 'spring', stiffness: 400, damping: 25 } }
};

export const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  hover: { y: -4, scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 25 } }
};

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, filter: 'blur(10px)' },
  show: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: { opacity: 0, scale: 0.95, filter: 'blur(10px)', transition: { duration: 0.3 } }
};

export const magneticButton = (x = 0, y = 0) => ({
  x: x * 0.1,
  y: y * 0.1,
  transition: { type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }
});

export const pulseGlow = {
  animate: {
    boxShadow: ['0 0 0 0 rgba(99, 102, 241, 0)', '0 0 0 10px rgba(99, 102, 241, 0.1)', '0 0 0 0 rgba(99, 102, 241, 0)'],
    transition: { duration: 2, repeat: Infinity }
  }
};

export const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};
