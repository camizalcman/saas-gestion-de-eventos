"use client";

import { useEffect, useMemo, useState } from "react";
import { getClientAuth } from "@/lib/firebase/client";
import { uploadEntityImage } from "@/lib/firebase/storage";

function normalizeLocalImagePath(imageName, imageBasePath) {
  const value = String(imageName || "").trim();

  if (!value) return "";
  if (value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `/${imageBasePath}/${value}`;
}

function getLocalImageInputValue(imageUrl, imageBasePath) {
  const value = String(imageUrl || "");
  const prefix = `/${imageBasePath}/`;
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

export default function EventForm({
  action,
  event,
  submitLabel = "Guardar evento",
  useFirebaseStorage = false,
}) {
  const imageBasePath = "events";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(event?.imageUrl || "");
  const [objectPreviewUrl, setObjectPreviewUrl] = useState("");
  const cleanImageBasePath = useMemo(() => imageBasePath, []);

  useEffect(() => () => {
    if (objectPreviewUrl) URL.revokeObjectURL(objectPreviewUrl);
  }, [objectPreviewUrl]);

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();
    const form = submitEvent.currentTarget;
    setError("");
    setLoading(true);

    try {
      const formData = new FormData(form);

      if (useFirebaseStorage) {
        const imageFile = formData.get("imageFile");
        const hasNewImage = imageFile instanceof File && imageFile.size > 0;
        formData.delete("imageFile");

        if (hasNewImage) {
          const currentUser = getClientAuth().currentUser;
          if (!currentUser) throw new Error("Tenes que iniciar sesion para subir imagenes.");

          const uploadedImage = await uploadEntityImage({
            entity: cleanImageBasePath,
            file: imageFile,
            itemId: event?.id || "uploads",
            userId: currentUser.uid,
          });
          formData.set("imageUrl", uploadedImage.imageUrl);
          formData.set("imagePath", uploadedImage.imagePath);
        } else {
          formData.set("imageUrl", event?.imageUrl || "");
          formData.set("imagePath", event?.imagePath || "");
        }
      } else {
        formData.set(
          "imageUrl",
          normalizeLocalImagePath(formData.get("imageUrl"), cleanImageBasePath),
        );
        formData.set("imagePath", "");
      }

      await action(formData);
      if (!event) {
        form.reset();
        setPreviewUrl("");
        setObjectPreviewUrl("");
      }
    } catch (submitError) {
      setError(submitError.message || "No se pudo guardar el evento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid min-w-0 gap-4 border border-zinc-800 p-4 sm:p-5">
      <label className="grid gap-2 text-sm font-medium text-zinc-300">
        <span>Titulo</span>
        <input className="h-11 border border-zinc-800 bg-zinc-950 px-3 text-zinc-100 outline-none focus:border-cyan-400" name="title" defaultValue={event?.title || ""} disabled={loading} required />
      </label>
      <label className="grid gap-2 text-sm font-medium text-zinc-300">
        <span>Descripcion</span>
        <textarea className="min-h-28 resize-y border border-zinc-800 bg-zinc-950 px-3 py-3 text-zinc-100 outline-none focus:border-cyan-400" name="description" defaultValue={event?.description || ""} disabled={loading} />
      </label>
      <label className="grid gap-2 text-sm font-medium text-zinc-300">
        <span>Fecha y hora</span>
        <input className="h-11 border border-zinc-800 bg-zinc-950 px-3 text-zinc-100 outline-none focus:border-cyan-400" name="date" type="datetime-local" defaultValue={event?.date || ""} disabled={loading} required />
      </label>
      <label className="grid gap-2 text-sm font-medium text-zinc-300">
        <span>Ubicacion</span>
        <input className="h-11 border border-zinc-800 bg-zinc-950 px-3 text-zinc-100 outline-none focus:border-cyan-400" name="location" defaultValue={event?.location || ""} disabled={loading} required />
      </label>
      <label className="grid gap-2 text-sm font-medium text-zinc-300">
        <span>Imagen</span>
        {useFirebaseStorage ? (
          <input accept="image/jpeg,image/png,image/webp,image/gif" className="min-w-0 border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100" name="imageFile" type="file" disabled={loading} onChange={(changeEvent) => {
            const file = changeEvent.target.files?.[0];
            if (!file) { setObjectPreviewUrl(""); setPreviewUrl(event?.imageUrl || ""); return; }
            const nextPreviewUrl = URL.createObjectURL(file);
            setObjectPreviewUrl(nextPreviewUrl);
            setPreviewUrl(nextPreviewUrl);
          }} />
        ) : (
          <input className="h-11 border border-zinc-800 bg-zinc-950 px-3 text-zinc-100 outline-none focus:border-cyan-400" name="imageUrl" type="text" defaultValue={getLocalImageInputValue(event?.imageUrl, cleanImageBasePath)} disabled={loading} placeholder="imagen.jpg" onChange={(changeEvent) => setPreviewUrl(normalizeLocalImagePath(changeEvent.target.value, cleanImageBasePath))} />
        )}
        <span className="text-sm font-normal leading-6 text-zinc-500">Imagen opcional. Para imagen local, usar `public/events`.</span>
      </label>
      {useFirebaseStorage ? <><input name="imageUrl" type="hidden" defaultValue={event?.imageUrl || ""} /><input name="imagePath" type="hidden" defaultValue={event?.imagePath || ""} /></> : null}
      {previewUrl ? (
        <div className="border border-zinc-800 bg-zinc-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Preview del evento" className="h-44 w-full object-cover" src={previewUrl} />
        </div>
      ) : null}
      <label className="flex items-start gap-3 border border-zinc-800 p-3 text-sm font-medium text-zinc-300">
        <input className="mt-1 size-4 accent-cyan-400" name="published" type="checkbox" defaultChecked={Boolean(event?.published)} disabled={loading} />
        <span>Publicado<span className="mt-1 block text-sm font-normal leading-6 text-zinc-500">El evento aparecera en la pagina publica.</span></span>
      </label>
      <button className="h-11 w-full border border-cyan-400 bg-cyan-400 px-4 text-sm font-semibold text-zinc-950" disabled={loading} type="submit">{loading ? "Guardando..." : submitLabel}</button>
      {error ? <p className="border border-red-900/70 bg-red-950/40 p-3 text-sm text-red-300">{error}</p> : null}
    </form>
  );
}
