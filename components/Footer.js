import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-brand bg-brand">
      <div className="mx-auto flex w-full max-w-6xl justify-center px-4 py-6 sm:px-6 lg:px-8">
        <nav
          aria-label="Links secundarios"
          className="flex flex-wrap justify-center gap-2"
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
