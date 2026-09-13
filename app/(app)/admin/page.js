import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import { getCurrentUserProfile, listUserProfiles } from "@/lib/users/users";
import { getAdminStats } from "@/lib/admin/stats";

export const dynamic = "force-dynamic";

const MONTH_SHORT = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const PLOT_HEIGHT = 176;

function shortMonthLabel(key) {
  const [year, month] = key.split("-").map(Number);
  const name = MONTH_SHORT[month - 1] || String(month);
  return month === 1 ? `${name} ${String(year).slice(-2)}` : name;
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(value));
}

function MonthBarChart({ title, months = [], counts = [], max = 1, labelFormat }) {
  if (months.length === 0) {
    return (
      <section className="rounded-lg border border-accent bg-surface p-5">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <p className="mt-4 text-sm text-brand">Todavía no hay registros.</p>
      </section>
    );
  }

  const ariaLabel = `${title}: ${months
    .map((month, index) => `${labelFormat(month)} ${counts[index] || 0}`)
    .join(", ")}`;

  return (
    <section className="rounded-lg border border-accent bg-surface p-5">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <div aria-label={ariaLabel} role="img">
        <div className="mt-5 flex h-44 items-end justify-between gap-2 sm:gap-3">
          {months.map((month, index) => {
            const count = counts[index] || 0;
            const barHeight =
              count > 0
                ? Math.max(Math.round((count / max) * PLOT_HEIGHT), 4)
                : 2;

            return (
              <div
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"
                key={month}
              >
                <span className="text-xs font-semibold tabular-nums text-ink">
                  {count}
                </span>
                <div
                  aria-hidden="true"
                  className="w-full max-w-9 rounded-t-md bg-secondary"
                  style={{ height: `${barHeight}px` }}
                  title={`${labelFormat(month)}: ${count}`}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-accent pt-2 sm:gap-3">
          {months.map((month) => (
            <span
              className="min-w-0 flex-1 text-center text-[11px] font-medium text-brand"
              key={month}
            >
              {labelFormat(month)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await getCurrentUserProfile(user);
  if (profile?.user_type !== "admin") redirect("/dashboard");

  const [stats, users] = await Promise.all([getAdminStats(), listUserProfiles()]);

  const axisMonths = [
    ...new Set([
      ...stats.usersPerMonth.map((entry) => entry.month),
      ...stats.eventsPerMonth.map((entry) => entry.month),
    ]),
  ].sort();

  function getCount(series, month) {
    return series.find((entry) => entry.month === month)?.count || 0;
  }

  const usersCounts = axisMonths.map((month) => getCount(stats.usersPerMonth, month));
  const eventsCounts = axisMonths.map((month) => getCount(stats.eventsPerMonth, month));
  const maxCount = Math.max(...usersCounts, ...eventsCounts, 1);

  return (
    <>
      <header className="border-b border-accent pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
          Administración
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-ink sm:text-4xl">
          Panel de administración
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-brand">
          Estadísticas generales de la plataforma.
        </p>
      </header>

      <section className="mt-7 grid gap-4 sm:grid-cols-2" id="resumen">
        <article className="rounded-lg bg-secondary p-6 text-surface">
          <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-surface/80">
            Usuarios creados
          </span>
          <strong className="mt-3 block text-4xl font-semibold tabular-nums">
            {stats.totalUsers}
          </strong>
        </article>
        <article className="rounded-lg bg-secondary p-6 text-surface">
          <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-surface/80">
            Eventos creados
          </span>
          <strong className="mt-3 block text-4xl font-semibold tabular-nums">
            {stats.totalEvents}
          </strong>
        </article>
      </section>

      <section className="mt-7" id="usuarios">
        <div className="mb-3 grid gap-1">
          <h2 className="text-lg font-semibold text-ink">Usuarios registrados</h2>
          <p className="text-sm leading-6 text-brand">
            Listado de perfiles de los usuarios de la plataforma.
          </p>
        </div>

        {users.length === 0 ? (
          <div className="border border-accent bg-surface p-6 text-sm text-brand">
            Todavía no hay usuarios registrados.
          </div>
        ) : (
          <div className="overflow-x-auto border border-accent">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-accent/60 text-xs uppercase tracking-[0.12em] text-brand">
                <tr>
                  <th className="px-4 py-3 font-semibold" scope="col">Nombre</th>
                  <th className="px-4 py-3 font-semibold" scope="col">Email</th>
                  <th className="px-4 py-3 font-semibold" scope="col">Tipo</th>
                  <th className="px-4 py-3 font-semibold" scope="col">Alta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent">
                {users.map((managedUser) => (
                  <tr className="bg-surface" key={managedUser.uid}>
                    <td className="min-w-0 px-4 py-3 font-medium text-ink">
                      <span className="block overflow-wrap-anywhere">
                        {managedUser.displayName || "Sin nombre"}
                      </span>
                    </td>
                    <td className="min-w-0 px-4 py-3 text-brand">
                      <span className="block overflow-wrap-anywhere">
                        {managedUser.email || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-brand capitalize">
                      {managedUser.user_type}
                    </td>
                    <td className="px-4 py-3 text-brand">
                      {formatDate(managedUser.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-7" id="estadisticas">
        <div className="mb-3 grid gap-1">
          <h2 className="text-lg font-semibold text-ink">Estadísticas por mes</h2>
          <p className="text-sm leading-6 text-brand">
            Registros agrupados por mes según su fecha de creación.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <MonthBarChart
            counts={usersCounts}
            labelFormat={shortMonthLabel}
            max={maxCount}
            months={axisMonths}
            title="Usuarios por mes"
          />
          <MonthBarChart
            counts={eventsCounts}
            labelFormat={shortMonthLabel}
            max={maxCount}
            months={axisMonths}
            title="Eventos creados por mes"
          />
        </div>
      </section>
    </>
  );
}