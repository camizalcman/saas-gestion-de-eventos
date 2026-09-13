import Link from "next/link";
import { redirect } from "next/navigation";
import EventForm from "@/components/events/EventForm";
import { getCurrentUser } from "@/lib/firebase/session";
import { getActiveEvent } from "@/lib/events/active";
import { updateEvent } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditEventPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const event = await getActiveEvent(user);
  if (!event) redirect("/dashboard");

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
        Evento
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">
        Editar evento
      </h1>
      <div className="mt-7">
        <EventForm
          action={updateEvent}
          event={event}
          submitLabel="Guardar cambios"
          useFirebaseStorage={process.env.FIREBASE_STORAGE === "true"}
        />
      </div>
      <Link
        className="mt-4 inline-flex h-10 items-center justify-center rounded-md border border-accent px-4 text-sm font-semibold text-ink transition hover:border-secondary hover:bg-secondary/10"
        href="/dashboard"
      >
        Volver al dashboard
      </Link>
    </>
  );
}