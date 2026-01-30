import { supabase } from './supabaseClient';

export interface Experience {
    id: string;
    order_index: number;
    title: string;
    description: string;
    duration_min: number;
    is_premium: boolean;
    status: 'draft' | 'published' | 'archived';
    visibility: 'free' | 'premium' | 'hidden';
    difficulty: 'easy' | 'medium' | 'hard';
    cover_emoji?: string | null;
    cover_image_url?: string | null;
    created_at: string;
}

export interface ExperienceStep {
    id: string;
    experience_id: string;
    order_index: number;
    title: string;
    content: string;
    step_type: 'text' | 'prompt' | 'choice' | 'breath' | 'audio';
    duration_sec: number;
    created_at: string;
}

export interface UserProgress {
    id: string;
    user_id: string;
    experience_id: string;
    current_step: number;
    completed: boolean;
    updated_at: string;
}

/**
 * Fetches all available experiences ordered by order_index.
 */
export async function getExperiences(): Promise<Experience[]> {
    const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('status', 'published')
        .order('order_index', { ascending: true });

    if (error) {
        console.error('Error fetching experiences:', error);
        return [];
    }
    return data || [];
}

/**
 * Fetches a single experience by ID.
 */
export async function getExperienceById(id: string): Promise<Experience | null> {
    const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) {
        console.error('Error fetching experience:', error);
        return null;
    }
    return data;
}

/**
 * Fetches all steps for an experience ordered by order_index.
 */
export async function getExperienceSteps(experienceId: string): Promise<ExperienceStep[]> {
    const { data, error } = await supabase
        .from('experience_steps')
        .select('*')
        .eq('experience_id', experienceId)
        .order('order_index', { ascending: true });

    if (error) {
        console.error('Error fetching steps:', error);
        return [];
    }
    return data || [];
}

/**
 * Gets user progress for a specific experience.
 */
export async function getUserProgress(userId: string, experienceId: string): Promise<UserProgress | null> {
    const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('experience_id', experienceId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching progress:', error);
        return null;
    }
    return data;
}

/**
 * Updates or creates user progress.
 */
export async function updateUserProgress(progress: Partial<UserProgress> & { user_id: string; experience_id: string }) {
    const { error } = await supabase
        .from('user_progress')
        .upsert({
            ...progress,
            updated_at: new Date().toISOString()
        });

    if (error) {
        console.error('Error updating progress:', error);
        throw error;
    }
}

/**
 * Gets overall stats for the user.
 */
export async function getUserStats(userId: string) {
    const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

    if (error || !data) return { totalCompleted: 0, lastActivity: null };

    return {
        totalCompleted: data.filter(p => p.completed).length,
        inProgress: data.filter(p => !p.completed).length,
        lastActivity: data.length > 0 ? [...data].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0] : null
    };
}
