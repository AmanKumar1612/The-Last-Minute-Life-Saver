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
        <label className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <Icon size={16} />
          </div>
        )}
        <input
          ref={ref}
          className={`w-full bg-[#171B24] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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
