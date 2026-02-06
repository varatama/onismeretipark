'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export function AmbientSound() {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initial load and volume setup
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.25;
        }

        const timer = setTimeout(() => {
            const saved = localStorage.getItem('ambient_sound_enabled');
            if (saved === 'true') {
                setIsPlaying(true);
            }
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    // Playback control
    useEffect(() => {
        if (isPlaying) {
            audioRef.current?.play().catch((err) => {
                console.log("Audio autoplay blocked/failed:", err);
            });
            localStorage.setItem('ambient_sound_enabled', 'true');
        } else {
            audioRef.current?.pause();
            localStorage.setItem('ambient_sound_enabled', 'false');
        }
    }, [isPlaying]);

    // Visibility handling
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                audioRef.current?.pause();
            } else if (isPlaying) {
                audioRef.current?.play().catch(() => { });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isPlaying]);

    const toggleSound = () => setIsPlaying(!isPlaying);

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <audio
                ref={audioRef}
                src="/audio/ambient_nature.ogg"
                loop
                preload="auto"
            />
            <button
                onClick={toggleSound}
                className="p-3 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white/80 hover:text-white transition-all border border-white/10 shadow-lg"
                title={isPlaying ? "Némítás" : "Háttérzene bekapcsolása"}
            >
                {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
        </div>
    );
}
