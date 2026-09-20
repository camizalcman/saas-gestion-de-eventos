import Link from "next/link";
import { CalendarClock } from "lucide-react";

export default function SchedulePanel({ schedule }) {
  const preview = schedule.slice(0, 4);

  return (
    <div className="flex h-full flex-col rounded-xl border border-accent bg-surface p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-secondary/15">
          <CalendarClock className="size-5 text-secondary" />
        </div>
        <h3 className="text-sm font-semibold text-ink">Cronograma</h3>
      </div>

      <div className="mt-4 flex-1">
        {schedule.length === 0 ? (
          <p className="text-sm text-brand">
            Todavía no hay actividades en el cronograma.
          </p>
        ) : (
          <ul className="space-y-2">
            {preview.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-md border border-accent/50 px-3 py-2 text-sm"
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="min-w-0 flex-1 truncate font-medium text-ink">
                  {item.title}
                </span>
                <span className="shrink-0 text-xs text-brand">
                  {item.startTime} – {item.endTime}
                </span>
              </li>
            ))}
            {schedule.length > 4 ? (
              <li className="pt-1 text-center text-xs text-brand">
                +{schedule.length - 4} más
              </li>
            ) : null}
          </ul>
        )}
      </div>

      <Link
        href="/dashboard/cronograma"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-accent bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-secondary hover:bg-secondary/10"
      >
        Organizar cronograma
      </Link>
    </div>
  );
}
