'use client';

import { useState } from 'react';
import { Profile, updateProfileName, updateProfileAvatar, updateProfile } from '@/lib/user';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, User, Check, X } from 'lucide-react';
import Image from 'next/image';

interface ProfileEditorProps {
    profile: Profile;
    onUpdate: (p: Profile) => void;
}

export function ProfileEditor({ profile, onUpdate }: ProfileEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(profile.full_name || '');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url || null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateProfile(profile.id, { full_name: name, avatar_url: avatarUrl });
            onUpdate({ ...profile, full_name: name, avatar_url: avatarUrl });
            setIsEditing(false);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleFile = async (file?: File) => {
        if (!file) return;
        setUploading(true);
        try {
            const path = `avatars/${profile.id}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('avatars').getPublicUrl(path);
            const publicUrl = data?.publicUrl || null;
            setAvatarUrl(publicUrl);
        } catch (err) {
            console.error('Avatar upload failed', err);
            alert('Avatar feltöltése sikertelen');
        } finally {
            setUploading(false);
        }
    };

    if (!isEditing) {
        return (
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-stone-200/50 border border-stone-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 blur-3xl -z-10" />

                <div className="flex flex-col items-center gap-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg ring-1 ring-stone-100 bg-stone-100 flex items-center justify-center">
                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                alt="Avatar"
                                width={96}
                                height={96}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <User size={40} className="text-stone-400" />
                        )}
                    </div>

                    <div className="text-center space-y-1">
                        <h2 className="text-xl font-bold text-gray-900">{profile.full_name || 'Névtelen utazó'}</h2>
                        <p className="text-sm text-stone-500">{profile.email}</p>
                    </div>

                    <div className="flex gap-2">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                            <Button variant="outline" size="sm">Kép feltöltése</Button>
                        </label>
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                            Adatok szerkesztése
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-stone-200/50 border border-stone-100 space-y-6">
            <div className="text-center">
                <h3 className="font-bold text-gray-900">Profil szerkesztése</h3>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold uppercase text-stone-400 ml-1">Avatar URL (vagy tölts fel képet)</label>
                    <div className="flex gap-2">
                        <input
                            className="flex-1 p-3 rounded-xl bg-stone-50 border border-stone-200 font-bold focus:ring-2 ring-indigo-500 outline-none"
                            value={avatarUrl || ''}
                            onChange={(e) => setAvatarUrl(e.target.value || null)}
                            placeholder="https://..."
                        />
                        <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold uppercase text-stone-400 ml-1">Teljes név</label>
                    <input
                        className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 font-bold focus:ring-2 ring-indigo-500 outline-none"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Pl. Gipsz Jakab"
                    />
                </div>
            </div>

            <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => setIsEditing(false)}>
                    Mégse
                </Button>
                <Button className="flex-1 bg-indigo-600 text-white" onClick={handleSave} isLoading={saving}>
                    Mentés
                </Button>
            </div>
        </div>
    );
}
