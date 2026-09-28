"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import GuestStatusBadge from "@/components/events/GuestStatusBadge";
import { DIETARY_RESTRICTIONS } from "@/lib/events/constants";

const buttonBase =
  "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

const fieldBase =
  "h-10 w-full rounded-md border border-accent bg-surface px-3 text-sm text-ink transition disabled:opacity-50";

const answeredStatuses = ["confirmado", "rechazado"];

function answeredStatus(status) {
  return answeredStatuses.includes(status) ? status : null;
}

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

function PersonRow({
  inputId,
  name,
  status,
  selected,
  disabled,
  onSelect,
  dietary,
  dietaryNote,
  onDietaryChange,
  onDietaryNoteChange,
}) {
  return (
    <div className="flex flex-col gap-4 border border-accent bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

      <div className="flex flex-col gap-2 sm:max-w-sm">
        <label
          className="text-xs font-semibold uppercase tracking-[0.12em] text-brand"
          htmlFor={inputId}
        >
          Restricción alimentaria
        </label>
        <select
          className={fieldBase}
          disabled={disabled}
          id={inputId}
          onChange={(event) => onDietaryChange(event.target.value)}
          value={dietary}
        >
          <option value="">Sin restricción</option>
          {DIETARY_RESTRICTIONS.map((restriction) => (
            <option key={restriction.value} value={restriction.value}>
              {restriction.label}
            </option>
          ))}
        </select>

        {dietary === "otro" ? (
          <>
            <label
              className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-brand"
              htmlFor={`${inputId}-note`}
            >
              ¿Cuál?
            </label>
            <input
              className={fieldBase}
              disabled={disabled}
              id={`${inputId}-note`}
              maxLength={200}
              onChange={(event) => onDietaryNoteChange(event.target.value)}
              placeholder="Escribí el detalle"
              type="text"
              value={dietaryNote}
            />
          </>
        ) : null}
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
        dietary: member.dietary || "",
        dietaryNote: member.dietaryNote || "",
      }))
    : [
        {
          key: "individual",
          memberId: null,
          name: guest.name,
          status: guest.status,
          dietary: guest.dietary || "",
          dietaryNote: guest.dietaryNote || "",
        },
      ];

  const [selections, setSelections] = useState(() => {
    const initial = {};

    for (const person of people) {
      const current = answeredStatus(person.status);

      if (current) {
        initial[person.key] = current;
      }
    }

    return initial;
  });

  const [diets, setDiets] = useState(() => {
    const initial = {};

    for (const person of people) {
      initial[person.key] = {
        dietary: person.dietary,
        dietaryNote: person.dietaryNote,
      };
    }

    return initial;
  });

  const [message, setMessage] = useState(guest.message || "");

  function selectPerson(person, response) {
    setSelections((prev) => ({ ...prev, [person.key]: response }));
  }

  function changeDietary(person, value) {
    setDiets((prev) => ({
      ...prev,
      [person.key]: { dietary: value, dietaryNote: "" },
    }));
  }

  function changeDietaryNote(person, value) {
    setDiets((prev) => ({
      ...prev,
      [person.key]: { ...prev[person.key], dietaryNote: value },
    }));
  }

  const hasChanges =
    message !== (guest.message || "") ||
    people.some((person) => {
      const diet = diets[person.key] || {};

      return (
        (selections[person.key] || null) !== answeredStatus(person.status) ||
        (diet.dietary || "") !== (person.dietary || "") ||
        (diet.dietaryNote || "") !== (person.dietaryNote || "")
      );
    });

  function submitResponse() {
    const responses = people.length
      ? people.map((person) => ({
          memberId: person.memberId,
          response: selections[person.key] || null,
          dietary: diets[person.key].dietary,
          dietaryNote:
            diets[person.key].dietary === "otro"
              ? diets[person.key].dietaryNote
              : "",
        }))
      : [{ memberId: null, response: null, dietary: "", dietaryNote: "" }];

    const anyConfirmed = responses.some(
      (entry) => entry.response === "confirmado",
    );

    setError("");
    startTransition(async () => {
      try {
        await respondAction(token, { responses, message });
        setModal({ confirmed: anyConfirmed });
        router.refresh();
      } catch (submitError) {
        setError(
          submitError?.message || "No se pudo registrar tu respuesta.",
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
            dietary={diets[person.key].dietary}
            dietaryNote={diets[person.key].dietaryNote}
            disabled={isPending}
            inputId={`dietary-${person.key}`}
            key={person.key}
            name={person.name}
            onDietaryChange={(value) => changeDietary(person, value)}
            onDietaryNoteChange={(value) => changeDietaryNote(person, value)}
            onSelect={(response) => selectPerson(person, response)}
            selected={selections[person.key]}
            status={person.status}
          />
        ))
      )}

      <div className="mt-3 flex flex-col gap-2 border border-accent bg-surface p-4">
        <label
          className="text-xs font-semibold uppercase tracking-[0.12em] text-brand"
          htmlFor="invitation-message"
        >
          Mensaje para los novios
        </label>
        <textarea
          className="min-h-24 w-full rounded-md border border-accent bg-surface p-3 text-sm text-ink transition disabled:opacity-50"
          disabled={isPending}
          id="invitation-message"
          maxLength={500}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Dejá un mensaje, una aclaración, lo que quieras"
          value={message}
        />
      </div>

      {error ? (
        <p className="border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand">
          {error}
        </p>
      ) : null}

      <button
        className="h-11 w-full rounded-md border border-secondary bg-secondary px-4 text-sm font-semibold text-surface transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:self-start"
        disabled={isPending || !hasChanges}
        onClick={submitResponse}
        type="button"
      >
        {isPending ? "Enviando..." : "Enviar respuesta"}
      </button>

      <ThanksModal
        confirmed={modal?.confirmed}
        onClose={() => setModal(null)}
        open={Boolean(modal)}
      />
    </div>
  );
}
