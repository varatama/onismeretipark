'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function MagicDust() {
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number; delay: number }>>([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const newParticles = Array.from({ length: 25 }).map((_, i) => ({
                id: i,
                x: Math.random() * 100, // %
                y: Math.random() * 100, // %
                size: Math.random() * 6 + 3, // px (3-9px)
                duration: Math.random() * 5 + 5, // sec (5-10s)
                delay: Math.random() * 4 // sec
            }));
            setParticles(newParticles);
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden" aria-hidden="true">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                        background: 'radial-gradient(circle, rgba(255,215,0,1) 0%, rgba(255,160,0,0.5) 100%)', // Gold gradient
                        opacity: 0.6, // Higher base opacity
                        boxShadow: `0 0 ${p.size * 2}px ${p.size / 2}px rgba(255, 215, 0, 0.4)` // Gold glow
                    }}
                    animate={{
                        y: [0, -60, 0], // Larger movement
                        x: [0, 25, -25, 0],
                        opacity: [0.3, 0.8, 0.3], // Stronger pulse
                        scale: [0.8, 1.4, 0.8]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: p.delay,
                    }}
                />
            ))}
        </div>
    );
}
