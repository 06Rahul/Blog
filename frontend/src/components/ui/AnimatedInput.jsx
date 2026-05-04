import React, { forwardRef } from 'react';

const AnimatedInput = forwardRef(({ value, onChange, placeholder, className = '', ...props }, ref) => {
    return (
        <input
            ref={ref}
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full bg-white dark:bg-gray-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-gray-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-300 ${className}`}
            {...props}
        />
    );
});

export default AnimatedInput;
