import ScheduleWorkspace from "@/components/schedule/ScheduleWorkspace";
import ScheduleDurationForm from "@/components/schedule/ScheduleDurationForm";

function formatEventDate(value, fallbackTime = "00:00") {
  const text = String(value || "").trim();
  const time = /^\d{2}:\d{2}$/.test(fallbackTime) ? fallbackTime : "00:00";
  const match = text.match(
    /^(\d{4}-\d{2}-\d{2})(?:T([01]\d|2[0-3]):([0-5]\d))?$/,
  );

  if (!match) return "Sin fecha";

  const [, date, hours = time.slice(0, 2), minutes = time.slice(3, 5)] = match;
  const parsed = new Date(`${date}T${hours}:${minutes}:00Z`);

  if (Number.isNaN(parsed.getTime())) return "Sin fecha";

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(parsed);
}

export default function CronogramaSection({
  action,
  deleteAction,
  durationAction,
  event,
  updateAction,
}) {
  return (
    <div
      className="mt-7 bg-surface"
      data-event-id={event.id}
    >
      <header className="w-full py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
              Evento activo
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink font-serif">
              {event.title || "Sin nombre"}
            </h2>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">
              Duración total estimada
            </p>
            <ScheduleDurationForm
              action={durationAction}
              duration={event.duration}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">
              Fecha del evento
            </p>
            <p className="mt-1 text-ink">
              {formatEventDate(
                event.date || event.invitation?.date,
                event.invitation?.time,
              )}
            </p>
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
