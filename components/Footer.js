import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-brand bg-brand">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 text-sm text-surface/80 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
        <div className="min-w-0">
          <p className="font-semibold uppercase tracking-[0.14em] text-surface">
            SaaS Starter
          </p>
          <p className="mt-2 max-w-2xl leading-6">
            Starter para aplicaciones SaaS con Next.js, Firebase
            Authentication, Firestore y rutas protegidas.
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-surface/60">
            Next.js + Firebase
          </p>
        </div>

        <nav
          aria-label="Links secundarios"
          className="flex flex-wrap gap-2 md:justify-end"
        >
          <Link
            className="rounded-md border border-accent px-3 py-2 font-medium text-surface transition hover:border-surface hover:bg-accent/20 hover:text-surface"
            href="/"
          >
            Home
          </Link>
          <Link
            className="rounded-md border border-accent px-3 py-2 font-medium text-surface transition hover:border-surface hover:bg-accent/20 hover:text-surface"
            href="/dashboard"
          >
            Dashboard
          </Link>
          <Link
            className="rounded-md border border-accent px-3 py-2 font-medium text-surface transition hover:border-surface hover:bg-accent/20 hover:text-surface"
            href="/login"
          >
            Login
          </Link>
        </nav>
      </div>
    </footer>
  );
}
