"use client";

export default function CoverImagePicker({ availableImages, selectedUrl, onSelect }) {
  if (!Array.isArray(availableImages) || availableImages.length === 0) {
    return (
      <p className="rounded-md border border-accent bg-surface p-3 text-sm text-brand">
        No hay imágenes en <code className="rounded bg-accent px-1">public/events</code>. Copiá una imagen ahí y recargá la página.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {availableImages.map((src) => {
        const isSelected = selectedUrl === src;
        return (
          <button
            key={src}
            type="button"
            onClick={() => onSelect(src)}
            className={`relative overflow-hidden rounded-md border-2 transition ${
              isSelected
                ? "border-secondary ring-2 ring-secondary/40"
                : "border-accent hover:scale-[1.04] hover:border-secondary"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Imagen para portada"
              className={`h-20 w-full object-cover transition ${isSelected ? "" : "hover:opacity-80"}`}
              src={src}
            />
            {isSelected ? (
              <span className="absolute inset-0 grid place-items-center bg-black/30">
                <span className="grid size-8 place-items-center rounded-full bg-secondary text-surface">
                  <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
