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
      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/70 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-6 md:px-8">
      <h1 className="mt-3 max-w-3xl text-4xl leading-[1.25] tracking-wide text-surface font-serif sm:text-6xl ">
            <span className="block">Organizá tu</span>
            <span className="block font-bold">próximo evento</span>
            </h1>
        <p className="mt-3 max-w-2xl text-lg leading-7 text-surface/80 sm:text-xl sm:leading-8">
          Armá las invitaciones y coordiná todos los detalles de tu fiesta
        </p>

        <div className="mt-6 flex flex-wrap gap-3 sm:flex">
          <Link
            className="inline-flex h-11 w-2/5 items-center justify-center rounded-lg border border-secondary bg-secondary px-4 text-sm font-semibold text-surface transition hover:border-surface hover:bg-surface hover:text-brand sm:w-auto sm:px-10"
            href={user ? "/dashboard" : "/login"}
          >
            {user ? "Ir al dashboard" : "Comenzar"}
          </Link>
          {!user ? (
            <a
              className="inline-flex h-11 w-2/5 items-center justify-center rounded-lg border-2 border-surface bg-transparent px-4 text-sm font-semibold text-surface transition hover:bg-surface/10 sm:w-auto sm:px-10"
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
