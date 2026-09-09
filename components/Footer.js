import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Mi perfil" },
  { href: "/login", label: "Login" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-brand bg-brand text-surface">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link
              className="text-sm font-semibold uppercase tracking-[0.14em] text-surface"
              href="/"
            >
              Gestión de eventos
            </Link>
            <p className="mt-3 text-sm leading-6 text-surface/70">
              Plataforma para crear, administrar y compartir invitaciones
              digitales con tus invitados.
            </p>
          </div>

          <nav aria-label="Links secundarios">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-surface/60">
              Navegacion
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    className="text-surface/80 transition hover:text-surface"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-surface/15 pt-6 text-xs text-surface/60 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} Gestion de eventos. Todos los derechos reservados.</p>
          <p>Hecho con Next.js y Firebase.</p>
        </div>
      </div>
    </footer>
  );
}
