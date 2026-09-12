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

function getSafeNextPath(value) {
  if (!value) {
    return "/dashboard";
  }

  try {
    const url = new URL(value, "https://app.local");

    if (url.origin !== "https://app.local") {
      return "/dashboard";
    }

    return `${url.pathname}${url.search}${url.hash}` || "/dashboard";
  } catch {
    return "/dashboard";
  }
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = getSafeNextPath(searchParams.get("next"));
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
        className="mb-6 grid grid-cols-2 rounded-full border border-accent bg-accent/40 p-1"
        aria-label="Modo de autenticacion"
      >
        <button
          type="button"
          className={`h-8 rounded-full text-sm font-semibold transition ${
            mode === "signin"
              ? "bg-brand text-surface"
              : "text-ink/60 hover:text-ink"
          }`}
          onClick={() => setMode("signin")}
          disabled={loading}
        >
          Ingresar
        </button>
        <button
          type="button"
          className={`h-8 rounded-full text-sm font-semibold transition ${
            mode === "signup"
              ? "bg-brand text-surface"
              : "text-ink/60 hover:text-ink"
          }`}
          onClick={() => setMode("signup")}
          disabled={loading}
        >
          Crear cuenta
        </button>
      </div>

      <h1
        id="login-title"
        className="mt-3 text-2xl font-semibold tracking-normal text-brand sm:text-3xl"
      >
        Creá tu fiesta soñada
      </h1>
      <p className="mt-3 text-sm leading-6 text-ink/70">
        Gestioná tu evento en un solo lugar
      </p>

      <form onSubmit={handleEmailSubmit} className="mt-7 grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-ink">
          <span>Email</span>
          <input
            className="h-10 rounded-md border border-accent bg-surface px-3 text-ink outline-none transition placeholder:text-ink/50 focus:border-brand"
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
            className="h-10 rounded-md border border-accent bg-surface px-3 text-ink outline-none transition placeholder:text-ink/50 focus:border-brand"
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
          className="mt-2 h-10 rounded-md border border-secondary bg-secondary px-4 text-sm font-semibold text-surface transition hover:bg-secondary/90 disabled:hover:bg-secondary"
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
        className="flex h-10 w-full items-center justify-center gap-2.5 rounded-md border border-accent bg-transparent px-3 text-sm font-semibold text-ink transition hover:border-brand hover:bg-accent/40"
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        <svg aria-hidden="true" className="size-4.5" viewBox="0 0 24 24">
          <path
            d="M21.6 12.23c0-.68-.06-1.36-.18-2.03H12v3.85h5.39a4.63 4.63 0 0 1-2 3.04v2.5h3.24c1.9-1.75 2.97-4.33 2.97-7.36Z"
            fill="#4285F4"
          />
          <path
            d="M12 22c2.7 0 4.97-.9 6.62-2.41l-3.23-2.5c-.9.6-2.05.96-3.39.96-2.6 0-4.8-1.76-5.6-4.13H3.07v2.58A10 10 0 0 0 12 22Z"
            fill="#34A853"
          />
          <path
            d="M6.4 13.92a6 6 0 0 1 0-3.83V7.5H3.07a10 10 0 0 0 0 9l3.33-2.58Z"
            fill="#FBBC05"
          />
          <path
            d="M12 6.04c1.48 0 2.8.5 3.84 1.5l2.88-2.88A9.5 9.5 0 0 0 12 2 10 10 0 0 0 3.07 7.5L6.4 10.1c.8-2.37 3-4.06 5.6-4.06Z"
            fill="#EA4335"
          />
        </svg>
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
