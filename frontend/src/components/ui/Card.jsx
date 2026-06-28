import { motion } from 'framer-motion';
import { premiumLift } from '../../lib/motion';

export function Card({ className = '', children, ...props }) {
  return (
    <motion.div 
      variants={premiumLift}
      initial="rest"
      whileHover="hover"
      className={`bg-[var(--surface)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] shadow-sm relative overflow-hidden group ${className}`} 
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={`p-6 pb-4 flex flex-col gap-1.5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }) {
  return (
    <h3 className={`font-semibold text-lg leading-none tracking-tight text-[var(--text-primary)] ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className = '', children, ...props }) {
  return (
    <p className={`text-sm text-[var(--text-muted)] ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }) {
  return (
    <div className={`p-6 pt-0 flex items-center ${className}`} {...props}>
      {children}
    </div>
  );
}
