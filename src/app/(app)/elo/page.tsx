'use client';

import { PageShell } from '@/components/ui/PageShell';
import { EmptyState } from '@/components/ui/StatusStates';
import { Video } from 'lucide-react';

export default function LivePage() {
    return (
        <PageShell title="Élő alkalmak">
            <EmptyState
                title="Szervezés alatt"
                message="Heti online találkozók és vezetetett meditációk előfizetőknek."
            />
        </PageShell>
    );
}
