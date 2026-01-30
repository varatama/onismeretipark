import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const error = requestUrl.searchParams.get("error");
    const error_description = requestUrl.searchParams.get("error_description");
    const origin = requestUrl.origin;

    console.log("Auth callback triggered:", {
        hasCode: !!code,
        error,
        error_description,
        fullUrl: request.url
    });

    if (error) {
        return NextResponse.redirect(`${origin}/belepes?error=${error}&description=${error_description}`);
    }

    if (!code) {
        // If there's an access_token in the query (unlikely but possible if flow is messed up)
        if (requestUrl.searchParams.has("access_token")) {
            return NextResponse.redirect(`${origin}/belepes?error=implicit_flow_not_supported`);
        }
        return NextResponse.redirect(`${origin}/belepes?error=missing_code`);
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: any) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch (err) {
                        // This can safely be ignored if the middleware is handling it
                    }
                },
                remove(name: string, options: any) {
                    try {
                        cookieStore.set({ name, value: "", ...options });
                    } catch (err) {
                        // This can safely be ignored
                    }
                },
            },
        }
    );

    try {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
            console.error("Auth exchange error:", exchangeError);
            return NextResponse.redirect(`${origin}/belepes?error=exchange_error`);
        }
    } catch (err) {
        console.error("Unexpected auth error during exchange:", err);
        return NextResponse.redirect(`${origin}/belepes?error=internal_error`);
    }

    // Go to the park!
    return NextResponse.redirect(`${origin}/park`);
}
