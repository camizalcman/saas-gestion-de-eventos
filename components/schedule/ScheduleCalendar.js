"use client";

import ScheduleDeleteButton from "@/components/schedule/ScheduleDeleteButton";

function timeToMinutes(value) {
  const [hours, minutes] = String(value || "").split(":").map(Number);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

function formatTime(value, isNextDay = false) {
  return `${value || "--:--"}${isNextDay ? " (+1)" : ""}`;
}

function ActivityTimelineItem({ activity, deleteAction, onEdit, providerNames }) {
  const activityProviders = activity.providerIds
    .map((providerId) => providerNames.get(providerId))
    .filter(Boolean);

  return (
    <li className="relative pl-10 sm:pl-14">
      <span
        aria-hidden="true"
        className="absolute left-0 top-5 z-10 size-4 -translate-x-1/2 rounded-full border-4 border-surface"
        style={{ backgroundColor: activity.color }}
      />
      <article
        className="border-l-4 p-4 shadow-sm"
        style={{
          backgroundColor: `${activity.color}22`,
          borderLeftColor: activity.color,
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h4 className="min-w-0 flex-1 overflow-wrap-anywhere text-sm font-semibold text-ink">
            {activity.title}
          </h4>
          <span className="shrink-0 text-xs font-semibold text-brand">
            {formatTime(activity.startTime)} - {formatTime(activity.endTime, activity.isOvernight)}
          </span>
        </div>

        {activity.description ? (
          <p className="mt-2 text-sm leading-5 text-brand">{activity.description}</p>
        ) : null}

        {activityProviders.length ? (
          <p className="mt-2 text-xs font-medium text-secondary">
            {activityProviders.join(" · ")}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2 border-t border-accent/70 pt-3">
          <button
            aria-label={`Editar actividad ${activity.title}`}
            className="h-9 border border-accent px-3 text-xs font-semibold text-ink transition hover:border-secondary hover:bg-secondary/10"
            onClick={() => onEdit(activity)}
            type="button"
          >
            Editar
          </button>
          <ScheduleDeleteButton
            action={deleteAction}
            activityId={activity.id}
            activityTitle={activity.title}
          />
        </div>
      </article>
    </li>
  );
}

export default function ScheduleCalendar({
  activities = [],
  deleteAction,
  onEdit,
  providers = [],
}) {
  const providerNames = new Map(
    providers.map((provider) => [provider.id, provider.name]),
  );
  const normalizedActivities = activities
    .map((activity) => {
      const startMinutes = timeToMinutes(activity.startTime);
      const rawEndMinutes = timeToMinutes(activity.endTime);

      if (startMinutes === null || rawEndMinutes === null) {
        return null;
      }

      const isOvernight = rawEndMinutes < startMinutes;

      return {
        ...activity,
        endMinutes: isOvernight ? rawEndMinutes + 24 * 60 : rawEndMinutes,
        isOvernight,
        startMinutes,
      };
    })
    .filter(
      (activity) =>
        activity && activity.endMinutes > activity.startMinutes,
    )
    .sort((a, b) => a.startMinutes - b.startMinutes);

  return (
    <section className="min-w-0 border border-accent bg-surface">
      <div className="border-b border-accent px-5 py-4">
        <h3 className="text-lg font-semibold text-ink">Agenda del día</h3>
        <p className="mt-1 text-sm text-brand">
          Actividades ordenadas cronológicamente.
        </p>
      </div>

      {normalizedActivities.length === 0 ? (
        <div className="flex min-h-56 items-center justify-center p-8 text-center">
          <p className="max-w-md text-sm leading-6 text-brand">
            Todavía no hay actividades. Cuando agregues una, va a aparecer en su
            horario dentro de esta línea de tiempo.
          </p>
        </div>
      ) : (
        <div className="p-5 sm:p-8">
          <ol className="relative grid gap-5 border-l border-accent py-1">
            {normalizedActivities.map((activity) => (
              <ActivityTimelineItem
                activity={activity}
                deleteAction={deleteAction}
                key={activity.id}
                onEdit={onEdit}
                providerNames={providerNames}
              />
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
