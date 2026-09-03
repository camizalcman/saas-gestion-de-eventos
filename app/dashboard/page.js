import { redirect } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/firebase/session";
import { listUserEvents } from "@/lib/events/events";
import { getCurrentUserProfile, listUserProfiles } from "@/lib/users/users";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentUserProfile(user);
  const isAdmin = profile?.user_type === "admin";
  const events = isAdmin ? await listUserEvents(user.uid) : [];
  const users = isAdmin ? await listUserProfiles() : [];

  return (
    <main className="min-h-screen bg-surface text-ink">
      <Navbar user={user} profile={profile} />
      <header className="mx-auto flex w-full max-w-6xl flex-col gap-5 border-b border-accent px-4 py-7 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
            Ruta protegida
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-ink sm:text-5xl lg:text-6xl">
            Dashboard
          </h1>
        </div>
      </header>

      <section className="mx-auto mt-7 grid w-[calc(100%-2rem)] max-w-6xl grid-cols-1 gap-px overflow-hidden border border-accent bg-accent sm:w-[calc(100%-3rem)] md:grid-cols-3 lg:w-[calc(100%-4rem)]">
        <article className="min-w-0 bg-surface p-5">
          <span className="block text-sm text-brand">Usuario</span>
          <strong className="mt-3 block overflow-wrap-anywhere text-base font-semibold text-ink">
            {user.email || "Sin email"}
          </strong>
        </article>
        <article className="min-w-0 bg-surface p-5">
          <span className="block text-sm text-brand">UID</span>
          <strong className="mt-3 block overflow-wrap-anywhere font-mono text-sm font-medium text-ink">
            {user.uid}
          </strong>
        </article>
        <article className="min-w-0 bg-surface p-5">
          <span className="block text-sm text-brand">Tipo</span>
          <strong className="mt-3 block overflow-wrap-anywhere text-base font-semibold text-ink">
            {profile?.user_type || "user"}
          </strong>
        </article>
      </section>

      <section className="mx-auto mt-7 grid w-[calc(100%-2rem)] max-w-6xl gap-px overflow-hidden border border-accent bg-accent sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)] lg:grid-cols-2">
        {isAdmin ? (
          <div className="bg-surface p-5">
            <span className="block text-sm text-brand">Eventos propios</span>
            <strong className="mt-3 block text-3xl font-semibold text-ink">
              {events.length}
            </strong>
            <p className="mt-3 text-sm leading-6 text-brand">
              Eventos creados y administrados por el anfitrion.
            </p>
            <Link
              className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-md border border-secondary bg-secondary px-4 text-sm font-semibold text-surface transition hover:bg-secondary/90 sm:w-auto"
              href="/dashboard/events"
            >
              Ver eventos
            </Link>
          </div>
        ) : (
          <div className="bg-surface p-5">
            <span className="block text-sm text-brand">Mis eventos</span>
            <strong className="mt-3 block text-3xl font-semibold text-ink">0</strong>
            <p className="mt-3 text-sm leading-6 text-brand">
              Todavia no tenes eventos asignados. Cuando el anfitrion te invite, apareceran aqui.
            </p>
          </div>
        )}

        {isAdmin ? (
          <div className="bg-surface p-5">
            <span className="block text-sm text-brand">
              Usuarios registrados
            </span>
            <strong className="mt-3 block text-3xl font-semibold text-ink">
              {users.length}
            </strong>
            <p className="mt-3 text-sm leading-6 text-brand">
              Gestion de perfiles de usuario disponible para cuentas admin.
            </p>
            <Link
              className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-md border border-accent bg-transparent px-4 text-sm font-semibold text-ink transition hover:border-secondary hover:bg-secondary/10 sm:w-auto"
              href="/dashboard/users"
            >
              Gestionar usuarios
            </Link>
          </div>
        ) : null}
      </section>
      <Footer />
    </main>
  );
}
