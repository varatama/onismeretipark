'use client';

import { PageShell } from '@/components/ui/PageShell';
import { EmptyState } from '@/components/ui/StatusStates';

export default function ChatPage() {
    return (
        <PageShell title="Közösség">
            <EmptyState
                title="Hamarosan..."
                message="Tematikus szobák és beszélgetések az önismereti úton."
            />
        </PageShell>
    );
}
