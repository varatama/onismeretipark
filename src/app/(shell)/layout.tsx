import { BottomNav } from "@/components/nav/BottomNav";
import AuthGuard from '@/components/AuthGuard';

export default function ShellLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            {/* Outer Centering Container */}
            <div className="flex justify-center min-h-screen bg-stone-200">
                {/* Responsive Content Container */}
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-stone-50 min-h-screen relative sm:shadow-2xl flex flex-col sm:border-x border-stone-300/50 overflow-x-hidden">

                    {/* Main Content Area */}
                    <main className="flex-1 flex flex-col w-full">
                        {children}
                    </main>

                    {/* Bottom Navigation */}
                    <BottomNav />

                </div>
            </div>
        </AuthGuard>
    );
}
