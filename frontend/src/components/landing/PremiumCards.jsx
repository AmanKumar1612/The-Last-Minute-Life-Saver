import { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';

const ROTATION_RANGE = 32.5;
const HALF_ROTATION_RANGE = 32.5 / 2;

export function TiltCard({ children, className = '' }) {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x);
  const ySpring = useSpring(y);

  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

  const handleMouseMove = (e) => {
    if (!ref.current) return [0, 0];

    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = (e.clientX - rect.left) * ROTATION_RANGE;
    const mouseY = (e.clientY - rect.top) * ROTATION_RANGE;

    const rX = (mouseY / height - HALF_ROTATION_RANGE) * -1;
    const rY = mouseX / width - HALF_ROTATION_RANGE;

    x.set(rX);
    y.set(rY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        transform,
      }}
      className={`relative group ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div 
        style={{ transform: "translateZ(50px)" }}
        className="glass-card h-full w-full p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 group-hover:border-indigo-500/30 group-hover:bg-white/10"
      >
        {children}
      </div>
    </motion.div>
  );
}

export function AnimatedBorderCard({ children, className = '' }) {
  return (
    <div className={`relative group p-[1px] rounded-2xl overflow-hidden ${className}`}>
      {/* Animated Gradient Border */}
      <div className="absolute inset-[-100%] bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-[spin_4s_linear_infinite] opacity-30 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-[1px] bg-[#0A0A10] rounded-2xl z-0" />
      
      {/* Content */}
      <div className="relative z-10 h-full w-full p-8 rounded-2xl">
        {children}
      </div>
    </div>
  );
}
