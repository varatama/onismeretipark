'use client';

import { AdminGuard } from '@/components/auth/AdminGuard';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function AdminDashboard() {
    return (
        <AdminGuard>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-white rounded-2xl shadow-sm border border-stone-200">
                        <div className="text-3xl font-black text-indigo-600 mb-1">...</div>
                        <div className="text-xs font-bold text-stone-400 uppercase">Users</div>
                    </div>
                    <div className="p-6 bg-white rounded-2xl shadow-sm border border-stone-200">
                        <div className="text-3xl font-black text-indigo-600 mb-1">...</div>
                        <div className="text-xs font-bold text-stone-400 uppercase">Experiences</div>
                    </div>
                </div>

                <div className="p-8 bg-white rounded-2xl border border-stone-200 text-center space-y-4">
                    <h3 className="font-bold text-lg">Tartalom kezelése</h3>
                    <p className="text-stone-500 text-sm">Hozz létre új élményeket vagy szerkeszd a meglévőket.</p>
                    <Link href="/admin/experiences">
                        <Button>Élmények kezelése</Button>
                    </Link>
                </div>
            </div>
        </AdminGuard>
    );
}
