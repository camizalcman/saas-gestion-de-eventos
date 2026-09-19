"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import ConfirmModal from "@/components/app/ConfirmModal";

export default function EventDeleteButton({ action, eventTitle }) {
  const router = useRouter();
  const showToast = useToast();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await action(new FormData());
        setOpen(false);
        showToast("Evento eliminado correctamente");
        router.push("/dashboard");
      } catch {
        showToast("No se pudo eliminar el evento.", "error");
      }
    });
  }

  return (
    <>
      <button
        className="inline-flex h-10 items-center justify-center rounded-md border border-brand/40 px-4 text-sm font-semibold text-brand transition hover:bg-brand/10"
        onClick={() => setOpen(true)}
        type="button"
      >
        Eliminar
      </button>

      <ConfirmModal
        open={open}
        title="Eliminar evento"
        message={`¿Estás seguro de que querés eliminar el evento "${eventTitle}"? Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        pending={isPending}
        onConfirm={handleConfirm}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
