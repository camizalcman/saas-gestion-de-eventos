import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/firebase/session";
import { getUserEvent } from "@/lib/events/events";
import { getCurrentUserProfile } from "@/lib/users/users";

export const dynamic = "force-dynamic";

function formatDate(value) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "full", timeStyle: "short" }).format(new Date(value));
}

function SectionLink({ href, label, description, active }) {
  return (
    <Link
      className={`flex items-center justify-between gap-3 rounded-md border px-4 py-3 text-sm transition ${
        active
          ? "border-secondary bg-secondary/20 text-ink"
          : "border-accent bg-surface text-ink hover:border-secondary/50"
      }`}
      href={href}
    >
      <span className="min-w-0">
        <span className="block font-semibold">{label}</span>
        <span className="block text-brand">{description}</span>
      </span>
      <span aria-hidden="true">&rarr;</span>
    </Link>
  );
}

export default async function EventDetailPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const profile = await getCurrentUserProfile(user);
  if (profile?.user_type !== "admin") redirect("/dashboard");

  const event = await getUserEvent(user.uid, id);
  if (!event) notFound();

  const hasInvitation = Boolean(event.invitation);

  return (
    <main className="min-h-screen bg-surface text-ink">
      <Navbar user={user} profile={profile} />
      <section className="mx-auto w-full max-w-4xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">Evento</p>
            <h1 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">{event.title}</h1>
            {event.published ? (
              <span className="mt-3 inline-block border border-accent px-2 py-1 text-xs uppercase text-brand">Publicado</span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {hasInvitation && event.published ? (
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md border border-secondary bg-secondary px-4 text-sm font-semibold text-surface transition hover:bg-secondary/90"
                href={`/events/${event.id}/invitacion`}
                target="_blank"
              >
                Ver invitación pública
              </Link>
            ) : null}
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-accent px-4 text-sm font-semibold text-ink transition hover:border-secondary hover:bg-secondary/10"
              href={`/dashboard/events/${event.id}/edit`}
            >
              Editar datos del evento
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-3 rounded-md border border-accent p-4 text-sm text-brand sm:grid-cols-2">
          <p><span className="text-ink">Fecha:</span> {formatDate(event.date)}</p>
          <p><span className="text-ink">Ubicación:</span> {event.location || "—"}</p>
          <p><span className="text-ink">Tipo:</span> {event.eventType || "—"}</p>
          <p><span className="text-ink">Protagonistas:</span> {event.protagonists?.join(", ") || "—"}</p>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold">Secciones</h2>
          <div className="mt-4 grid gap-3">
            <SectionLink
              active
              href={`/dashboard/events/${event.id}/invitacion`}
              label={hasInvitation ? "Editar invitación" : "Crear invitación digital"}
              description={hasInvitation ? "Cambiar textos, imágenes y colores de tu invitación" : "Personalizá tu invitación digital con textos, imágenes y colores"}
            />
            <SectionLink
              href="#"
              label="Confirmados"
              description="Próximamente"
            />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
