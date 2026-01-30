'use client';

import { useEffect, useState } from 'react';
import { getCurrentUserWithProfile } from '@/lib/session';

export function AdminBadge() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    getCurrentUserWithProfile().then(r => { if (mounted) setIsAdmin(Boolean(r.profile?.role === 'admin')); });
    return () => { mounted = false };
  }, []);

  if (!isAdmin) return null;
  return (
    <div className="fixed top-3 right-3 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold shadow">ADMIN MODE</div>
  );
}
