"use client";

import { useEffect, useRef, useState } from "react";

function MusicNoteIcon({ muted, color }) {
  return (
    <svg className={`size-6 ${muted ? "opacity-70" : ""}`} viewBox="0 0 24 24">
      <g fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </g>
      {muted ? (
        <line x1="3" y1="21" x2="21" y2="3" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
      ) : null}
    </svg>
  );
}

export default function MusicPlayer({ src, color, className = "" }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
        audio.remove();
      }
    };
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      setPlaying(true);
      audio.play().catch(() => setPlaying(false));
    }
  }

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Apagar música" : "Prender música"}
        className={`grid size-12 place-items-center rounded-full shadow-lg transition hover:opacity-80 ${className}`}
        style={{ backgroundColor: color }}
      >
        <MusicNoteIcon muted={!playing} color="#ffffff" />
      </button>
    </>
  );
}