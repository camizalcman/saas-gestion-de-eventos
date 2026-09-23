import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import { getActiveEvent } from "@/lib/events/active";
import { listUserEvents } from "@/lib/events/events";
import { deleteEvent } from "./actions";
import ToastProvider from "@/components/ToastProvider";
import EventHeader from "@/components/dashboard/EventHeader";
import InvitationPanel from "@/components/dashboard/InvitationPanel";
import GuestsPanel from "@/components/dashboard/GuestsPanel";
import ProvidersPanel from "@/components/dashboard/ProvidersPanel";
import SchedulePanel from "@/components/dashboard/SchedulePanel";
import BudgetPanel from "@/components/dashboard/BudgetPanel";

export const dynamic = "force-dynamic";

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
  const providers = event.providers || [];
  const schedule = event.schedule || [];

  return (
    <ToastProvider>
      <div className="shrink-0">
        <EventHeader event={event} deleteAction={deleteEvent} />
      </div>

      <div className="mt-4 flex-1 min-h-0 lg:mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_minmax(0,0.75fr)]" style={{ minHeight: 0 }}>
        <div className="min-h-0 lg:col-start-1 lg:row-start-1">
          <InvitationPanel
            invitation={hasInvitation ? event.invitation : null}
            eventTitle={event.title}
          />
        </div>
        <div className="min-h-0 lg:col-start-2 lg:row-start-1">
          <GuestsPanel guests={guests} />
        </div>
        <div className="min-h-0 lg:col-start-1 lg:row-start-2">
          <ProvidersPanel providers={providers} />
        </div>
        <div className="min-h-0 lg:col-start-2 lg:row-start-2">
          <BudgetPanel budget={event.budget} />
        </div>
        <div className="min-h-0 lg:col-start-3 lg:row-span-2">
          <SchedulePanel schedule={schedule} />
        </div>
      </div>
    </ToastProvider>
  );
}
