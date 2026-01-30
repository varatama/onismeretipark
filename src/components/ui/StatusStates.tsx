'use client';

import { Loader2, AlertCircle, FileQuestion } from 'lucide-react';

export function LoadingState({ message = "Betöltés..." }: { message?: string }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-stone-400 font-medium text-sm animate-pulse">{message}</p>
        </div>
    );
}

export function ErrorState({ title = "Hoppá!", message = "Valami hiba történt.", onRetry }: { title?: string, message?: string, onRetry?: () => void }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] px-6 text-center animate-fade-in">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6">
                <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-stone-500 text-sm mb-8 max-w-md mx-auto leading-relaxed">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-8 py-3 bg-stone-900 text-white rounded-2xl font-bold text-sm transition-transform active:scale-95"
                >
                    Próbáld újra
                </button>
            )}
        </div>
    );
}

export function EmptyState({ title = "Még üres", message = "Itt jelenleg nincs semmi látnivaló." }: { title?: string, message?: string }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] px-6 text-center animate-fade-in">
            <div className="w-16 h-16 bg-stone-100 text-stone-300 rounded-3xl flex items-center justify-center mb-6">
                <FileQuestion size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-stone-500 text-sm max-w-md mx-auto leading-relaxed">{message}</p>
        </div>
    );
}
