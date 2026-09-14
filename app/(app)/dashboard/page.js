import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import { getActiveEvent } from "@/lib/events/active";
import { listUserEvents } from "@/lib/events/events";
import { deleteEvent } from "./actions";

export const dynamic = "force-dynamic";

function formatDate(value) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

function SectionLink({ href, label, description }) {
  return (
    <Link
      className="flex items-center justify-between gap-3 rounded-md border border-accent bg-surface px-4 py-3 text-sm transition hover:border-secondary/50"
      href={href}
    >
      <span className="min-w-0">
        <span className="block font-semibold text-ink">{label}</span>
        <span className="block text-brand">{description}</span>
      </span>
      <span aria-hidden="true" className="text-ink">&rarr;</span>
    </Link>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const events = await listUserEvents(user.uid);

  if (events.length === 0) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-md border border-accent bg-surface p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
            Bienvenida
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-ink sm:text-3xl">
            Todavía no tenés eventos
          </h1>
          <p className="mt-3 text-sm leading-6 text-brand">
            Creá tu primer evento para empezar con la invitación digital, la
            lista de invitados y los proveedores.
          </p>
          <Link
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md border border-secondary bg-secondary px-4 text-sm font-semibold text-surface transition hover:bg-secondary/90"
            href="/dashboard/evento/nuevo"
          >
            Crear mi primer evento
          </Link>
        </div>
      </div>
    );
  }

  const event = await getActiveEvent(user, events);
  if (!event) redirect("/dashboard");

  const hasInvitation = Boolean(event.invitation);
  const guests = event.guests || [];
  const guestsCount = guests.length;
  const guestsTotal = guests.reduce((sum, guest) => sum + guest.quantity, 0);
  const providersCount = (event.providers || []).length;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mt-3 text-3xl font-semibold text-ink sm:text-3xl font-serif">
            {event.title}
          </h1>
          {event.published ? (
            <span className="mt-3 inline-block border border-accent px-2 py-1 text-xs uppercase text-brand">
              Publicado
            </span>
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
            href="/dashboard/evento/edit"
          >
            Editar datos del evento
          </Link>
          <form action={deleteEvent}>
            <button
              className="inline-flex h-10 items-center justify-center rounded-md border border-brand/40 px-4 text-sm font-semibold text-brand transition hover:bg-brand/10"
              type="submit"
            >
              Eliminar
            </button>
          </form>
        </div>
      </div>

      <div className="mt-5 grid gap-3 rounded-md border border-accent bg-surface p-4 text-sm text-brand sm:grid-cols-2">
        <p><span className="text-ink">Fecha:</span> {formatDate(event.date)}</p>
        <p><span className="text-ink">Ubicación:</span> {event.location || "—"}</p>
        <p><span className="text-ink">Tipo:</span> {event.eventType || "—"}</p>
        <p><span className="text-ink">Protagonistas:</span> {event.protagonists?.join(", ") || "—"}</p>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-ink">Secciones</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <SectionLink
            href="/dashboard/invitacion"
            label={hasInvitation ? "Editar invitación" : "Crear invitación digital"}
            description={
              hasInvitation
                ? "Cambiar textos, imágenes y colores de tu invitación"
                : "Personalizá tu invitación digital con textos, imágenes y colores"
            }
          />
          <SectionLink
            href="/dashboard/invitados"
            label="Invitados y mesas"
            description={
              guestsCount === 0
                ? "Todavía no hay invitados cargados. Armá la lista con cantidades."
                : `${guestsCount} ${guestsCount === 1 ? "invitado cargado" : "invitados cargados"} · ${guestsTotal} ${guestsTotal === 1 ? "persona" : "personas"} en total`
            }
          />
          <SectionLink
            href="/dashboard/proveedores"
            label="Proveedores"
            description={
              providersCount === 0
                ? "Todavía no hay proveedores cargados para tu evento."
                : `${providersCount} ${providersCount === 1 ? "proveedor cargado" : "proveedores cargados"}`
            }
          />
          <SectionLink
            href="/dashboard/cronograma"
            label="Cronograma"
            description="Coordiná el minuto a minuto de la fiesta."
          />
          <SectionLink
            href="/dashboard/presupuesto"
            label="Presupuesto"
            description="Controlá gastos y división de gastos."
          />
        </div>
      </div>
    </>
  );
}