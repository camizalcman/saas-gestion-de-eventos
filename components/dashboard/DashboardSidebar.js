"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const baseItems = [
  { href: "/dashboard", label: "Mi perfil" },
  { href: "/dashboard/panel", label: "Dashboard" },
];

const adminItems = [
  { href: "/dashboard/events", label: "Eventos" },
  { href: "/dashboard/users", label: "Usuarios" },
];

function isActive(pathname, href) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardSidebar({ isAdmin = false }) {
  const pathname = usePathname();
  const items = isAdmin ? [...baseItems, ...adminItems] : baseItems;

  return (
    <aside className="lg:w-64 lg:flex-shrink-0">
      <nav
        aria-label="Secciones del panel"
        className="lg:sticky lg:top-7"
      >
        <ul className="flex flex-row gap-1 overflow-x-auto border border-accent bg-surface p-1 lg:mt-4 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0">
          {items.map((item) => {
            const active = isActive(pathname, item.href);

            return (
              <li className="min-w-0 lg:border-b lg:border-accent/60 lg:last:border-b-0" key={item.href}>
                <Link
                  className={`block border px-3 py-2 text-sm font-semibold whitespace-nowrap transition ${
                    active
                      ? "border-brand bg-brand text-surface lg:border-brand lg:bg-brand/10 lg:text-ink"
                      : "border-transparent text-ink hover:bg-accent/30 lg:border-0 lg:bg-transparent"
                  }`}
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
