"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import ConfirmModal from "@/components/app/ConfirmModal";

export default function ScheduleDeleteButton({ action, activityTitle, activityId }) {
  const router = useRouter();
  const showToast = useToast();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    const formData = new FormData();
    formData.set("activityId", activityId);

    startTransition(async () => {
      try {
        await action(formData);
        setOpen(false);
        showToast("Actividad eliminada correctamente");
        router.refresh();
      } catch {
        showToast("No se pudo eliminar la actividad.", "error");
      }
    });
  }

  return (
    <>
      <button
        aria-label={`Eliminar actividad ${activityTitle}`}
        className="h-9 border border-brand/40 px-3 text-xs font-semibold text-brand transition hover:border-brand hover:bg-brand/10"
        onClick={() => setOpen(true)}
        type="button"
      >
        Eliminar
      </button>
      <ConfirmModal
        cancelLabel="Cancelar"
        confirmLabel="Sí, eliminar"
        message="¿Seguro que querés eliminar esta actividad?"
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        open={open}
        pending={isPending}
        title="Eliminar actividad"
      />
    </>
  );
}
