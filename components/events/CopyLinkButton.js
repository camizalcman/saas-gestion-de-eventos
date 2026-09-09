"use client";

import { useEffect, useRef, useState } from "react";

function fallbackCopy(text) {
  if (typeof document === "undefined") {
    return false;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  let copied = false;

  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }

  document.body.removeChild(textarea);
  return copied;
}

export default function CopyLinkButton({ value, label = "Copiar link" }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  async function handleClick() {
    if (!value) return;

    let ok = false;

    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      try {
        await navigator.clipboard.writeText(value);
        ok = true;
      } catch {
        ok = fallbackCopy(value);
      }
    } else {
      ok = fallbackCopy(value);
    }

    if (!ok) return;

    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      aria-label={label}
      className={`inline-flex h-9 items-center justify-center border px-3 text-xs font-semibold transition ${
        copied
          ? "border-secondary bg-secondary/15 text-ink"
          : "border-accent text-brand hover:border-secondary hover:bg-secondary/10"
      }`}
      onClick={handleClick}
      type="button"
    >
      {copied ? "¡Copiado!" : label}
    </button>
  );
}
