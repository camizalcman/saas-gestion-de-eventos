"use client";

import Link from "next/link";

export default function Hero({ user }) {
  function scrollToFuncionalidades(e) {
    e.preventDefault();
    document
      .getElementById("funcionalidades")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section
      className="relative flex h-[90vh] w-full items-end justify-center pb-12 bg-cover bg-center"
      style={{ backgroundImage: "url('/fotoHero4.jpg')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/80 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-6 sm:px-6 lg:px-8">
        <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-snug tracking-normal text-surface font-serif sm:text-5xl lg:text-6xl">
          Organizá tu
          <br />
          próximo evento
        </h1>
        <p className="mt-2 max-w-2xl text-md leading-8 text-surface/80 sm:text-xl">
          Armá las invitaciones y coordiná todos los detalles de tu fiesta
        </p>

        <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
          <Link
            className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-secondary bg-secondary px-10 text-sm font-semibold text-surface transition hover:border-surface hover:bg-surface hover:text-brand sm:w-auto"
            href={user ? "/dashboard" : "/login"}
          >
            {user ? "Ir al dashboard" : "Comenzar"}
          </Link>
          {!user ? (
            <a
              className="inline-flex h-11 w-full items-center justify-center rounded-lg border-2 border-surface bg-transparent px-10 text-sm font-semibold text-surface transition hover:bg-surface/10 sm:w-auto"
              href="#funcionalidades"
              onClick={scrollToFuncionalidades}
            >
              Conocer más
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
