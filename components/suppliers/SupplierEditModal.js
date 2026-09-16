"use client";

import { useEffect, useState } from "react";
import SupplierForm from "@/components/suppliers/SupplierForm";

export default function SupplierEditModal({ action, supplier, useFirebaseStorage = false }) {
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!showSuccess) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setShowSuccess(false);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [showSuccess]);

  function handleSuccess() {
    setOpen(false);
    setShowSuccess(true);
  }

  return (
    <>
      <button
        className="h-9 border border-accent px-3 text-sm font-semibold text-ink transition hover:border-secondary hover:bg-secondary/10"
        onClick={() => setOpen(true)}
        type="button"
      >
        Editar
      </button>

      {showSuccess ? (
        <div
          aria-live="polite"
          className="fixed right-4 top-4 z-[60] border border-secondary bg-secondary px-5 py-3 text-sm font-semibold text-surface shadow-lg sm:right-6 sm:top-6"
          role="status"
        >
          Proveedor actualizado
        </div>
      ) : null}

      {open ? (
        <div
          aria-labelledby="edit-supplier-modal-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-brand/70 p-4 sm:p-8"
          role="dialog"
        >
          <button
            aria-label="Cerrar ventana"
            className="absolute inset-0 h-full w-full cursor-default"
            type="button"
            onClick={() => setOpen(false)}
          />

          <div className="relative z-10 my-auto w-full max-w-2xl border border-accent bg-surface shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-accent p-4 sm:p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                  Galeria de proveedores
                </p>
                <h2 className="mt-2 text-xl font-semibold text-ink" id="edit-supplier-modal-title">
                  Editar proveedor
                </h2>
              </div>
              <button
                aria-label="Cerrar ventana"
                className="inline-flex size-9 items-center justify-center border border-accent text-lg text-ink transition hover:border-secondary hover:bg-secondary/10"
                type="button"
                onClick={() => setOpen(false)}
              >
                x
              </button>
            </div>

            <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-4 sm:p-5">
              <SupplierForm
                action={(formData) => action(supplier.id, formData)}
                onSuccess={handleSuccess}
                supplier={supplier}
                submitLabel="Guardar cambios"
                useFirebaseStorage={useFirebaseStorage}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
