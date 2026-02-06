import { ReactNode } from 'react';

export function InnerFrame({ children }: { children: ReactNode }) {
    return (
        <div className="relative w-full max-w-[420px] md:w-[420px] min-h-[380px] rounded-[20px] 
            bg-zinc-950/90
            border border-white/[0.08]
            shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_15px_35px_rgba(0,0,0,0.4)]
            mx-auto ring-1 ring-white/10 flex flex-col overflow-hidden">

            {/* Very Subtle Top Highlight */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-white/10 opacity-30" />

            {/* Soft bottom haze for readability */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />

            {/* Content Container - Use flex-1 to push mt-auto items down */}
            <div className="relative z-10 flex flex-col items-center w-full flex-1 px-8 pt-8 pb-10 md:px-10 md:pt-9 md:pb-12 pb-safe">
                {children}
            </div>
        </div>
    );
}
