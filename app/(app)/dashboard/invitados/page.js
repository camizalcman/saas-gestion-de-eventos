import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ToastProvider from "@/components/ToastProvider";
import GuestForm from "@/components/events/GuestForm";
import GuestList from "@/components/events/GuestList";
import SeatingSection from "@/components/events/SeatingSection";
import { getCurrentUser } from "@/lib/firebase/session";
import { getActiveEvent } from "@/lib/events/active";
import {
  addGuest,
  assignGuestTable,
  removeGuest,
  removeGuestMember,
  saveEventTablePositions,
  saveEventTables,
} from "../actions";

export const dynamic = "force-dynamic";

function buildOrigin(headersList) {
  const host =
    headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";
  const protocol =
    headersList.get("x-forwarded-proto") ||
    (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export default async function InvitadosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const event = await getActiveEvent(user);
  if (!event) redirect("/dashboard");

  const guests = event.guests || [];
  const origin = buildOrigin(await headers());
  const buildGuestLink = (token) => `${origin}/i/${token}`;

  return (
    <ToastProvider>
      <h1 className="mt-3 text-3xl font-semibold tracking-normal text-ink sm:text-3xl font-serif">
        Invitados
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-brand">
        Armá la lista de invitados de “{event.title}” con su cantidad, estado y
        link personalizado para enviarles la invitación.
      </p>

      <div className="mt-7">
        <GuestForm action={addGuest} />
      </div>

      <div className="mt-7">
        <GuestList
          buildGuestLink={buildGuestLink}
          guests={guests}
          removeAction={removeGuest}
          removeMemberAction={removeGuestMember}
        />
      </div>

      <SeatingSection
        assignAction={assignGuestTable}
        confirmedGuests={event.confirmedGuests || []}
        savePositionsAction={saveEventTablePositions}
        tableCount={event.tableCount || 0}
        tables={event.tables || []}
        tableCountAction={saveEventTables}
      />


    </ToastProvider>
  );
}