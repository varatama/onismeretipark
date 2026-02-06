import { ReactNode } from 'react';

export function MirrorFrame({ children }: { children: ReactNode }) {
    return (
        <div className="relative mx-auto w-full max-w-[26rem] md:max-w-[30rem] group/card transition-all duration-500">
            {/* Outer Glow - Subtle Ambient Shadow */}
            <div className="pointer-events-none absolute -inset-8 rounded-[40px] bg-black/40 blur-3xl opacity-40 transition-opacity duration-[2000ms]" />

            {/* OBSIDIAN GLASS OUTER SHELL */}
            <div className="relative rounded-[32px] p-[1px] shadow-[0_30px_70px_rgba(0,0,0,0.6)]
                bg-gradient-to-b from-white/10 to-white/5">

                {/* Main Glass Surface */}
                <div className="relative rounded-[31px] box-border
                    bg-[linear-gradient(160deg,rgba(30,31,38,0.85),rgba(14,15,20,0.80))]
                    backdrop-saturate-[1.1]
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.5)]
                    overflow-hidden">

                    {/* Inner Stroke - Double Border Effect */}
                    <div className="absolute inset-[10px] rounded-[22px] border border-white/[0.08] pointer-events-none" />

                    {/* Bottom Vignette for Depth */}
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/40 to-transparent pointer-events-none opacity-40" />

                    {/* Subtle Sheen Animation */}
                    <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_40%,rgba(255,255,255,0.05)_50%,transparent_60%)] opacity-20 pointer-events-none animate-[shine_8s_ease-in-out_infinite]" />

                    {/* Content Container - Perfect 'Aura' Padding */}
                    <div className="relative z-10 flex flex-col justify-center p-5 md:p-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
