'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { supabase, checkSupabaseConnection } from '@/lib/supabaseClient';
import { Mail, Loader2, WifiOff, Settings2 } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import React from 'react';
import { getPublicEnv } from '@/lib/env';
import { AmbientAudioToggle } from '@/components/ui/AmbientAudioToggle';
import { MirrorFrame } from '@/components/ui/MirrorFrame';
import { InnerFrame } from '@/components/ui/InnerFrame';
import { MetalButton } from '@/components/ui/MetalButton';
import { Input } from '@/components/ui/Input';

function LoginContent() {
    const { user, isLoading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const urlError = searchParams.get('error');

    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [connError, setConnError] = useState<string | null>(null);
    const [envErrors, setEnvErrors] = useState<string[]>([]);
    const [isValidating, setIsValidating] = useState(true);

    // Email Login State
    const [loginView, setLoginView] = useState<'social' | 'email'>('social');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Parallax Effect State
    const [parallax, setParallax] = useState({ x: 0, y: 0 });

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
        const clamp = (v: number, n: number) => Math.max(-n, Math.min(n, v));

        const onMove = (e: MouseEvent) => {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            const dx = (e.clientX - cx) / cx; // -1..1
            const dy = (e.clientY - cy) / cy; // -1..1
            setParallax({ x: clamp(dx * 10, 10), y: clamp(dy * 8, 8) }); // px
        };

        const onOrient = (e: DeviceOrientationEvent) => {
            const gx = (e.gamma ?? 0) / 25; // left-right
            const by = (e.beta ?? 0) / 35;  // front-back
            setParallax({ x: clamp(gx * 10, 10), y: clamp(by * 8, 8) });
        };

        window.addEventListener("mousemove", onMove, { passive: true });
        window.addEventListener("deviceorientation", onOrient, true);

        return () => {
            window.removeEventListener("mousemove", onMove as EventListener);
            window.removeEventListener("deviceorientation", onOrient as EventListener);
        };
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

    const handleEmailAuth = async () => {
        if (!email || !password) return;
        setIsLoggingIn(true);
        setConnError(null);

        try {
            // First attempt to sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                // If sign in fails, try to sign up
                if (signInError.message.includes('Invalid login credentials')) {
                    const { error: signUpError } = await supabase.auth.signUp({
                        email,
                        password,
                    });
                    if (signUpError) throw signUpError;

                    // Supabase by default requires email confirmation. 
                    // Tell user to check email if auto-confirm is off.
                    alert("Regisztráció sikeres! Kérjük ellenőrizd az e-mail fiókodat a visszaigazoláshoz.");
                } else {
                    throw signInError;
                }
            }
        } catch (err: any) {
            console.error('Email auth error:', err);
            setConnError(err.message || "Hiba történt a bejelentkezés során.");
        } finally {
            setIsLoggingIn(false);
        }
    };

    if (authLoading || (user && !authLoading) || isValidating) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-stone-500 animate-spin" />
            </div>
        );
    }

    const hasConfigError = envErrors.length > 0 || !!connError;

    // SIMPLIFIED VARIANTS TO ENSURE VISIBILITY
    const container: Variants = {
        hidden: { opacity: 1 },
        show: {
            opacity: 1,
            transition: { duration: 0.5 },
        },
    };

    return (
        <main className="relative isolate min-h-screen w-full overflow-hidden bg-gray-900">
            {/* Background Layer (Visual Restoration - Desaturated & Calm) */}
            <motion.div
                className="fixed inset-0 w-screen h-screen z-0"
                style={{ willChange: "transform" }}
                animate={{ x: parallax.x, y: parallax.y, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 40, damping: 20 }}
            >
                <picture>
                    <source media="(min-width: 768px)" srcSet="/img/bg/bg_welcome_pc.webp" />
                    <img
                        src="/img/bg/bg_welcome_mobile.webp"
                        alt="Background"
                        className="w-full h-full object-cover object-[center_35%] grayscale brightness-[0.85] blur-[2px] transition-all duration-1000"
                    />
                </picture>
            </motion.div>

            {/* Subtle Overlay - Fixed to NOT hide background */}
            <div className="fixed inset-0 z-10 pointer-events-none bg-black/20" />
            <div className="fixed inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />

            {/* Audio Toggle (Fixed z-[9999]) */}
            <div className="fixed bottom-4 right-4 z-[9999] pointer-events-auto opacity-70 hover:opacity-100 transition-opacity text-white">
                <AmbientAudioToggle />
            </div>

            {/* Main Content (Relative z-30, fills min-h-screen) */}
            <section className="relative z-30 min-h-screen w-full flex items-center justify-center px-4 py-16 pb-safe">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="w-full max-w-[42rem]"
                >
                    <AnimatePresence>
                        {(urlError || hasConfigError) && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 overflow-hidden"
                            >
                                <div className={`p-4 rounded-xl border flex items-start gap-4 text-left shadow-lg backdrop-blur-md ${envErrors.length > 0 ? 'bg-orange-950/40 border-orange-800/30 text-orange-200' : 'bg-red-950/40 border-red-800/30 text-red-200'}`}>
                                    <div className="shrink-0 mt-0.5 opacity-80">
                                        {envErrors.length > 0 ? <Settings2 size={18} /> : <WifiOff size={18} />}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-sm tracking-wide">Bejelentkezési Hiba</p>
                                        <div className="text-xs opacity-85 leading-relaxed">
                                            {envErrors.length > 0 ? (
                                                <ul className="list-disc ml-4 space-y-1">
                                                    {envErrors.map((err, i) => <li key={i}>{err}</li>)}
                                                </ul>
                                            ) : urlError === 'missing_code' ? (
                                                <p>Hitelesítési kód hiányzik.</p>
                                            ) : (
                                                <p>{connError || "Hiba történt."}</p>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mt-2">
                                            Próbáld újra vagy töltsd be újra az oldalt.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* MAIN CARD - OBSIDIAN GLASS LUXURY */}
                    <div className="relative z-40">
                        <MirrorFrame>
                            <InnerFrame>
                                <div className="flex w-full flex-col items-center min-h-[460px] py-2">
                                    {/* 1. HEADER - AT THE TOP */}
                                    <div className="text-center w-full pt-4">
                                        <div className="space-y-5 mb-6">
                                            <div className="mx-auto inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-white/[0.12] bg-white/[0.05] backdrop-blur-sm shadow-sm transition-transform hover:scale-[1.02] duration-500 cursor-default">
                                                <span
                                                    className="text-[10px] md:text-[11px] font-extrabold tracking-[0.24em] uppercase antialiased"
                                                    style={{ color: '#ffffff', opacity: 0.8, WebkitTextFillColor: '#ffffff' }}
                                                >
                                                    VIRTUÁLIS • ÖNISMERET • PARK
                                                </span>
                                            </div>

                                            <h1
                                                className="text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] antialiased leading-tight px-2"
                                                style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                                            >
                                                Önismereti Park
                                            </h1>
                                        </div>

                                        <p
                                            className="text-base md:text-lg font-medium tracking-wide leading-relaxed antialiased max-w-[280px] md:max-w-full mx-auto text-center"
                                            style={{ color: 'rgba(255,255,255,0.6)', WebkitTextFillColor: 'rgba(255,255,255,0.6)' }}
                                        >
                                            Nem belépsz.{" "}
                                            <span
                                                className="font-bold"
                                                style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                                            >
                                                Megérkezel.
                                            </span>
                                        </p>
                                    </div>

                                    {/* 2. CTA BLOCK - VERTICALLY CENTERED IN MIDDLE SPACE */}
                                    <div className="flex-1 w-full flex flex-col items-center justify-center py-6">
                                        <div className="w-full flex flex-col items-center gap-3">
                                            <AnimatePresence mode="wait">
                                                {loginView === 'social' ? (
                                                    <motion.div
                                                        key="social"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="flex flex-col items-center gap-3 w-full"
                                                    >
                                                        <div className="w-full max-w-[320px]">
                                                            <MetalButton
                                                                variant="primary"
                                                                onClick={handleGoogleLogin}
                                                                disabled={isLoggingIn || hasConfigError}
                                                                className="h-11 md:h-12 focus-visible:ring-2 focus-visible:ring-white/40 outline-none transition-all shadow-xl"
                                                            >
                                                                {isLoggingIn ? (
                                                                    <Loader2 size={20} className="animate-spin text-zinc-400" />
                                                                ) : (
                                                                    <div className="w-5 h-5 flex-none relative drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                                                                        <svg viewBox="0 0 24 24" width="20" height="20" className="w-full h-full">
                                                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                                <span className="text-white font-bold ml-3 tracking-wide text-[14px] md:text-[15px]">Google Belépés</span>
                                                            </MetalButton>
                                                        </div>

                                                        <div className="w-full max-w-[320px]">
                                                            <MetalButton
                                                                variant="secondary"
                                                                onClick={() => setLoginView('email')}
                                                                className="opacity-90 hover:opacity-100 group h-11 md:h-12 outline-none transition-all shadow-lg"
                                                            >
                                                                <div className="flex items-center justify-center gap-3 w-full px-4">
                                                                    <div className="text-white/50 group-hover:text-white transition-colors shrink-0">
                                                                        <Mail size={16} />
                                                                    </div>
                                                                    <span className="font-bold text-white/80 group-hover:text-white tracking-wide text-[14px]">E-mail belépés</span>
                                                                </div>
                                                            </MetalButton>
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="email"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        className="flex flex-col items-center gap-3 w-full"
                                                    >
                                                        <div className="space-y-4 w-full max-w-[320px]">
                                                            <Input
                                                                type="email"
                                                                placeholder="E-mail cím"
                                                                value={email}
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                                                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12 focus-visible:ring-1 focus-visible:ring-white/30 outline-none transition-all"
                                                            />
                                                            <Input
                                                                type="password"
                                                                placeholder="Jelszó"
                                                                value={password}
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                                                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12 focus-visible:ring-1 focus-visible:ring-white/30 outline-none transition-all"
                                                            />
                                                        </div>

                                                        <div className="flex flex-col items-center gap-4 w-full max-w-[320px]">
                                                            <MetalButton
                                                                variant="primary"
                                                                onClick={handleEmailAuth}
                                                                disabled={isLoggingIn || !email || !password}
                                                                className="h-11 md:h-12 w-full focus-visible:ring-2 focus-visible:ring-white/40 outline-none transition-all font-bold shadow-lg"
                                                            >
                                                                {isLoggingIn ? <Loader2 size={20} className="animate-spin" /> : "Belépés"}
                                                            </MetalButton>
                                                            <button
                                                                onClick={() => setLoginView('social')}
                                                                className="text-[10px] font-bold text-stone-500 uppercase tracking-widest hover:text-stone-300 transition-all py-2 outline-none"
                                                            >
                                                                vissza
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* 3. LEGAL FOOTER - AT THE BOTTOM */}
                                    <div className="w-full mt-auto pt-6 flex flex-col items-center">
                                        <div className="mx-auto w-full max-w-[300px] rounded-2xl bg-black/35 border border-white/10 backdrop-blur-md px-4 py-3 shadow-[0_15px_35px_rgba(0,0,0,0.45)] relative z-20">
                                            <div className="flex items-center justify-center gap-3 text-[12px] font-medium tracking-wide mb-1.5">
                                                <a
                                                    href="/aszf"
                                                    className="opacity-80 hover:opacity-100 transition focus-visible:ring-1 focus-visible:ring-white/30 rounded px-2 py-1 outline-none decoration-white/30 underline-offset-4 hover:decoration-white/60"
                                                    style={{ color: '#ffffff', textDecoration: 'underline' }}
                                                >
                                                    ÁSZF
                                                </a>
                                                <span className="text-white/10">•</span>
                                                <a
                                                    href="/adatvedelem"
                                                    className="opacity-80 hover:opacity-100 transition focus-visible:ring-1 focus-visible:ring-white/30 rounded px-2 py-1 outline-none decoration-white/30 underline-offset-4 hover:decoration-white/60"
                                                    style={{ color: '#ffffff', textDecoration: 'underline' }}
                                                >
                                                    Adatvédelem
                                                </a>
                                            </div>
                                            <p
                                                className="text-center text-[11px] leading-snug opacity-80 uppercase tracking-widest"
                                                style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                                            >
                                                A belépéssel a park rendjét elfogadod.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </InnerFrame>
                        </MirrorFrame>
                    </div>
                </motion.div>
            </section>

            {/* Bottom Gradient for Support */}
            <div className="fixed inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-20" />

            {/* Version Number */}
            <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto">
                <p className="text-[9px] text-white/25 font-bold tracking-[0.2em] uppercase antialiased">
                    v1.2 - Virtuális Önismereti Park
                </p>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="pt-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-stone-600 animate-spin" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
