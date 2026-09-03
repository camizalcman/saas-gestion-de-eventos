"use client";

import { useEffect, useRef, useState } from "react";
import { getClientAuth } from "@/lib/firebase/client";
import { uploadEntityImage } from "@/lib/firebase/storage";

function normalizeLocalImagePath(imageName) {
  const value = String(imageName || "").trim();

  if (!value) return "";
  if (value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `/events/${value}`;
}

export default function Step3Media({ form, onBack, onCreate, useFirebaseStorage, loading }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [objectPreviewUrl, setObjectPreviewUrl] = useState("");
  const [urlValue, setUrlValue] = useState(form.imageUrl || "");
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (objectPreviewUrl) URL.revokeObjectURL(objectPreviewUrl);
  }, [objectPreviewUrl]);

  const previewSrc = objectPreviewUrl || (useFirebaseStorage ? "" : urlValue.trim());

  function selectFile(nextFile) {
    if (!nextFile) return;
    setFile(nextFile);
    setObjectPreviewUrl(URL.createObjectURL(nextFile));
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) selectFile(dropped);
  }

  async function handleFinish() {
    setError("");
    try {
      const result = { imageUrl: "", imagePath: "" };

      if (useFirebaseStorage) {
        if (file && file.size > 0) {
          const currentUser = getClientAuth().currentUser;
          if (!currentUser) throw new Error("Tenes que iniciar sesion para subir imagenes.");
          const uploaded = await uploadEntityImage({
            entity: "events",
            file,
            itemId: "uploads",
            userId: currentUser.uid,
          });
          result.imageUrl = uploaded.imageUrl;
          result.imagePath = uploaded.imagePath;
        } else if (urlValue.trim()) {
          result.imageUrl = normalizeLocalImagePath(urlValue);
        }
      } else {
        result.imageUrl = normalizeLocalImagePath(urlValue);
      }

      await onCreate(result);
    } catch (createError) {
      setError(createError.message || "No se pudo guardar el evento.");
    }
  }

  return (
    <section className="grid gap-4">
      <div>
        <h2 className="text-2xl font-semibold text-ink">Foto de portada</h2>
        <p className="mt-1 text-sm text-brand">Subí la imagen principal. Se mostrará en la portada del evento.</p>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => !loading && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`grid min-h-56 place-items-center rounded-md border-2 border-dashed px-4 py-6 text-center transition ${
          dragActive ? "border-secondary bg-secondary/10" : "border-accent bg-surface"
        }`}
      >
        {previewSrc ? (
          <div className="grid w-full gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Preview del evento" className="h-56 w-full rounded-md object-cover" src={previewSrc} />
            {useFirebaseStorage ? (
              <button
                className="mx-auto rounded-md border border-accent px-4 py-2 text-xs font-semibold text-brand hover:bg-accent/40"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Cambiar imagen
              </button>
            ) : null}
          </div>
        ) : (
          <div className="grid justify-items-center gap-2 text-brand">
            <svg className="size-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-sm font-medium text-ink">Arrastrá tu imagen o hacé clic para elegir</span>
            <span className="text-xs">JPG, PNG, WEBP o GIF · máx. 2 MB</span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        className="hidden"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(e) => selectFile(e.target.files?.[0])}
      />

      <label className="grid gap-2 text-sm font-medium text-ink">
        <span>O pegá un enlace / ruta local</span>
        <input
          className="h-11 rounded-md border border-accent bg-surface px-3 text-ink outline-none focus:border-secondary"
          name="imageUrl"
          type="text"
          value={urlValue}
          onChange={(e) => {
            setUrlValue(e.target.value);
            if (!useFirebaseStorage) {
              setObjectPreviewUrl("");
            }
          }}
          placeholder="imagen.jpg"
        />
      </label>

      {error ? <p className="rounded-md border border-brand/40 bg-brand/10 p-3 text-sm text-brand">{error}</p> : null}

      <div className="mt-2 flex items-center justify-between gap-3">
        <button
          className="h-12 rounded-md border border-accent px-5 text-sm font-semibold text-brand transition hover:bg-accent/40"
          type="button"
          onClick={onBack}
          disabled={loading}
        >
          Atrás
        </button>
        <button
          className="h-12 rounded-md border border-secondary bg-secondary px-5 text-sm font-semibold text-surface transition enabled:hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={handleFinish}
          disabled={loading}
        >
          {loading ? "Creando..." : "Crear y finalizar evento"}
        </button>
      </div>
    </section>
  );
}
