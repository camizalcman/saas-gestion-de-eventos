"use client";

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { getClientAuth, getGoogleProvider } from "@/lib/firebase/client";

async function persistSession(user) {
  const idToken = await user.getIdToken();
  const response = await fetch("/api/session/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error("No se pudo crear la sesion en el servidor.");
  }
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/dashboard";
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  async function finishLogin(userCredential) {
    setLoadingMessage("Creando sesion segura...");
    await persistSession(userCredential.user);
    setLoadingMessage("Redirigiendo al dashboard...");
    router.push(nextUrl);
    router.refresh();
  }

  async function handleEmailSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setLoadingMessage(
      mode === "signup" ? "Creando cuenta..." : "Iniciando sesion...",
    );
    setError("");

    try {
      const action =
        mode === "signup"
          ? createUserWithEmailAndPassword
          : signInWithEmailAndPassword;

      await finishLogin(await action(getClientAuth(), email, password));
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesion.");
      setLoading(false);
      setLoadingMessage("");
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setLoadingMessage("Conectando con Google...");
    setError("");

    try {
      await finishLogin(await signInWithPopup(getClientAuth(), getGoogleProvider()));
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesion con Google.");
      setLoading(false);
      setLoadingMessage("");
    }
  }

  return (
    <section
      className="w-full max-w-md rounded-xl bg-transparent p-0 sm:p-0"
      aria-labelledby="login-title"
    >
      <div
        className="mb-7 grid grid-cols-2 rounded-lg border border-accent bg-accent/40 p-1"
        aria-label="Modo de autenticacion"
      >
        <button
          type="button"
          className={`h-10 rounded-md text-sm font-semibold transition ${
            mode === "signin"
              ? "border border-brand bg-brand text-surface"
              : "border border-transparent text-ink/60 hover:text-ink"
          }`}
          onClick={() => setMode("signin")}
          disabled={loading}
        >
          Ingresar
        </button>
        <button
          type="button"
          className={`h-10 rounded-md text-sm font-semibold transition ${
            mode === "signup"
              ? "border border-brand bg-brand text-surface"
              : "border border-transparent text-ink/60 hover:text-ink"
          }`}
          onClick={() => setMode("signup")}
          disabled={loading}
        >
          Crear cuenta
        </button>
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
        Firebase Auth
      </p>
      <h1
        id="login-title"
        className="mt-3 text-2xl font-semibold tracking-normal text-brand sm:text-3xl"
      >
        SaaS Starter
      </h1>
      <p className="mt-3 text-sm leading-6 text-ink/70">
        Boilerplate Next server-side con Firebase Auth, email/password y Google.
      </p>

      <form onSubmit={handleEmailSubmit} className="mt-7 grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-ink">
          <span>Email</span>
          <input
            className="h-11 rounded-md border border-accent bg-surface px-3 text-ink outline-none transition placeholder:text-ink/50 focus:border-brand"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            disabled={loading}
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          <span>Password</span>
          <input
            className="h-11 rounded-md border border-accent bg-surface px-3 text-ink outline-none transition placeholder:text-ink/50 focus:border-brand"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            minLength={6}
            disabled={loading}
            required
          />
        </label>
        <button
          type="submit"
          className="mt-2 h-11 rounded-md border border-brand bg-brand px-4 text-sm font-semibold text-surface transition hover:border-ink hover:bg-ink disabled:hover:border-brand disabled:hover:bg-brand"
          disabled={loading}
        >
          {loading ? "Procesando..." : mode === "signup" ? "Crear cuenta" : "Ingresar"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-ink/60">
        <span className="h-px flex-1 bg-accent" />
        <span>o</span>
        <span className="h-px flex-1 bg-accent" />
      </div>

      <button
        type="button"
        className="h-11 w-full rounded-md border border-accent bg-transparent px-4 text-sm font-semibold text-brand transition hover:border-brand hover:bg-accent/40"
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        {loading ? "Procesando..." : "Continuar con Google"}
      </button>

      {error ? (
        <p className="mt-5 rounded-lg border border-red-900/70 bg-red-950/40 p-3 text-sm leading-6 text-red-300">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-surface/90 px-5 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="w-full max-w-sm rounded-xl border border-accent bg-surface p-6 text-center">
            <div className="mx-auto h-10 w-10 animate-spin border border-accent border-t-brand" />
            <p className="mt-5 text-sm font-semibold text-brand">
              {loadingMessage || "Procesando autenticacion..."}
            </p>
            <p className="mt-2 text-sm leading-6 text-ink/60">
              Validando identidad y preparando la sesion.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
