import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import { getActiveEvent } from "@/lib/events/active";

export const dynamic = "force-dynamic";

export default async function CronogramaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const event = await getActiveEvent(user);
  if (!event) redirect("/dashboard");

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
        Cronograma
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-normal text-ink sm:text-4xl">
        Cronograma
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-brand">
        Coordiná el minuto a minuto de la fiesta de “{event.title}”.
      </p>

      <div className="mt-7 border border-accent bg-surface p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">
          Disponible próximamente
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-brand">
          Acá vas a poder armar las etapas del evento con horarios, contactos y
          tareas de cada proveedor.
        </p>
      </div>

      <Link
        className="mt-7 inline-flex h-10 items-center justify-center rounded-md border border-accent px-4 text-sm font-semibold text-ink transition hover:border-secondary hover:bg-secondary/10"
        href="/dashboard"
      >
        Volver al dashboard
      </Link>
    </>
  );
}