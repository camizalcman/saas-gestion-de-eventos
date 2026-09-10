"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import GuestStatusBadge from "@/components/events/GuestStatusBadge";

const buttonBase =
  "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

function SelectionButton({ active, disabled, onClick, tone, children }) {
  const activeClass =
    tone === "confirm"
      ? "border-secondary bg-secondary text-surface"
      : "border-brand/40 bg-brand/10 text-brand";
  const idleClass =
    "border-accent text-brand hover:border-secondary hover:bg-secondary/10";

  return (
    <button
      className={`${buttonBase} ${active ? activeClass : idleClass}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function PersonRow({ name, status, selected, disabled, onSelect }) {
  return (
    <div className="flex flex-col gap-3 border border-accent bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-semibold text-ink">{name}</span>
        <GuestStatusBadge status={selected || status} />
      </div>
      <div className="flex flex-wrap gap-2">
        <SelectionButton
          active={selected === "confirmado"}
          disabled={disabled}
          onClick={() => onSelect("confirmado")}
          tone="confirm"
        >
          <Check aria-hidden="true" className="size-4" strokeWidth={2} />
          Confirmar
        </SelectionButton>
        <SelectionButton
          active={selected === "rechazado"}
          disabled={disabled}
          onClick={() => onSelect("rechazado")}
          tone="reject"
        >
          <X aria-hidden="true" className="size-4" strokeWidth={2} />
          Rechazar
        </SelectionButton>
      </div>
    </div>
  );
}

function ThanksModal({ open, confirmed, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        aria-modal="true"
        className="w-full max-w-sm rounded-lg border border-accent bg-surface p-6 text-center shadow-xl"
        role="dialog"
      >
        <h2 className="text-lg font-semibold text-ink">
          {confirmed
            ? "¡Gracias por confirmar tu invitación!"
            : "¡Gracias por avisarnos!"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-brand">
          Tu respuesta quedó registrada.
        </p>
        <button
          className="mt-5 h-10 rounded-md border border-secondary bg-secondary px-5 text-sm font-semibold text-surface transition hover:bg-secondary/90"
          onClick={onClose}
          type="button"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default function InvitationResponse({ token, guest, respondAction }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modal, setModal] = useState(null);
  const [error, setError] = useState("");

  const isGroup = guest.type === "group";
  const people = isGroup
    ? guest.members.map((member) => ({
        key: member.id,
        memberId: member.id,
        name: member.name,
        status: member.status,
      }))
    : [
        {
          key: "individual",
          memberId: null,
          name: guest.name,
          status: guest.status,
        },
      ];

  const [selections, setSelections] = useState(() => {
    const initial = {};

    for (const person of people) {
      if (person.status === "confirmado" || person.status === "rechazado") {
        initial[person.key] = person.status;
      }
    }

    return initial;
  });

  function selectPerson(person, response) {
    setSelections((prev) => ({ ...prev, [person.key]: response }));

    if (isGroup) {
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        await respondAction(token, response, person.memberId);
        setModal({ confirmed: response === "confirmado" });
        router.refresh();
      } catch (submitError) {
        setError(
          submitError?.message || "No se pudo registrar tu respuesta.",
        );
      }
    });
  }

  function confirmGroupSelection() {
    const entries = people
      .map((person) => ({ person, response: selections[person.key] }))
      .filter(
        (entry) =>
          entry.response === "confirmado" || entry.response === "rechazado",
      );

    if (entries.length === 0) return;

    setError("");
    startTransition(async () => {
      try {
        let anyConfirmed = false;

        for (const entry of entries) {
          await respondAction(token, entry.response, entry.person.memberId);
          if (entry.response === "confirmado") anyConfirmed = true;
        }

        setModal({ confirmed: anyConfirmed });
        router.refresh();
      } catch (submitError) {
        setError(
          submitError?.message || "No se pudieron registrar las respuestas.",
        );
      }
    });
  }

  return (
    <div className="mt-10 grid gap-3 text-left">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
        Confirmá la asistencia
      </p>

      {people.length === 0 ? (
        <p className="border border-accent bg-surface p-4 text-sm text-brand">
          Esta invitación no tiene integrantes cargados.
        </p>
      ) : (
        people.map((person) => (
          <PersonRow
            disabled={isPending}
            key={person.key}
            name={person.name}
            onSelect={(response) => selectPerson(person, response)}
            selected={selections[person.key]}
            status={person.status}
          />
        ))
      )}

      {error ? (
        <p className="border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand">
          {error}
        </p>
      ) : null}

      {isGroup && people.length > 0 ? (
        <button
          className="h-11 w-full rounded-md border border-secondary bg-secondary px-4 text-sm font-semibold text-surface transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:self-start"
          disabled={isPending || Object.keys(selections).length === 0}
          onClick={confirmGroupSelection}
          type="button"
        >
          {isPending ? "Enviando..." : "Confirmar selección"}
        </button>
      ) : null}

      <ThanksModal
        confirmed={modal?.confirmed}
        onClose={() => setModal(null)}
        open={Boolean(modal)}
      />
    </div>
  );
}
