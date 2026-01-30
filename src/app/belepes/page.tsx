'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { supabase, checkSupabaseConnection } from '@/lib/supabaseClient';
import { Mail, Loader2, WifiOff, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { getPublicEnv } from '@/lib/env';
import { Card } from '@/components/ui/Card';

function LoginContent() {
    const { user, isLoading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const urlError = searchParams.get('error');

    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [connError, setConnError] = useState<string | null>(null);
    const [envErrors, setEnvErrors] = useState<string[]>([]);
    const [isValidating, setIsValidating] = useState(true);

    useEffect(() => {
        const validateConfig = async () => {
            const env = getPublicEnv();
            if (!env.valid) {
                setEnvErrors(env.errors);
                setIsValidating(false);
                return;
            }

            const conn = await checkSupabaseConnection();
            if (!conn.ok) {
                setConnError(conn.error || "Hálózati hiba.");
            }
            setIsValidating(false);
        };

        validateConfig();
    }, []);

    useEffect(() => {
        if (!authLoading && user) {
            router.replace('/park');
        }
    }, [user, authLoading, router]);

    const handleGoogleLogin = async () => {
        if (envErrors.length > 0 || connError) return;

        try {
            setIsLoggingIn(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err) {
            console.error('Login error:', err);
            setIsLoggingIn(false);
        }
    };

    if (authLoading || (user && !authLoading) || isValidating) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-stone-400 font-medium text-sm animate-pulse">Konfiguráció ellenőrzése...</p>
            </div>
        );
    }

    const hasConfigError = envErrors.length > 0 || !!connError;

    return (
        <div className="relative min-h-screen flex items-center justify-center pt-10 pb-20 px-4 overflow-hidden">
            {/* Background Layer - Mobile */}
            <img
                src="/img/bg/bg_welcome_mobile.png"
                alt="Background Mobile"
                className="absolute inset-0 z-0 w-full h-full object-cover md:hidden"
            />
            {/* Background Layer - Desktop */}
            <img
                src="/img/bg/bg_welcome_desktop.png"
                alt="Background Desktop"
                className="absolute inset-0 z-0 w-full h-full object-cover hidden md:block"
            />

            {/* Content Layer */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-[24rem]"
            >
                <div className="mb-10 text-center space-y-3">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight drop-shadow-sm">
                        Önismereti Park
                    </h1>
                    <p className="text-stone-600 text-lg leading-relaxed font-medium">
                        Lépj be a fejlődésed terébe.
                    </p>
                </div>

                <AnimatePresence>
                    {(urlError || hasConfigError) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8 overflow-hidden"
                        >
                            <div className={`p-5 rounded-[2rem] border flex items-start gap-4 text-left shadow-sm bg-white/90 backdrop-blur-sm ${envErrors.length > 0 ? 'border-orange-200 text-orange-800' : 'border-red-200 text-red-800'}`}>
                                <div className="shrink-0 mt-0.5">
                                    {envErrors.length > 0 ? <Settings2 size={20} /> : <WifiOff size={20} />}
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-sm">Bejelentkezési Hiba</p>
                                    <div className="text-xs opacity-90 leading-relaxed font-medium">
                                        {envErrors.length > 0 ? (
                                            <ul className="list-disc ml-4 space-y-1">
                                                {envErrors.map((err, i) => <li key={i}>{err}</li>)}
                                            </ul>
                                        ) : urlError === 'missing_code' ? (
                                            <p>A hitelesítési kód hiányzik. Ez általában akkor fordul elő, ha a böngésző blokkolja a sütiket vagy nem PKCE folyamatot használunk.</p>
                                        ) : urlError === 'exchange_error' ? (
                                            <p>A kód cseréje sikertelen volt. Kérlek, próbáld újra!</p>
                                        ) : (
                                            <p>{connError || "Ismeretlen hiba történt a bejelentkezés során."}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Card className="p-8 space-y-6 shadow-xl shadow-stone-900/10 bg-white/95 backdrop-blur-sm">
                    <motion.button
                        whileTap={!hasConfigError ? { scale: 0.97 } : {}}
                        onClick={handleGoogleLogin}
                        disabled={isLoggingIn || hasConfigError}
                        className="w-full h-14 px-6 rounded-2xl bg-stone-900 text-white font-bold text-base flex items-center justify-center gap-3 transition-all hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed group shadow-lg shadow-stone-300"
                    >
                        {isLoggingIn ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <div className="w-5 h-5 flex-none relative">
                                <svg viewBox="0 0 24 24" width="20" height="20" className="w-full h-full">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                                    />
                                </svg>
                            </div>
                        )}
                        <span>Belépés Google-lel</span>
                    </motion.button>

                    <div className="relative py-2 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-stone-200"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase">
                            <span className="bg-white px-3 text-stone-400 font-bold tracking-widest">VAGY</span>
                        </div>
                    </div>

                    <div className="space-y-3 text-center">
                        <button
                            disabled
                            className="w-full h-14 px-6 rounded-2xl bg-stone-50 text-stone-400 font-bold text-base flex items-center justify-center gap-3 cursor-not-allowed border border-stone-200"
                        >
                            <Mail size={20} className="shrink-0" />
                            <span className="truncate">Belépés e-maillel</span>
                        </button>
                        <p className="text-[10px] text-stone-300 font-bold uppercase tracking-wider">Hamarosan</p>
                    </div>
                </Card>

                <p className="mt-8 text-center text-xs text-stone-500 font-medium px-8 leading-relaxed drop-shadow-sm">
                    A bejelentkezéssel elfogadod a felhasználási feltételeket.
                </p>
            </motion.div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="pt-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-stone-300 animate-spin" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
