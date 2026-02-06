import { ReactNode, ButtonHTMLAttributes } from 'react';

interface MetalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary';
    className?: string;
    asDiv?: boolean;
}

export function MetalButton({ children, variant = 'primary', className, asDiv = false, ...props }: MetalButtonProps) {
    const isPrimary = variant === 'primary';

    // Base Properties - STRETCHED BUT LIMITED
    const baseClasses = `
        group relative flex items-center justify-center 
        w-full mx-auto 
        h-[48px] sm:h-[54px] rounded-full text-[15px] font-semibold
        transition-all duration-300 overflow-hidden
        ${!asDiv ? 'cursor-pointer active:scale-[0.98] active:translate-y-px hover:-translate-y-px' : ''}
    `;

    // PRIMARY: DEEP SPACE METAL (High Contrast)
    const primaryStyle = {
        background: 'linear-gradient(180deg, #24252c, #0f1014)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(0,0,0,0.7), 0 12px 26px rgba(0,0,0,0.6)',
        color: '#f7f7f7', // Explicit light text
    };

    // SECONDARY: SUBTLE MATTE with slightly softer feel
    const secondaryStyle = {
        background: 'linear-gradient(180deg, rgba(30,31,38,0.7), rgba(14,15,20,0.7))',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.3)',
        color: '#a0a0a0', // Explicit muted text
    };

    const style = isPrimary ? primaryStyle : secondaryStyle;
    const Component = asDiv ? 'div' : 'button';

    return (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <Component className={`${baseClasses} ${className || ''}`} style={style} {...(props as any)}>

            {/* Top Gloss Highlight - Subtle */}
            {isPrimary && (
                <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-60" />
            )}

            {/* Hover Glow - Subtle Radial */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Shine Sweep - Primary Only */}
            {isPrimary && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="absolute -left-1/3 top-0 h-full w-1/3 rotate-12 bg-white/[0.04] blur-xl group-hover:animate-[shine_1.5s_ease-in-out_1]" />
                </div>
            )}

            {/* Active Border Highlight (Primary Only) */}
            {isPrimary && (
                <div className="absolute inset-0 rounded-full border border-white/0 group-hover:border-white/[0.12] transition-colors duration-300 pointer-events-none" />
            )}

            {/* Text Content - Clear Contrast */}
            <div className={`relative z-10 flex items-center justify-center gap-3 tracking-wide antialiased`}>
                {children}
            </div>
        </Component>
    );
}
