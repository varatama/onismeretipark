import { supabase } from './supabaseClient';

export interface Profile {
    id: string;
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
    role: 'user' | 'admin';
    plan: 'free' | 'premium';
    is_premium: boolean;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface Onboarding {
    user_id: string;
    focus: string | null;
    level: string | null;
    daily_minutes: number;
    completed: boolean;
    updated_at: string;
}

export async function getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    return data;
}

/**
 * Gets the user profile. If missing, ensures it exists via upsert.
 */
export async function getOrSyncProfile(userId: string): Promise<Profile | null> {
    const profile = await getProfile(userId);
    if (profile) return profile;

    // missing? let's try to get auth data and upsert
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            updated_at: new Date().toISOString()
        })
        .select()
        .maybeSingle();

    if (error) {
        console.error('Error syncing profile:', error);
        return null;
    }
    return data;
}

export async function updateProfileName(userId: string, fullName: string) {
    const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, updated_at: new Date().toISOString() })
        .eq('id', userId);

    if (error) throw error;
}

export async function updateProfileAvatar(userId: string, avatarUrl: string | null) {
    const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
        .eq('id', userId);

    if (error) throw error;
}

export async function updateProfile(userId: string, payload: Partial<Profile>) {
    const { error } = await supabase
        .from('profiles')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', userId);

    if (error) throw error;
}

export async function getOnboarding(userId: string): Promise<Onboarding | null> {
    const { data, error } = await supabase
        .from('onboarding')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching onboarding:', error);
        return null;
    }

    // If onboarding row is missing, create it
    if (!data) {
        const { data: newData, error: insertError } = await supabase
            .from('onboarding')
            .upsert({ user_id: userId })
            .select()
            .maybeSingle();

        if (insertError) {
            console.error('Error creating onboarding row:', insertError);
            return null;
        }
        return newData;
    }

    return data;
}

export async function saveOnboarding(payload: Partial<Onboarding> & { user_id: string }) {
    const { error } = await supabase
        .from('onboarding')
        .upsert({
            ...payload,
            updated_at: new Date().toISOString()
        });

    if (error) throw error;
}
