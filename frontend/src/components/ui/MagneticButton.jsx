import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function MagneticButton({
  children,
  className = '',
  onClick,
  primary = false
}) {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);

    setPosition({ x: middleX * 0.15, y: middleY * 0.15 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, mass: 0.1 }}
      onClick={onClick}
      className={`relative overflow-hidden flex items-center justify-center rounded-lg font-medium transition-colors duration-200 group ${
        primary 
          ? 'bg-[var(--text-primary)] text-[var(--background)] px-6 py-2.5 hover:bg-[var(--text-secondary)]' 
          : 'bg-[var(--surface)] border border-[var(--border-color)] text-[var(--text-primary)] px-5 py-2.5 hover:bg-[var(--surface-secondary)]'
      } ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
