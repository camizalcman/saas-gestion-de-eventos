"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import CopyLinkButton from "./CopyLinkButton";
import GuestRemoveButton from "./GuestRemoveButton";
import GuestStatusBadge from "./GuestStatusBadge";
import { DIETARY_RESTRICTIONS } from "@/lib/events/constants";

function dietaryLabel(value) {
  return (
    DIETARY_RESTRICTIONS.find((restriction) => restriction.value === value)
      ?.label || ""
  );
}

function DietaryCell({ guest }) {
  const label = dietaryLabel(guest.dietary);

  if (!label) {
    return <span className="text-xs text-brand/50">—</span>;
  }

  const detail = guest.dietary === "otro" ? guest.dietaryNote : "";

  return (
    <span className="flex flex-col gap-0.5">
      <span className="self-start rounded border border-secondary/40 bg-secondary/10 px-2 py-0.5 text-xs font-semibold text-secondary">
        {label}
      </span>
      {detail ? (
        <span className="max-w-40 overflow-wrap-anywhere text-xs text-brand/70">
          {detail}
        </span>
      ) : null}
    </span>
  );
}

function LinkCell({ guest }) {
  if (!guest.link) {
    return <span className="text-xs text-brand/60">Sin link generado</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="rounded border border-accent bg-accent/30 px-2 py-1 font-mono text-xs text-brand">
        /i/{guest.token.slice(0, 8)}…
      </code>
      <CopyLinkButton value={guest.link} />
    </div>
  );
}

function GuestNameCell({ guest }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="overflow-wrap-anywhere font-semibold text-ink">
        {guest.name}
      </span>
      {guest.message ? (
        <span className="max-w-64 overflow-wrap-anywhere text-xs italic text-brand/70">
          “{guest.message}”
        </span>
      ) : null}
      <span className="font-mono text-[10px] text-brand/60">
        {guest.token ? `/i/${guest.token}` : "sin token"}
      </span>
    </div>
  );
}

function IndividualRow({ guest, rowClass, removeAction }) {
  return (
    <tr className={rowClass}>
      <td className="min-w-0 px-4 py-3 align-middle">
        <GuestNameCell guest={guest} />
      </td>
      <td className="px-4 py-3 text-right align-middle font-semibold text-ink">
        {guest.quantity}
      </td>
      <td className="px-4 py-3 align-middle">
        <GuestStatusBadge status={guest.status} />
      </td>
      <td className="px-4 py-3 align-middle">
        <DietaryCell guest={guest} />
      </td>
      <td className="px-4 py-3 align-middle">
        <LinkCell guest={guest} />
      </td>
      <td className="px-4 py-3 text-right align-middle">
        <GuestRemoveButton
          action={removeAction.bind(null, guest.id)}
          guestName={guest.name}
        />
      </td>
    </tr>
  );
}

function GroupRow({
  guest,
  rowClass,
  expanded,
  onToggle,
  removeAction,
  removeMemberAction,
}) {
  return (
    <>
      <tr className={rowClass}>
        <td className="min-w-0 px-4 py-3 align-middle">
          <div className="flex items-start gap-2">
            <button
              aria-expanded={expanded}
              className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-accent text-brand transition hover:border-secondary hover:bg-secondary/10"
              onClick={onToggle}
              type="button"
            >
              <ChevronRight
                aria-hidden="true"
                className={`size-4 transition-transform ${expanded ? "rotate-90" : ""}`}
                strokeWidth={1.8}
              />
              <span className="sr-only">
                {expanded ? "Ocultar integrantes" : "Ver integrantes"}
              </span>
            </button>
            <div className="flex flex-col gap-1">
              <span className="overflow-wrap-anywhere font-semibold text-ink">
                {guest.name}
              </span>
              {guest.message ? (
                <span className="max-w-64 overflow-wrap-anywhere text-xs italic text-brand/70">
                  “{guest.message}”
                </span>
              ) : null}
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary">
                {guest.members.length}{" "}
                {guest.members.length === 1 ? "integrante" : "integrantes"}
              </span>
              <span className="font-mono text-[10px] text-brand/60">
                {guest.token ? `/i/${guest.token}` : "sin token"}
              </span>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-right align-middle font-semibold text-ink">
          {guest.quantity}
        </td>
        <td className="px-4 py-3 align-middle">
          <GuestStatusBadge status={guest.status} />
        </td>
        <td className="px-4 py-3 align-middle">
          <span className="text-xs text-brand/50">Ver integrantes</span>
        </td>
        <td className="px-4 py-3 align-middle">
          <LinkCell guest={guest} />
        </td>
        <td className="px-4 py-3 text-right align-middle">
          <GuestRemoveButton
            action={removeAction.bind(null, guest.id)}
            guestName={guest.name}
          />
        </td>
      </tr>
      {expanded
        ? guest.members.map((member) => (
            <tr className="border-t border-accent/40 bg-accent/10" key={member.id}>
              <td className="min-w-0 px-4 py-3 pl-14 align-middle">
                <span className="overflow-wrap-anywhere text-sm text-ink">
                  {member.name}
                </span>
              </td>
              <td className="px-4 py-3 text-right align-middle text-brand/50">
                —
              </td>
              <td className="px-4 py-3 align-middle">
                <GuestStatusBadge status={member.status} />
              </td>
              <td className="px-4 py-3 align-middle">
                <DietaryCell guest={member} />
              </td>
              <td className="px-4 py-3 align-middle text-xs text-brand/50">
                —
              </td>
              <td className="px-4 py-3 text-right align-middle">
                <GuestRemoveButton
                  action={removeMemberAction.bind(null, guest.id, member.id)}
                  guestName={member.name}
                  successMessage="Integrante eliminado"
                />
              </td>
            </tr>
          ))
        : null}
    </>
  );
}

export default function GuestTableRows({
  guests,
  removeAction,
  removeMemberAction,
}) {
  const [expanded, setExpanded] = useState({});

  function toggleGroup(guestId) {
    setExpanded((prev) => ({ ...prev, [guestId]: !prev[guestId] }));
  }

  if (guests.length === 0) {
    return (
      <tbody className="bg-surface">
        <tr>
          <td className="px-4 py-6 text-center text-sm text-brand" colSpan={6}>
            Todavia no hay invitados cargados.
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className="bg-surface">
      {guests.map((guest, index) => {
        const rowClass =
          index === guests.length - 1 ? "" : "border-b border-accent/60";

        if (guest.type === "group") {
          return (
            <GroupRow
              expanded={Boolean(expanded[guest.id])}
              guest={guest}
              key={guest.id}
              onToggle={() => toggleGroup(guest.id)}
              removeAction={removeAction}
              removeMemberAction={removeMemberAction}
              rowClass={rowClass}
            />
          );
        }

        return (
          <IndividualRow
            guest={guest}
            key={guest.id}
            removeAction={removeAction}
            rowClass={rowClass}
          />
        );
      })}
    </tbody>
  );
}
