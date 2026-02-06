"use client";

import { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

export function AmbientAudioToggle() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    useEffect(() => {
        // Set initial volume
        if (audioRef.current) {
            audioRef.current.volume = 0.15;
        }
    }, []);

    const toggle = async () => {
        const a = audioRef.current;
        if (!a) return;

        setMsg(null);
        try {
            if (a.paused) {
                await a.play();
                setIsPlaying(true);
            } else {
                a.pause();
                setIsPlaying(false);
            }
        } catch (e: unknown) {
            console.error("Audio playback failed:", e);
            setIsPlaying(false);
            setMsg("A böngésző tiltja az automatikus lejátszást. Kattints újra.");
            setTimeout(() => setMsg(null), 4000);
        }
    };

    return (
        <>
            <audio ref={audioRef} src="/audio/ambient_birds.mp3" preload="none" loop />

            <button
                type="button"
                onClick={toggle}
                className="
          fixed right-[18px] bottom-[18px] z-[9999]
          h-11 w-11 rounded-full
          bg-white/20 backdrop-blur-md border border-white/20 shadow-lg
          text-white hover:bg-white/30 transition-all active:scale-95
          flex items-center justify-center
        "
                aria-label={isPlaying ? "Hang kikapcsolása" : "Hang bekapcsolása"}
                title={isPlaying ? "Hang: be" : "Hang: ki"}
            >
                {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>

            {msg && (
                <div className="fixed right-[18px] bottom-[70px] z-[9999] max-w-xs bg-red-500/90 backdrop-blur text-white text-xs font-bold py-2 px-3 rounded-lg shadow-xl">
                    {msg}
                </div>
            )}
        </>
    );
}
