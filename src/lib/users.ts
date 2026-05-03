import { isSupabaseConfigured, supabase } from "./supabase";

export async function saveUser(email: string) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const { error } = await supabase
    .from("users")
    .upsert({ email }, { onConflict: "email", ignoreDuplicates: true });

  if (error) {
    throw new Error(error.message);
  }
}
