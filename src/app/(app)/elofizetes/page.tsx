"use client";

import { Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageShell } from '@/components/ui/PageShell';
import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';

async function startCheckout(setLoading: (v: boolean) => void) {
    setLoading(true);
    try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) throw new Error('Bejelentkezés szükséges');

        const res = await fetch('/api/stripe/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        });

        const json = await res.json();
        if (json?.url) {
            window.location.href = json.url;
            return;
        }
        throw new Error(json?.error || 'Hiba a fizetés indításakor');
    } finally {
        setLoading(false);
    }
}

export default function SubscriptionPage() {
    const benefits = [
        "Teljes hozzáférés az összes attrakcióhoz",
        "Heti élő online alkalmak",
        "Biztonságos, anonim részvétel",
    ];

    const [loading, setLoading] = useState(false);
    const stripeEnabled = Boolean(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID && process.env.NEXT_PUBLIC_SITE_URL);

    return (
        <PageShell backHref="/park">
            <div className="flex flex-col items-center text-center space-y-8 px-1">
                {/* Icon/Visual */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-200"
                >
                    <Sparkles size={40} />
                </motion.div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-black text-gray-900 leading-tight">
                        Válts Prémiumra
                    </h1>
                    <p className="text-stone-500 font-medium text-base leading-relaxed max-w-xl mx-auto">
                        Csatlakozz közösségünkhöz, és mélyítsd el az önismereti utazásod minden nap.
                    </p>
                </div>

                {/* Benefits List */}
                <div className="w-full space-y-5 text-left bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-xl shadow-stone-200/50">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start gap-4">
                            <div className="mt-1 w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                <Check size={14} strokeWidth={3} />
                            </div>
                            <span className="text-stone-700 font-bold text-sm tracking-tight">{benefit}</span>
                        </div>
                    ))}
                </div>

                {/* CTA Buttons */}
                <div className="w-full space-y-4 pt-10">
                    <motion.div whileTap={{ scale: 0.97 }}>
                        <button
                            onClick={() => startCheckout(setLoading)}
                            disabled={loading || !stripeEnabled}
                            className="w-full py-6 px-8 rounded-3xl bg-stone-900 text-white font-bold text-lg shadow-2xl shadow-stone-300 hover:bg-black transition-all disabled:opacity-60"
                        >
                            {loading ? 'Átirányítás a fizetéshez…' : stripeEnabled ? 'Előfizetek' : 'Előfizetés nem elérhető'}
                        </button>
                    </motion.div>

                    {!stripeEnabled && (
                        <p className="text-sm text-stone-500 text-center">Előfizetés jelenleg nem elérhető (Stripe nincs konfigurálva).</p>
                    )}

                    <p className="text-[10px] text-stone-400 uppercase tracking-widest font-black">
                        Nincs kötöttség • Bármikor lemondható
                    </p>
                </div>
            </div>
        </PageShell>
    );
}
