"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";

function ConfirmedCountField({ guestId, value, max, onBlur, onKeyDown }) {
  const { pending } = useFormStatus();
  const safeMax = Number.isInteger(max) && max > 0 ? max : 50;

  return (
    <input
      className="h-9 w-16 rounded-md border border-accent bg-surface px-2 text-right text-sm font-semibold text-ink outline-none transition focus:border-secondary disabled:opacity-60"
      defaultValue={value}
      disabled={pending}
      id={`confirmed-${guestId}`}
      key={value}
      max={safeMax}
      min={0}
      name="confirmedCount"
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      type="number"
    />
  );
}

export default function GuestConfirmedCountInput({
  action,
  guestId,
  value,
  max,
}) {
  const formRef = useRef(null);

  function handleBlur() {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      if (formRef.current) {
        formRef.current.requestSubmit();
      }
    }
  }

  return (
    <form action={action} ref={formRef}>
      <input name="guestId" type="hidden" value={guestId} />
      <label className="sr-only" htmlFor={`confirmed-${guestId}`}>
        Confirmados
      </label>
      <ConfirmedCountField
        guestId={guestId}
        max={max}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        value={value}
      />
    </form>
  );
}
