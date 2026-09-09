import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import { getCurrentUserProfile } from "@/lib/users/users";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await getCurrentUserProfile(user);

  return (
    <>
      <header className="border-b border-accent pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
          Mi cuenta
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-ink sm:text-4xl">
          Mi perfil
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-brand">
          Informacion basica de tu cuenta y datos de sesion.
        </p>
      </header>

      <section className="mt-7 grid gap-px overflow-hidden border border-accent bg-accent md:grid-cols-3">
        <article className="min-w-0 bg-surface p-5">
          <span className="block text-sm text-brand">Email</span>
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

      {profile?.displayName ? (
        <section className="mt-7 grid gap-px overflow-hidden border border-accent bg-accent md:grid-cols-2">
          <article className="min-w-0 bg-surface p-5">
            <span className="block text-sm text-brand">Nombre</span>
            <strong className="mt-3 block overflow-wrap-anywhere text-base font-semibold text-ink">
              {profile.displayName}
            </strong>
          </article>
          <article className="min-w-0 bg-surface p-5">
            <span className="block text-sm text-brand">Proveedor</span>
            <strong className="mt-3 block overflow-wrap-anywhere text-base font-semibold text-ink">
              {profile?.provider || "Desconocido"}
            </strong>
          </article>
        </section>
      ) : null}
    </>
  );
}
