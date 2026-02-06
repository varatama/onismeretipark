'use client';

import { PageShell } from '@/components/ui/PageShell';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, Play, Clock, Bell, User } from 'lucide-react';
import { motion } from 'framer-motion';

const SCHEDULE = [
    { id: 1, title: 'Hétfői Hála Meditáció', time: 'Hétfő 07:30', host: 'Balázs', type: 'Meditáció' },
    { id: 2, title: 'Kérdezz-Felelek: Érzelmek', time: 'Szerda 19:00', host: 'Anna', type: 'Workshop' },
    { id: 3, title: 'Vasárnapi Elcsendesedés', time: 'Vasárnap 20:30', host: 'Balázs', type: 'Élő' },
];

export default function LivePage() {
    return (
        <PageShell title="Élő alkalmak">
            <div className="space-y-8 pb-20">

                {/* Main Player Area */}
                <Card variant="glass" className="aspect-video relative group overflow-hidden border-none shadow-2xl">
                    <div className="absolute inset-0 bg-stone-900 flex flex-col items-center justify-center text-center p-6 sm:p-12">
                        {/* Background Decoration */}
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518191775389-fe0a856bb49e?q=80&w=2000&auto=format&fit=crop')] opacity-30 blur-sm grayscale" />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative z-10 space-y-4"
                        >
                            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform cursor-pointer">
                                <Play size={32} className="text-white fill-current ml-1" />
                            </div>
                            <Badge color="red" className="animate-pulse">Offline</Badge>
                            <h2 className="text-2xl font-bold text-white sm:text-3xl">Következő: Hétfői Hála Meditáció</h2>
                            <p className="text-stone-300 max-w-md mx-auto text-sm sm:text-base">
                                Csatlakozz hozzánk élőben, és indítsd a hetet tudatosan a közösséggel.
                            </p>
                            <div className="pt-4 flex justify-center gap-3">
                                <Button className="bg-white text-stone-900 hover:bg-stone-100 border-none">
                                    <Bell size={16} className="mr-2" /> Emlékeztető kérése
                                </Button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Bottom Status Bar */}
                    <div className="absolute bottom-0 inset-x-0 p-4 bg-black/40 backdrop-blur-md flex items-center justify-between text-white text-xs font-bold uppercase tracking-wider border-t border-white/10">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5"><Clock size={12} /> Február 10. 07:30</span>
                            <span className="flex items-center gap-1.5"><User size={12} /> Balázs</span>
                        </div>
                        <div className="hidden sm:block">Virtuális Önismereti Park • LIVE</div>
                    </div>
                </Card>

                {/* Schedule Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-indigo-600" />
                            <h3 className="font-bold text-lg text-stone-900">Programrend</h3>
                        </div>
                    </div>

                    <div className="grid gap-3">
                        {SCHEDULE.map((item) => (
                            <Card key={item.id} variant="default" className="p-4 flex items-center justify-between group hover:border-indigo-200 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-stone-50 flex flex-col items-center justify-center text-stone-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-stone-800 text-sm">{item.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-stone-400 font-bold uppercase">{item.time}</span>
                                            <span className="w-1 h-1 rounded-full bg-stone-300" />
                                            <span className="text-[10px] text-stone-400 font-bold uppercase">{item.host}</span>
                                        </div>
                                    </div>
                                </div>
                                <Badge color={item.id === 1 ? 'indigo' : 'stone'}>{item.type}</Badge>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Info Card */}
                <Card variant="premium" className="p-6 flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-indigo-100">
                        <Bell size={32} />
                    </div>
                    <div className="space-y-1 text-center sm:text-left">
                        <h4 className="font-bold text-indigo-900 uppercase text-xs tracking-widest">Sose maradj le</h4>
                        <p className="text-indigo-800/80 text-sm leading-relaxed">
                            Minden élő alkalom előtt 15 perccel küldünk egy értesítést a telefonodra, hogy kényelmesen rá tudj készülni a meditációra.
                        </p>
                    </div>
                </Card>

            </div>
        </PageShell>
    );
}

