import Link from "next/link";
import { redirect } from "next/navigation";
import { listUserEvents } from "@/lib/events/events";
import { getCurrentUser } from "@/lib/firebase/session";
import { getCurrentUserProfile, listUserProfiles } from "@/lib/users/users";

export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await getCurrentUserProfile(user);
  const isAdmin = profile?.user_type === "admin";
  const events = isAdmin ? await listUserEvents(user.uid) : [];
  const users = isAdmin ? await listUserProfiles() : [];

  return (
    <>
      <header className="border-b border-accent pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
          Panel general
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-ink sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-brand">
          {isAdmin
            ? "Vista general de tus eventos y usuarios registrados."
            : "Tu panel personal."}
        </p>
      </header>

      <section className="mt-7 grid gap-px overflow-hidden border border-accent bg-accent lg:grid-cols-2">
        <article className="bg-surface p-5">
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
        </article>

        {isAdmin ? (
          <article className="bg-surface p-5">
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
          </article>
        ) : (
          <article className="bg-surface p-5">
            <span className="block text-sm text-brand">Mis eventos</span>
            <strong className="mt-3 block text-3xl font-semibold text-ink">
              0
            </strong>
            <p className="mt-3 text-sm leading-6 text-brand">
              Todavia no tenes eventos asignados. Cuando el anfitrion te invite, apareceran aqui.
            </p>
          </article>
        )}
      </section>
    </>
  );
}
