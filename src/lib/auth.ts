import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "@/lib/supabase";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      const email = user?.email?.trim().toLowerCase();
      console.log("SIGNIN EMAIL:", email);

      if (!email) {
        console.error("SIGNIN ERROR: missing email");
        return false;
      }

      const { error } = await supabase
        .from("users")
        .upsert([{ email }], { onConflict: "email" });

      if (error) {
        console.error("SAVE USER ERROR:", error);
      }

      return true;
    },
    async session({ session }) {
      if (session?.user) {
        session.user.name =
          session.user.name ||
          (session.user.email ? session.user.email.split("@")[0] : "User");
      }
      return session;
    },
  },
};
