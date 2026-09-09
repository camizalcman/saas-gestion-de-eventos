import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import EventForm from "@/components/events/EventForm";
import { getCurrentUser } from "@/lib/firebase/session";
import { getUserEvent } from "@/lib/events/events";
import { getCurrentUserProfile } from "@/lib/users/users";
import { updateEvent } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const profile = await getCurrentUserProfile(user);
  if (profile?.user_type !== "admin") redirect("/dashboard/panel");

  const event = await getUserEvent(user.uid, id);
  if (!event) notFound();

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">Firestore</p>
      <h1 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Editar evento</h1>
      <div className="mt-7">
        <EventForm
          action={updateEvent.bind(null, event.id)}
          event={event}
          submitLabel="Guardar cambios"
          useFirebaseStorage={process.env.FIREBASE_STORAGE === "true"}
        />
      </div>
      <Link
        className="mt-4 inline-flex h-10 items-center justify-center rounded-md border border-accent px-4 text-sm font-semibold text-ink transition hover:border-secondary hover:bg-secondary/10"
        href="/dashboard/events"
      >
        Volver a eventos
      </Link>
    </>
  );
}
