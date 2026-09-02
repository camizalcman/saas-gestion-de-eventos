import Link from "next/link";

export default function Hero({ user }) {
  return (
    <section
      className="relative flex h-[90vh] w-full items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/fotoHero.jpg')" }}
    >
      <div className="absolute inset-0 bg-brand/60" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
          Gestion de eventos
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-normal text-surface sm:text-5xl lg:text-6xl lg:leading-none">
          Organizá tus próximos eventos
        </h1>
        <h2 className="mt-4 max-w-2xl text-base leading-7 text-surface/80">
          Creá, publicá y administrá eventos desde un solo lugar.
        </h2>
        <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
          <Link
            className="inline-flex h-11 w-full items-center justify-center rounded-md border border-secondary bg-secondary px-5 text-sm font-semibold text-surface transition hover:border-surface hover:bg-surface hover:text-brand sm:w-auto"
            href={user ? "/dashboard" : "/login"}
          >
            {user ? "Ir al dashboard" : "Ingresar"}
          </Link>
          {!user ? (
            <Link
              className="inline-flex h-11 w-full items-center justify-center rounded-md border border-surface/40 bg-transparent px-5 text-sm font-semibold text-surface transition hover:border-surface hover:bg-surface/10 sm:w-auto"
              href="/dashboard"
            >
              Ir al dashboard
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
