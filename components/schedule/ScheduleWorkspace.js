"use client";

import { useState } from "react";
import ScheduleActivityForm from "@/components/schedule/ScheduleActivityForm";
import ScheduleCalendar from "@/components/schedule/ScheduleCalendar";

export default function ScheduleWorkspace({
  action,
  activities = [],
  deleteAction,
  providers = [],
  updateAction,
}) {
  const [editingActivity, setEditingActivity] = useState(null);
  const formAction = editingActivity ? updateAction : action;

  return (
    <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
      <ScheduleActivityForm
        action={formAction}
        initialActivity={editingActivity}
        key={editingActivity?.id || "new-activity"}
        onCancel={() => setEditingActivity(null)}
        onSuccess={() => setEditingActivity(null)}
        providers={providers}
      />
      <ScheduleCalendar
        activities={activities}
        deleteAction={deleteAction}
        onEdit={setEditingActivity}
        providers={providers}
      />
    </div>
  );
}
