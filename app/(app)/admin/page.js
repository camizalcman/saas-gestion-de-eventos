import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import { getCurrentUserProfile, listUserProfiles } from "@/lib/users/users";
import { getAdminStats } from "@/lib/admin/stats";

export const dynamic = "force-dynamic";

const MONTH_LABELS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function formatMonth(key) {
  const [year, monthIndex] = key.split("-").map(Number);
  return `${MONTH_LABELS[monthIndex - 1] || monthIndex} ${year}`;
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(value));
}

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await getCurrentUserProfile(user);
  if (profile?.user_type !== "admin") redirect("/dashboard");

  const [stats, users] = await Promise.all([getAdminStats(), listUserProfiles()]);
  const maxMonthlyUsers = stats.usersPerMonth.reduce(
    (max, entry) => Math.max(max, entry.count),
    0,
  );

  return (
    <>
      <header className="border-b border-accent pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
          Administracion
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-ink sm:text-4xl">
          Panel de administracion
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-brand">
          Estadisticas generales de la plataforma. No se muestran datos
          privados de los eventos de cada usuario.
        </p>
      </header>

      <section id="resumen" className="mt-7 grid gap-px overflow-hidden border border-accent bg-accent md:grid-cols-3">
        <article className="bg-surface p-5">
          <span className="block text-sm text-brand">Usuarios totales</span>
          <strong className="mt-3 block text-3xl font-semibold text-ink">
            {stats.totalUsers}
          </strong>
        </article>
        <article className="bg-surface p-5">
          <span className="block text-sm text-brand">Usuarios este mes</span>
          <strong className="mt-3 block text-3xl font-semibold text-ink">
            {stats.usersThisMonth}
          </strong>
        </article>
        <article className="bg-surface p-5">
          <span className="block text-sm text-brand">Eventos creados</span>
          <strong className="mt-3 block text-3xl font-semibold text-ink">
            {stats.totalEvents}
          </strong>
        </article>
      </section>

      <section id="estadisticas" className="mt-7">
        <div className="mb-3 grid gap-1">
          <h2 className="text-lg font-semibold text-ink">Usuarios por mes</h2>
          <p className="text-sm leading-6 text-brand">
            Altas de usuarios agrupadas por mes, segun su fecha de registro.
          </p>
        </div>
        {stats.usersPerMonth.length === 0 ? (
          <div className="border border-accent bg-surface p-6 text-sm text-brand">
            Todavia no hay registros.
          </div>
        ) : (
          <div className="grid gap-3 border border-accent bg-surface p-5">
            {stats.usersPerMonth.map((entry) => {
              const width = maxMonthlyUsers > 0 ? (entry.count / maxMonthlyUsers) * 100 : 0;
              return (
                <div className="grid gap-1" key={entry.month}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium text-ink">{formatMonth(entry.month)}</span>
                    <span className="text-brand">
                      {entry.count} {entry.count === 1 ? "usuario" : "usuarios"}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-accent">
                    <div
                      className="h-full rounded-full bg-secondary"
                      style={{ width: `${Math.max(width, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section id="usuarios" className="mt-7">
        <div className="mb-3 grid gap-1">
          <h2 className="text-lg font-semibold text-ink">Usuarios registrados</h2>
          <p className="text-sm leading-6 text-brand">
            Listado de perfiles sin datos privados de sus eventos.
          </p>
        </div>

        {users.length === 0 ? (
          <div className="border border-accent bg-surface p-6 text-sm text-brand">
            Todavia no hay usuarios registrados.
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
                      {managedUser.user_type === "admin" ? (
                        <span className="mt-1 inline-block border border-accent px-2 py-0.5 text-xs uppercase text-brand">
                          admin
                        </span>
                      ) : null}
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
    </>
  );
}