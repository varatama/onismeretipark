export function getPublicEnv() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const errors: string[] = [];

    if (!url || url.includes("placeholder") || url.includes("<project-ref>")) {
        errors.push("Hiányzó vagy érvénytelen Supabase Project URL.");
    } else if (!url.startsWith("https://") || !url.includes(".supabase.co")) {
        errors.push("A Supabase URL formátuma érvénytelen (https://xxxx.supabase.co).");
    }

    if (!key || key.includes("placeholder") || key.includes("anon-key")) {
        errors.push("Hiányzó vagy érvénytelen Supabase Anon Key / Publishable Key.");
    }

    if (errors.length > 0) {
        return {
            valid: false,
            errors,
            url: url || "",
            key: key || ""
        };
    }

    return {
        valid: true,
        errors: [],
        url: url!,
        key: key!
    };
}
