import { createClient } from "@supabase/supabase-js";

export type PredictionOutput = {
  label: string;
  band_gap_ev: number;
  confidence: number;
  source: "mock";
};

type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
        };
        Update: {
          email?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      history: {
        Row: {
          id: string;
          user_email: string;
          input_text: string;
          output: PredictionOutput;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_email: string;
          input_text: string;
          output: PredictionOutput;
          created_at?: string;
        };
        Update: {
          user_email?: string;
          input_text?: string;
          output?: PredictionOutput;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient<Database>(
  supabaseUrl ?? "http://localhost:54321",
  supabaseAnonKey ?? "missing-supabase-anon-key",
);
