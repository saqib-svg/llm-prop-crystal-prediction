import { signIn, signOut } from "next-auth/react";

import type { AuthProvider } from "@/types/auth";

export function signInWithProvider(provider: AuthProvider) {
  return signIn(provider, { callbackUrl: "/dashboard" });
}

export function signOutUser() {
  return signOut({ callbackUrl: "/" });
}
