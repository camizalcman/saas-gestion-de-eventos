"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/dashboard/actions";

function isActivePath(pathname, href) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ href, label, onClick, pathname }) {
  const active = isActivePath(pathname, href);

  return (
    <Link
      className={`block border px-3 py-2 text-sm font-medium transition ${
        active
          ? "border-brand bg-accent/30 text-surface"
          : "border-transparent text-surface/80 hover:bg-accent/20 hover:text-surface"
      }`}
      href={href}
      onClick={onClick}
    >
      {label}
    </Link>
  );
}

export default function Navbar({ actions, profile, user }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const userType = profile?.user_type || "user";
  const links = [
    { href: "/", label: "Home" },
    ...(user ? [{ href: "/dashboard", label: "Mi perfil" }] : []),
  ];

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <nav className="border-b border-brand bg-brand">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-3 py-3">
          <Link
            className="min-w-0 overflow-wrap-anywhere text-sm font-semibold uppercase tracking-[0.14em] text-surface"
            href="/"
            onClick={closeMenu}
          >
            Gestión de eventos
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-between gap-4 md:flex">
            <div className="ml-4 flex min-w-0 flex-wrap items-center gap-1">
              {links.map((link) => (
                <NavLink
                  href={link.href}
                  key={link.href}
                  label={link.label}
                  pathname={pathname}
                />
              ))}
            </div>

            <div className="flex min-w-0 items-center justify-end gap-3">
              {actions}
              {user ? (
                <>
                  <span className="min-w-0 max-w-64 overflow-wrap-anywhere text-right text-sm text-surface/80">
                    {user.email || "Sin email"} ({userType})
                  </span>
                  <form action={logout}>
                    <button
                      className="h-10 rounded-md border border-accent bg-transparent px-4 text-sm font-semibold text-surface transition hover:border-surface hover:bg-accent/20"
                      type="submit"
                    >
                      Cerrar sesion
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md border border-surface bg-surface px-4 text-sm font-semibold text-brand transition hover:border-accent hover:bg-accent"
                  href="/login"
                >
                  Login
                </Link>
              )}
            </div>
          </div>

          <button
            aria-controls="mobile-menu"
            aria-expanded={isOpen}
            className="grid size-10 place-items-center rounded-md border border-accent bg-transparent text-surface transition hover:border-surface hover:bg-accent/20 md:hidden"
            onClick={() => setIsOpen((value) => !value)}
            type="button"
          >
            <span className="sr-only">Abrir menu</span>
            <span className="grid gap-1.5">
              <span className="block h-px w-5 bg-surface" />
              <span className="block h-px w-5 bg-surface" />
              <span className="block h-px w-5 bg-surface" />
            </span>
          </button>
        </div>

        <div
          className={`grid gap-3 overflow-hidden transition-[grid-template-rows,padding] duration-200 md:hidden ${
            isOpen ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr] pb-0"
          }`}
          id="mobile-menu"
        >
          <div className="min-h-0 overflow-hidden">
            <div className="grid gap-1 border-t border-surface/20 pt-3">
              {links.map((link) => (
                <NavLink
                  href={link.href}
                  key={link.href}
                  label={link.label}
                  onClick={closeMenu}
                  pathname={pathname}
                />
              ))}
            </div>

            <div className="mt-3 grid min-w-0 gap-3 border-t border-surface/20 pt-3">
              {actions}
              {user ? (
                <span className="overflow-wrap-anywhere text-sm text-surface/80">
                  {user.email || "Sin email"} ({userType})
                </span>
              ) : null}
            </div>

          {user ? (
            <form action={logout} className="mt-3">
              <button
                className="h-10 w-full rounded-md border border-accent bg-transparent px-4 text-sm font-semibold text-surface transition hover:border-surface hover:bg-accent/20"
                type="submit"
              >
                Cerrar sesion
              </button>
            </form>
          ) : (
            <Link
              className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-md border border-surface bg-surface px-4 text-sm font-semibold text-brand transition hover:border-accent hover:bg-accent"
              href="/login"
              onClick={closeMenu}
            >
              Login
            </Link>
          )}
        </div>
        </div>
      </div>
    </nav>
  );
}
