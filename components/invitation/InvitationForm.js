"use client";

import { useEffect, useRef, useState } from "react";
import { uploadEntityImage } from "@/lib/firebase/storage";
import { INVITATION_PALETTES } from "@/lib/invitation/palettes";
import { INVITATION_TYPOGRAPHIES } from "@/lib/invitation/typographies";
import { makeInvitationDefaults } from "@/lib/invitation/defaults";
import InvitationPreview from "@/components/invitation/InvitationPreview";

function normalizeLocalImagePath(imageName) {
  const value = String(imageName || "").trim();

  if (!value) return "";
  if (value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `/events/${value}`;
}

function ObjectUrlPreview({ src, alt = "Preview", className = "h-44 w-full rounded-md object-cover" }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} className={className} src={src} />
  );
}

function PaletteGrid({ selectedPalette, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {INVITATION_PALETTES.map((palette) => {
        const isSelected = selectedPalette === palette.id;
        return (
          <button
            key={palette.id}
            type="button"
            onClick={() => onSelect(palette.id)}
            className={`group relative flex items-center gap-2 rounded-md border p-2 text-left text-xs transition ${
              isSelected
                ? "border-secondary bg-secondary text-surface shadow-md ring-2 ring-secondary/30"
                : "border-accent bg-surface hover:border-secondary hover:bg-secondary/10"
            }`}
          >
            {isSelected ? (
              <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-secondary text-surface">
                <svg className="size-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            ) : null}
            <span
              className={`flex h-7 w-7 shrink-0 gap-0.5 overflow-hidden rounded-full border transition group-hover:scale-110 ${
                isSelected ? "border-white/40" : "border-black/10"
              }`}
            >
              <span className="h-full w-1/2" style={{ background: palette.colors.primary }} />
              <span className="h-full w-1/2" style={{ background: palette.colors.secondary }} />
            </span>
            <span className="min-w-0">
              <span className={`block font-semibold ${isSelected ? "text-surface" : "text-ink"}`}>
                {palette.name}
              </span>
              <span className={`block truncate ${isSelected ? "text-surface/80" : "text-brand"}`}>
                {palette.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function TypographyGrid({ selectedId, onSelect }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {INVITATION_TYPOGRAPHIES.map((typography) => {
        const isSelected = selectedId === typography.id;
        return (
          <button
            key={typography.id}
            type="button"
            onClick={() => onSelect(typography.id)}
            className={`relative rounded-md border p-3 text-left transition ${
              isSelected
                ? "border-secondary bg-secondary shadow-md ring-2 ring-secondary/30"
                : "border-accent bg-surface hover:border-secondary hover:bg-secondary/10"
            }`}
          >
            {isSelected ? (
              <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-secondary text-surface">
                <svg className="size-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            ) : null}
            <span className={`block font-semibold ${isSelected ? "text-surface" : "text-ink"}`}>
              {typography.name}
            </span>
            <span className="mt-2 block overflow-hidden rounded bg-white px-3 py-2">
              <span className="block truncate text-xl leading-8" style={{ fontFamily: typography.headingFont }}>
                Aa Bb Cc
              </span>
              <span className="mt-1 block truncate text-sm leading-6 text-brand" style={{ fontFamily: typography.bodyFont }}>
                Título y texto
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function AudioPicker({ availableAudio, selectedUrl, onSelect }) {
  if (!Array.isArray(availableAudio) || availableAudio.length === 0) {
    return (
      <p className="rounded-md border border-accent bg-surface p-3 text-sm text-brand">
        No hay canciones en <code className="rounded bg-accent px-1">public/audio</code>. Copiá un MP3 ahí y recargá la página.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
      {availableAudio.map((src) => {
        const isSelected = selectedUrl === src;
        const name = src.split("/").pop()?.replace(/\.[^.]+$/, "") || src;
        return (
          <button
            key={src}
            type="button"
            onClick={() => onSelect(src)}
            className={`relative flex items-center gap-2 rounded-md border-2 p-2 text-left text-xs transition ${
              isSelected
                ? "border-secondary bg-secondary/10 ring-2 ring-secondary/30"
                : "border-accent bg-surface hover:scale-[1.02] hover:border-secondary"
            }`}
          >
            {isSelected ? (
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-secondary text-surface">
                <svg className="size-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            ) : (
              <span className="grid size-5 shrink-0 place-items-center rounded-full border border-accent text-brand">
                <svg className="size-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18V6l10-2v12" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="16" cy="16" r="3" />
                </svg>
              </span>
            )}
            <span className="min-w-0">
              <span className={`block truncate font-semibold ${isSelected ? "text-ink" : "text-ink"}`}>{name}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function CoverImagePicker({ availableImages, selectedUrl, onSelect }) {
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

export default function InvitationForm({
  action,
  event,
  invitation,
  submitLabel = "Guardar invitación",
  useFirebaseStorage = false,
  availableImages = [],
  availableAudio = [],
}) {
  const initial = invitation || makeInvitationDefaults(event);

  const [values, setValues] = useState({
    heroImageUrl: initial.heroImageUrl || "",
    heroImagePath: initial.heroImagePath || "",
    names: initial.names || "",
    message: initial.message || "",
    personalText: initial.personalText || "",
    personalTextEnabled: true,
    date: initial.date || "",
    dateTimeEnabled: true,
    time: initial.time || "",
    venue: initial.venue || "",
    venueEnabled: true,
    mapUrl: initial.mapUrl || "",
    dressCode: initial.dressCode || "",
    dressCodeEnabled: true,
    giftEnabled: invitation ? Boolean(initial.giftEnabled) : true,
    giftAlias: initial.giftAlias || "",
    closingText: initial.closingText || "",
    closingTextEnabled: true,
    palette: initial.palette || "clasico",
    typography: initial.typography || "elegante",
    audioEnabled: initial.audioEnabled || false,
    audioUrl: initial.audioUrl || "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const heroRef = useRef(null);
  const [heroFile, setHeroFile] = useState(null);
  const [objectHeroUrl, setObjectHeroUrl] = useState("");

  const heroSrc = objectHeroUrl || values.heroImageUrl;
  useEffect(
    () => () => {
      if (objectHeroUrl) URL.revokeObjectURL(objectHeroUrl);
    },
    [objectHeroUrl],
  );

  function update(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleHeroSelect(file) {
    if (!file) return;
    setHeroFile(file);
    setObjectHeroUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();
    setError("");
    setLoading(true);

    try {
      let heroUrl = values.heroImageUrl;
      let heroPath = values.heroImagePath;

      if (useFirebaseStorage && heroFile && heroFile.size > 0) {
        const uploaded = await uploadEntityImage({
          entity: "events",
          file: heroFile,
          itemId: event?.id || "invitacion",
        });
        heroUrl = uploaded.imageUrl;
        heroPath = uploaded.imagePath;
      } else if (!useFirebaseStorage) {
        heroUrl = normalizeLocalImagePath(values.heroImageUrl);
      }

      const formData = new FormData();
      formData.set("heroImageUrl", heroUrl);
      formData.set("heroImagePath", heroPath);
      formData.set("names", values.names);
      formData.set("message", values.message);
      formData.set("personalText", values.personalTextEnabled ? values.personalText : "");
      formData.set("date", values.dateTimeEnabled ? values.date : "");
      formData.set("time", values.dateTimeEnabled ? values.time : "");
      formData.set("venue", values.venueEnabled ? values.venue : "");
      formData.set("mapUrl", values.venueEnabled ? values.mapUrl : "");
      formData.set("dressCode", values.dressCodeEnabled ? values.dressCode : "");
      formData.set("giftEnabled", values.giftEnabled ? "on" : "");
      formData.set("giftAlias", values.giftAlias);
      formData.set("closingText", values.closingTextEnabled ? values.closingText : "");
      formData.set("palette", values.palette);
      formData.set("typography", values.typography);
      formData.set("audioEnabled", values.audioEnabled ? "on" : "");
      formData.set("audioUrl", values.audioEnabled ? values.audioUrl : "");

      await action(formData);
    } catch (submitError) {
      setError(submitError.message || "No se pudo guardar la invitación.");
    } finally {
      setLoading(false);
    }
  }

  const fieldClasses =
    "h-11 w-full rounded-md border border-accent bg-surface px-3 text-ink outline-none focus:border-secondary";
  const labelClasses = "grid gap-2 text-sm font-medium text-ink";
  const hintClasses = "text-sm font-normal leading-6 text-brand/60";

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_350px] xl:grid-cols-[minmax(0,1fr)_380px]">
      <form onSubmit={handleSubmit} className="grid min-w-0 gap-4 border border-accent p-4 sm:p-5">
      <div className="rounded-md border border-accent p-4">
        <div className="mb-3 grid gap-2 text-sm">
          <span className="text-sm font-medium text-ink">Paleta de colores</span>
          <span className={hintClasses}>
            Elegí la paleta que vas a usar. Podés cambiarla cuando quieras.
          </span>
        </div>
        <PaletteGrid selectedPalette={values.palette} onSelect={(p) => update("palette", p)} />
      </div>

      <div className="rounded-md border border-accent p-4">
        <div className="mb-3 grid gap-2 text-sm">
          <span className="text-sm font-medium text-ink">Tipografía</span>
          <span className={hintClasses}>
            Cada opción combina una tipografía para títulos y otra para el texto.
          </span>
        </div>
        <TypographyGrid selectedId={values.typography} onSelect={(t) => update("typography", t)} />
      </div>

      <div className="grid gap-2">
        <span className="text-sm font-medium text-ink">Foto de portada</span>
        {useFirebaseStorage ? (
          <>
            <div
              role="button"
              tabIndex={0}
              onClick={() => !loading && heroRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") heroRef.current?.click();
              }}
              className="grid min-h-40 place-items-center rounded-md border-2 border-dashed border-accent bg-surface text-center"
            >
              {heroSrc ? (
                <div className="grid w-full gap-3 p-3">
                  <ObjectUrlPreview src={heroSrc} alt="Preview de portada" />
                  <button
                    className="mx-auto rounded-md border border-accent px-4 py-2 text-xs font-semibold text-brand hover:bg-accent/40"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      heroRef.current?.click();
                    }}
                  >
                    Cambiar imagen
                  </button>
                </div>
              ) : (
                <span className="grid justify-items-center gap-2 p-6 text-brand">
                  <svg className="size-9" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="text-sm font-medium text-ink">Subí la foto de portada</span>
                  <span className="text-xs">JPG, PNG, WEBP o GIF · máx. 2 MB</span>
                </span>
              )}
            </div>
            <input
              ref={heroRef}
              className="hidden"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => handleHeroSelect(e.target.files?.[0])}
            />
          </>
        ) : (
          <CoverImagePicker
            availableImages={availableImages}
            selectedUrl={values.heroImageUrl}
            onSelect={(src) => update("heroImageUrl", src)}
          />
        )}
      </div>

      <div className="grid gap-2">
        <label className="flex items-center gap-3 text-sm font-semibold text-ink">
          <input
            className="size-4 accent-secondary"
            type="checkbox"
            checked={values.audioEnabled}
            onChange={(e) => update("audioEnabled", e.target.checked)}
            disabled={loading}
          />
          <span>Música de fondo</span>
        </label>

        {values.audioEnabled ? (
          <AudioPicker
            availableAudio={availableAudio}
            selectedUrl={values.audioUrl}
            onSelect={(src) => update("audioUrl", src)}
          />
        ) : null}
      </div>

      <label className={labelClasses}>
        <span>Mensaje</span>
        <input
          className={fieldClasses}
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="Te invitamos a nuestro..."
          disabled={loading}
        />
        <span className={hintClasses}>Se genera según el tipo de evento; editá si lo necesitás.</span>
      </label>

      <label className={labelClasses}>
        <span>Nombres de los protagonistas</span>
        <input
          className={fieldClasses}
          value={values.names}
          onChange={(e) => update("names", e.target.value)}
          placeholder="Nombre del o los protagonistas"
          disabled={loading}
        />
        <span className={hintClasses}>Se completa automáticamente con el onboarding, pero podés cambiarlo.</span>
      </label>

      <label className="flex items-center gap-3 text-sm font-semibold text-ink">
        <input
          className="size-4 accent-secondary"
          type="checkbox"
          checked={values.personalTextEnabled}
          onChange={(e) => update("personalTextEnabled", e.target.checked)}
          disabled={loading}
        />
        <span>Texto personal</span>
      </label>

      {values.personalTextEnabled ? (
        <label className={labelClasses}>
          <textarea
            className="min-h-20 resize-y rounded-md border border-accent bg-surface px-3 py-3 text-ink outline-none focus:border-secondary"
            value={values.personalText}
            onChange={(e) => update("personalText", e.target.value)}
            placeholder='Ej: "Con la bendición de Hashem y de nuestros padres..."'
            disabled={loading}
          />
        </label>
      ) : null}

      <label className="flex items-center gap-3 text-sm font-semibold text-ink">
        <input
          className="size-4 accent-secondary"
          type="checkbox"
          checked={values.dateTimeEnabled}
          onChange={(e) => update("dateTimeEnabled", e.target.checked)}
          disabled={loading}
        />
        <span>Fecha y horario</span>
      </label>

      {values.dateTimeEnabled ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClasses}>
            <span>Fecha</span>
            <input
              className={fieldClasses}
              type="date"
              value={values.date}
              onChange={(e) => update("date", e.target.value)}
              disabled={loading}
            />
          </label>
          <label className={labelClasses}>
            <span>Horario</span>
            <input
              className={fieldClasses}
              type="time"
              value={values.time}
              onChange={(e) => update("time", e.target.value)}
              disabled={loading}
            />
          </label>
        </div>
      ) : null}

      <label className="flex items-center gap-3 text-sm font-semibold text-ink">
        <input
          className="size-4 accent-secondary"
          type="checkbox"
          checked={values.venueEnabled}
          onChange={(e) => update("venueEnabled", e.target.checked)}
          disabled={loading}
        />
        <span>Ubicación</span>
      </label>

      {values.venueEnabled ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClasses}>
            <span>Ubicación / salón</span>
            <input
              className={fieldClasses}
              value={values.venue}
              onChange={(e) => update("venue", e.target.value)}
              placeholder="Salón o dirección"
              disabled={loading}
            />
          </label>
          <label className={labelClasses}>
            <span>Link a Google Maps (opcional)</span>
            <input
              className={fieldClasses}
              type="url"
              value={values.mapUrl}
              onChange={(e) => update("mapUrl", e.target.value)}
              placeholder="https://maps.google.com/..."
              disabled={loading}
            />
          </label>
        </div>
      ) : null}

      <label className="flex items-center gap-3 text-sm font-semibold text-ink">
        <input
          className="size-4 accent-secondary"
          type="checkbox"
          checked={values.dressCodeEnabled}
          onChange={(e) => update("dressCodeEnabled", e.target.checked)}
          disabled={loading}
        />
        <span>Dress code</span>
      </label>

      {values.dressCodeEnabled ? (
        <label className={labelClasses}>
          <input
            className={fieldClasses}
            value={values.dressCode}
            onChange={(e) => update("dressCode", e.target.value)}
            placeholder='Ej: "Etiqueta"'
            disabled={loading}
          />
        </label>
      ) : null}

      <label className="flex items-center gap-3 text-sm font-semibold text-ink">
        <input
          className="size-4 accent-secondary"
          type="checkbox"
          checked={values.giftEnabled}
          onChange={(e) => update("giftEnabled", e.target.checked)}
          disabled={loading}
        />
        <span>Sección de regalo</span>
      </label>

      {values.giftEnabled ? (
        <label className={labelClasses}>
          <textarea
            className="min-h-20 resize-y rounded-md border border-accent bg-surface px-3 py-3 text-ink outline-none focus:border-secondary"
            value={values.giftAlias}
            onChange={(e) => update("giftAlias", e.target.value)}
            placeholder='Ej: "Si querés hacernos un regalo, nuestro alias es..."'
            disabled={loading}
          />
        </label>
      ) : null}

      <label className="flex items-center gap-3 text-sm font-semibold text-ink">
        <input
          className="size-4 accent-secondary"
          type="checkbox"
          checked={values.closingTextEnabled}
          onChange={(e) => update("closingTextEnabled", e.target.checked)}
          disabled={loading}
        />
        <span>Texto de cierre</span>
      </label>

      {values.closingTextEnabled ? (
        <label className={labelClasses}>
          <textarea
            className="min-h-20 resize-y rounded-md border border-accent bg-surface px-3 py-3 text-ink outline-none focus:border-secondary"
            value={values.closingText}
            onChange={(e) => update("closingText", e.target.value)}
            placeholder="Mensaje final de agradecimiento..."
            disabled={loading}
          />
        </label>
      ) : null}

      <input type="hidden" name="heroImagePath" value={values.heroImagePath} />

      {error ? (
        <p className="rounded-md border border-brand/40 bg-brand/10 p-3 text-sm text-brand">{error}</p>
      ) : null}

      <button
        className="h-11 w-full rounded-md border border-secondary bg-secondary px-4 text-sm font-semibold text-surface transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        {loading ? "Guardando..." : submitLabel}
      </button>
      </form>

      <aside className="md:sticky md:top-6 md:self-start">
        <p className="mb-3 text-center text-sm font-semibold uppercase tracking-widest text-brand md:text-left">
          Vista previa
        </p>
        <InvitationPreview values={values} eventTitle={event.title} />
      </aside>
    </div>
  );
}