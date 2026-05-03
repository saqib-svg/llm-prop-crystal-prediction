"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { ArrowLeft, Atom, Lock, Mail, User } from "lucide-react";

type AuthPageProps = {
  mode: "login" | "signup";
};

export function AuthPage({ mode }: AuthPageProps) {
  const isSignup = mode === "signup";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void signIn("google", { callbackUrl: "/" });
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#09090f] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.08),transparent_30%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent_60%)]" />

      <div className="relative z-10 flex min-h-screen flex-col px-6 py-8">
        <Link
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-yellow-500/40 hover:text-white"
          href="/"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>

        <section className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[560px] rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-10">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-yellow-500 text-black shadow-[0_0_45px_rgba(250,204,21,0.25)]">
                <Atom className="size-10" />
              </div>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-white">
                {isSignup ? "Create your workspace" : "Welcome back"}
              </h1>
              <p className="mt-3 max-w-[420px] text-sm leading-6 text-slate-400">
                {isSignup
                  ? "Start saving AI material predictions to your account."
                  : "Sign in to access your prediction history."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              {isSignup && (
                <div className="space-y-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                  <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Full name
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-3">
                    <User className="size-4 text-slate-400" />
                    <input
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                      placeholder="Your name"
                      type="text"
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Email
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-3">
                  <Mail className="size-4 text-slate-400" />
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                    placeholder="you@example.com"
                    type="email"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Password
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-3">
                  <Lock className="size-4 text-slate-400" />
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                    placeholder={isSignup ? "Create your password" : "Managed by Google"}
                    type="password"
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    readOnly={!isSignup}
                  />
                </div>
              </div>

              {isSignup && (
                <div className="space-y-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
                  <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Confirm password
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-3">
                    <Lock className="size-4 text-slate-400" />
                    <input
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                      placeholder="Confirm password"
                      type="password"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-3xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-yellow-400"
              >
                {isSignup ? "Create workspace" : "Sign in with Google"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              By continuing, you agree to sign in using one of our providers.
            </p>

            <div className="mt-6 text-center text-sm text-slate-400">
              {isSignup ? "Already have an account?" : "New to LLM-Prop?"}{" "}
              <Link
                className="font-semibold text-yellow-400 transition hover:text-yellow-300"
                href={isSignup ? "/login" : "/signup"}
              >
                {isSignup ? "Sign in" : "Create workspace"}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
