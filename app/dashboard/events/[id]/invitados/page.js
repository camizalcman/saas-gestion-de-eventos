import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import ToastProvider from "@/components/ToastProvider";
import ConfirmedGuestsList from "@/components/events/ConfirmedGuestsList";
import GuestForm from "@/components/events/GuestForm";
import GuestList from "@/components/events/GuestList";
import { getCurrentUser } from "@/lib/firebase/session";
import { getUserEvent } from "@/lib/events/events";
import { getCurrentUserProfile } from "@/lib/users/users";
import { addGuest, removeGuest, removeGuestMember } from "../../actions";

export const dynamic = "force-dynamic";

function buildOrigin(headersList) {
  const host =
    headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";
  const protocol =
    headersList.get("x-forwarded-proto") ||
    (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export default async function GuestsPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const profile = await getCurrentUserProfile(user);
  if (profile?.user_type !== "admin") redirect("/dashboard/panel");

  const event = await getUserEvent(user.uid, id);
  if (!event) notFound();

  const guests = event.guests || [];
  const origin = buildOrigin(await headers());
  const buildGuestLink = (token) => `${origin}/i/${token}`;

  return (
    <ToastProvider>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
        Lista de invitados
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-normal text-ink sm:text-4xl">
        Invitados
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-brand">
        Armá la lista de invitados de “{event.title}” con su cantidad, estado y
        link personalizado para enviarles la invitación.
      </p>

      <div className="mt-7">
        <GuestForm action={addGuest.bind(null, event.id)} />
      </div>

      <div className="mt-7">
        <GuestList
          buildGuestLink={buildGuestLink}
          guests={guests}
          removeAction={removeGuest.bind(null, event.id)}
          removeMemberAction={removeGuestMember.bind(null, event.id)}
        />
      </div>

      <div className="mt-7">
        <ConfirmedGuestsList confirmedGuests={event.confirmedGuests || []} />
      </div>

      <Link
        className="mt-7 inline-flex h-10 items-center justify-center rounded-md border border-accent px-4 text-sm font-semibold text-ink transition hover:border-secondary hover:bg-secondary/10"
        href={`/dashboard/events/${event.id}`}
      >
        Volver al evento
      </Link>
    </ToastProvider>
  );
}
