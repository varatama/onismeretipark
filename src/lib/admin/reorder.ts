import { supabase } from '@/lib/supabaseClient';

/**
 * Reindexes items for a specific experience (steps) or global items (experiences).
 * Usually called after a drag & drop operation.
 */

export async function reorderExperienceSteps(experienceId: string, steps: { id: string }[]) {
    // Optimistic UI should have handled display, this is DB sync.
    // We iterate an upsert.
    // Ideally we'd use a single upsert call, but Supabase JS upsert takes an array.

    const updates = steps.map((step, index) => ({
        id: step.id,
        experience_id: experienceId,
        order_index: index,
        updated_at: new Date().toISOString()
    }));

    // Perform batch upsert. Note: we need to include required columns if they are not nullable and not default.
    // Actually for update, partial is usually fine if ID is PK.
    // However, experience_steps has composite restrictions or unique constraints potentially.
    // Let's rely on simple update by ID loop or upsert if we can minimize payload.
    // Best is to just loop updates for safety or use upsert if we are sure about data shape.
    // Given the simplicity, let's upsert only changed fields.

    // BUT: upsert requires all NOT NULL columns if it inserts. Since we have IDs, it's an update.
    // We must ensure the ID exists.

    const { error } = await supabase
        .from('experience_steps')
        .upsert(updates, { onConflict: 'id' });

    if (error) {
        console.error('Reorder steps failed:', error);
        throw error;
    }
}

export async function reorderExperiences(experiences: { id: string }[]) {
    const updates = experiences.map((exp, index) => ({
        id: exp.id,
        order_index: index,
        updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
        .from('experiences')
        .upsert(updates, { onConflict: 'id' });

    if (error) {
        console.error('Reorder experiences failed:', error);
        throw error;
    }
}
