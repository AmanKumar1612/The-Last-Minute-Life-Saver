import { motion } from 'framer-motion';
import { shimmer } from '../../lib/motion';

export default function Skeleton({ className = '', variant = 'rectangular', ...props }) {
  const baseStyles = 'bg-gradient-to-r from-[var(--surface-secondary)] via-[var(--border-color)] to-[var(--surface-secondary)] bg-[length:400%_100%] overflow-hidden';
  
  const variants = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded-md h-4'
  };

  return (
    <motion.div
      variants={shimmer}
      initial="hidden"
      animate="show"
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
