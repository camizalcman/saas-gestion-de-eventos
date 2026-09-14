"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function GuestTableSelect({ person, tableCount, action }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(person.tableNumber ?? "");
  const [prevTableNumber, setPrevTableNumber] = useState(person.tableNumber);
  const [error, setError] = useState("");

  if (prevTableNumber !== person.tableNumber) {
    setPrevTableNumber(person.tableNumber);
    setValue(person.tableNumber ?? "");
  }

  function handleChange(event) {
    const next = event.target.value;
    const previous = value;

    setValue(next);
    setError("");

    const formData = new FormData();
    formData.set("tableNumber", next);

    startTransition(async () => {
      try {
        await action(formData);
        router.refresh();
      } catch (submitError) {
        setValue(previous);
        setError(submitError?.message || "No se pudo asignar la mesa.");
      }
    });
  }

  return (
    <div className="grid gap-1">
      <label className="sr-only" htmlFor={`table-${person.id}`}>
        Mesa para {person.name}
      </label>
      <select
        className="h-9 rounded-md border border-accent bg-surface px-2 text-sm text-ink disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        id={`table-${person.id}`}
        onChange={handleChange}
        value={value}
      >
        <option value="">Sin mesa</option>
        {tableCount > 0
          ? Array.from({ length: tableCount }, (_, index) => index + 1).map(
              (number) => (
                <option key={number} value={number}>
                  {`Mesa ${number}`}
                </option>
              ),
            )
          : null}
      </select>
      {error ? (
        <p className="max-w-48 text-[11px] leading-4 text-brand" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}