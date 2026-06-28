import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Input = forwardRef(({ 
  className = '', 
  label,
  error,
  icon: Icon,
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-[13px] font-medium text-[var(--text-muted)]">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 ${isFocused ? 'text-[var(--accent-highlight)]' : 'text-[var(--text-muted)]'}`}>
            <Icon size={16} />
          </div>
        )}
        
        {/* Animated Glow Border */}
        <AnimatePresence>
          {isFocused && !error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 rounded-lg pointer-events-none ring-2 ring-[var(--accent-highlight)]/30 shadow-[0_0_15px_rgba(96,165,250,0.15)] z-0"
            />
          )}
        </AnimatePresence>

        <input
          ref={ref}
          onFocus={(e) => {
            setIsFocused(true);
            if (props.onFocus) props.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (props.onBlur) props.onBlur(e);
          }}
          className={`w-full relative z-10 bg-[var(--surface)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-highlight)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            Icon ? 'pl-9' : ''
          } ${error ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-1 focus:ring-[var(--danger)]' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] font-medium text-[var(--danger)] mt-1">{error}</motion.span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
