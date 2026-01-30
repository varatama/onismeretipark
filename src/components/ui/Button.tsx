'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { HTMLMotionProps, motion } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: ReactNode;
    fullWidth?: boolean;
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    fullWidth = false,
    className = '',
    disabled,
    ...props
}: ButtonProps) {

    const baseStyles = "inline-flex items-center justify-center font-bold transition-all rounded-2xl active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700",
        secondary: "bg-stone-900 text-white shadow-lg shadow-stone-300 hover:bg-black",
        outline: "bg-white border-2 border-stone-100 text-stone-600 hover:border-indigo-100 hover:text-indigo-600",
        ghost: "bg-transparent text-stone-500 hover:text-indigo-600 hover:bg-indigo-50",
        danger: "bg-red-50 text-red-600 hover:bg-red-100"
    };

    const sizes = {
        sm: "px-4 py-2 text-xs gap-2",
        md: "px-6 py-3 text-sm gap-2.5",
        lg: "px-8 py-4 text-base gap-3 rounded-[1.2rem]"
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            className={`
                ${baseStyles}
                ${variants[variant]}
                ${sizes[size]}
                ${fullWidth ? 'w-full' : ''}
                ${className}
            `}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 18} />
            ) : (
                <>
                    {children}
                    {icon && <span className="opacity-80">{icon}</span>}
                </>
            )}
        </motion.button>
    );
}
