import { forwardRef } from 'react';

const Input = forwardRef(({ 
  className = '', 
  label,
  error,
  icon: Icon,
  ...props 
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-[13px] font-medium text-[var(--text-muted)]">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            <Icon size={16} />
          </div>
        )}
        <input
          ref={ref}
          className={`w-full bg-[var(--surface)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-highlight)] focus:ring-1 focus:ring-[var(--accent-highlight)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            Icon ? 'pl-9' : ''
          } ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-red-400 mt-1">{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
