import { redirect } from "next/navigation";
import CronogramaSection from "@/components/schedule/CronogramaSection";
import ToastProvider from "@/components/ToastProvider";
import { getCurrentUser } from "@/lib/firebase/session";
import { getActiveEvent } from "@/lib/events/active";
import {
  addScheduleActivity,
  removeScheduleActivity,
  saveEventDuration,
  updateScheduleActivity,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function CronogramaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const event = await getActiveEvent(user);
  if (!event) redirect("/dashboard");

  return (
    <ToastProvider>

      <h1 className="mt-3 text-3xl font-semibold tracking-normal text-ink sm:text-3xl font-serif">
        Cronograma
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-brand">
        Coordiná el minuto a minuto de la fiesta de “{event.title}”.
      </p>

      <CronogramaSection
        action={addScheduleActivity}
        deleteAction={removeScheduleActivity}
        durationAction={saveEventDuration}
        event={event}
        updateAction={updateScheduleActivity}
      />

    </ToastProvider>
  );
}
