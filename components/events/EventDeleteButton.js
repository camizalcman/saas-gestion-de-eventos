"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import ConfirmModal from "@/components/app/ConfirmModal";

export default function EventDeleteButton({ action, eventTitle, variant }) {
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

  const isRound = variant === "round";

  return (
    <>
      <button
        className={
          isRound
            ? "flex size-10 shrink-0 items-center justify-center rounded-full border border-[#722F37] bg-[#722F37] text-[#F87171] transition hover:bg-[#5C252C]"
            : "inline-flex h-10 items-center justify-center rounded-md border border-brand/40 px-4 text-sm font-semibold text-brand transition hover:bg-brand/10"
        }
        onClick={() => setOpen(true)}
        type="button"
        aria-label="Eliminar evento"
      >
        {isRound ? <Trash2 className="size-4" /> : "Eliminar"}
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
