export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      experience_steps: {
        Row: {
          id: string;
          experience_id: string;
          order_index: number;
          title: string | null;
          content: string | null;
          step_type: 'text' | 'prompt' | 'choice' | 'breath' | 'audio';
          duration_sec: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          experience_id: string;
          order_index?: number;
          title?: string | null;
          content?: string | null;
          step_type?: 'text' | 'prompt' | 'choice' | 'breath' | 'audio';
          duration_sec?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          experience_id?: string;
          order_index?: number;
          title?: string | null;
          content?: string | null;
          step_type?: 'text' | 'prompt' | 'choice' | 'breath' | 'audio';
          duration_sec?: number | null;
          created_at?: string | null;
        };
      };

      experiences: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: string | null;
          visibility: string | null;
          difficulty: string | null;
          duration_min: number | null;
          cover_emoji: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: string | null;
          visibility?: string | null;
          difficulty?: string | null;
          duration_min?: number | null;
          cover_emoji?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          status?: string | null;
          visibility?: string | null;
          difficulty?: string | null;
          duration_min?: number | null;
          cover_emoji?: string | null;
          created_at?: string | null;
        };
      };

      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          role: 'user' | 'admin' | null;
          plan: string | null;
          is_premium: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin' | null;
          plan?: string | null;
          is_premium?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin' | null;
          plan?: string | null;
          is_premium?: boolean | null;
          created_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
