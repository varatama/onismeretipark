import { ReactNode, ButtonHTMLAttributes } from 'react';

interface FramedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'ivory' | 'bronze';
    className?: string;
    asDiv?: boolean; // For when we need a disabled-like container that isn't a button
}

export function FramedButton({ children, variant = 'ivory', className, asDiv = false, ...props }: FramedButtonProps) {
    const isIvory = variant === 'ivory';

    // Base properties (Tailwind)
    const baseClasses = `
        group relative flex items-center justify-center 
        w-full max-w-[320px] sm:max-w-[360px] mx-auto 
        h-[48px] sm:h-[52px] rounded-full
        transition-all duration-300 overflow-hidden
        ${!asDiv ? 'cursor-pointer active:scale-[0.98] hover:-translate-y-[1px]' : ''}
    `;

    // Visual styles for Ivory (Gold Frame)
    const ivoryStyle = {
        background: 'linear-gradient(180deg, rgba(255,248,235,0.95) 0%, rgba(240,220,180,0.92) 100%)',
        boxShadow: '0 4px 12px rgba(75,58,31,0.15), inset 0 0 0 1px rgba(255,215,120,0.65), inset 0 2px 0 rgba(255,255,255,0.4)',
    };

    // Visual styles for Bronze (Email/Darker)
    const bronzeStyle = {
        background: 'linear-gradient(180deg, rgba(140,100,55,0.12) 0%, rgba(90,60,30,0.18) 100%)', // Adjusted slightly for visibility
        border: '1px solid rgba(140,100,55,0.2)',
    };

    const style = isIvory ? ivoryStyle : bronzeStyle;
    const Component = asDiv ? 'div' : 'button';

    return (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <Component className={`${baseClasses} ${className || ''}`} style={style} {...(props as any)}>
            {/* Inner highlight for subtle depth (Ivory only) */}
            {isIvory && (
                <div className="absolute inset-[3px] rounded-full border border-[rgba(255,245,210,0.55)] opacity-60 pointer-events-none mix-blend-screen" />
            )}

            {/* Shine effect on hover (Ivory only) */}
            {isIvory && (
                <div className="pointer-events-none absolute inset-0">
                    <span className="absolute -left-1/3 top-0 h-full w-1/3 rotate-12 bg-white/50 blur-xl opacity-0 group-hover:opacity-100 group-hover:animate-[shine_1.1s_ease-in-out_1]" />
                </div>
            )}

            {/* Text Content */}
            <div className={`relative z-10 flex items-center justify-center gap-3 ${isIvory ? 'text-[#3a2f24]' : 'text-[#4b3a1f]'} font-bold text-[15px] tracking-tight`}>
                {children}
            </div>
        </Component>
    );
}
