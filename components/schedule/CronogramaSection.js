import ScheduleWorkspace from "@/components/schedule/ScheduleWorkspace";

function formatEventDate(value) {
  if (!value) return "Sin fecha";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

export default function CronogramaSection({ action, deleteAction, event, updateAction }) {
  return (
    <div
      className="mt-7 border border-accent bg-surface"
      data-event-id={event.id}
    >
      <header className="border-b border-accent px-5 py-5 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
          Evento activo
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-ink font-serif">
          {event.title || "Sin nombre"}
        </h2>

        <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">
              Fecha del evento
            </p>
            <p className="mt-1 text-ink">{formatEventDate(event.date)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">
              Duración total estimada
            </p>
            <p className="mt-1 text-ink">A definir</p>
          </div>
        </div>
      </header>

      <ScheduleWorkspace
        action={action}
        activities={event.schedule || []}
        deleteAction={deleteAction}
        providers={(event.providers || []).filter((provider) => !provider.deleted)}
        updateAction={updateAction}
      />
    </div>
  );
}
