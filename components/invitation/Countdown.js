"use client";

import { useEffect, useState } from "react";

function buildParts(target) {
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return null;

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return { days, hours, minutes };
}

export default function Countdown({ target, palette }) {
  const [parts, setParts] = useState(() => buildParts(target));

  useEffect(() => {
    const id = setInterval(() => setParts(buildParts(target)), 30000);
    return () => clearInterval(id);
  }, [target]);

  const accent = palette.colors.cta;
  const ink = palette.colors.ink;
  const muted = palette.colors.muted;

  if (!parts) {
    return (
      <div className="grid justify-items-center gap-3 py-6">
        <span style={{ color: ink }} className="text-sm font-medium uppercase tracking-widest">Faltan</span>
        <span style={{ color: accent }} className="text-3xl font-semibold">¡Es hoy!</span>
      </div>
    );
  }

  const cells = [
    { value: parts.days, label: "días" },
    { value: parts.hours, label: "horas" },
    { value: parts.minutes, label: "min" },
  ];

  return (
    <div className="grid justify-items-center gap-4 py-6">
      <span style={{ color: ink }} className="text-sm font-medium uppercase tracking-widest">Faltan</span>
      <div className="flex items-center gap-4">
        {cells.map((cell) => (
          <div key={cell.label} className="flex flex-col items-center">
            <span
              className="grid min-w-24 place-items-center rounded-lg px-4 py-3 text-5xl font-semibold tabular-nums"
              style={{ backgroundColor: accent, color: palette.colors.ctaText }}
            >
              {cell.value}
            </span>
            <span className="mt-2 text-xs uppercase tracking-wider" style={{ color: muted }}>
              {cell.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
