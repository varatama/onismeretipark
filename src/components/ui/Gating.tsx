'use client';

import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function PremiumBadge() {
    return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider border border-indigo-100/50">
            <Sparkles size={12} strokeWidth={2.5} />
            Prémium
        </div>
    );
}

export function LockedOverlay({ title = "Ez a tartalom zárolt" }: { title?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center"
        >
            <div className="w-12 h-12 bg-stone-900 text-white rounded-2xl flex items-center justify-center mb-4 shadow-xl">
                <Lock size={20} />
            </div>
            <h4 className="text-sm font-black text-gray-900 mb-1">{title}</h4>
            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Előfizetés szükséges</p>
        </motion.div>
    );
}

export function PremiumCTA({ className = "" }: { className?: string }) {
    return (
        <Link
            href="/elofizetes"
            className={`flex items-center justify-between p-6 rounded-[2.5rem] bg-stone-900 text-white shadow-2xl shadow-stone-200 group transition-all active:scale-95 ${className}`}
        >
            <div className="space-y-1">
                <h4 className="text-base font-bold">Válts Prémiumra</h4>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Minden élmény feloldása</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                <ArrowRight size={20} />
            </div>
        </Link>
    );
}
