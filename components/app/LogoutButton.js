"use client";

import { useState, useTransition } from "react";
import { logout } from "@/app/(app)/dashboard/actions";
import ConfirmModal from "./ConfirmModal";

export default function LogoutButton({ className, children }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await logout();
    });
  }

  return (
    <>
      <button
        className={className}
        type="button"
        onClick={() => setOpen(true)}
      >
        {children}
      </button>

      <ConfirmModal
        open={open}
        title="Cerrar sesión"
        message="¿Está seguro de que deseas cerrar sesión?"
        confirmLabel="Cerrar sesión"
        cancelLabel="Cancelar"
        pending={pending}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}