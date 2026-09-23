import { redirect } from "next/navigation";
import AppSidebar from "@/components/app/AppSidebar";
import { getCurrentUser } from "@/lib/firebase/session";
import { getCurrentUserProfile } from "@/lib/users/users";
import { listUserEvents } from "@/lib/events/events";
import { getActiveEvent } from "@/lib/events/active";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentUserProfile(user);
  const events = await listUserEvents(user.uid);
  const activeEvent = await getActiveEvent(user, events);

  return (
    <div className="flex min-h-screen flex-col bg-surface text-ink lg:flex-row">
      <AppSidebar
        activeEventId={activeEvent?.id || null}
        events={events.map((event) => ({
          id: event.id,
          title: event.title,
          date: event.date,
        }))}
        isAdmin={profile?.user_type === "admin"}
      />
      <main className="min-w-0 flex-1 pl-16 lg:pl-0">
        <div className="mx-auto w-full max-w-6xl px-4 py-7 md:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}