'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className = '', ...props }, ref) => {
    return (
        <input
            ref={ref}
            className={`
                w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 
                text-stone-900 placeholder:text-stone-400
                focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                transition-all duration-200
                ${className}
            `}
            {...props}
        />
    );
});

Input.displayName = 'Input';

export { Input };
