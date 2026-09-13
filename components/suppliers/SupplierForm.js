"use client";

import { useEffect, useState } from "react";
import { getClientAuth } from "@/lib/firebase/client";
import { uploadEntityImage } from "@/lib/firebase/storage";
import {
  SUPPLIER_CATEGORIES,
  SUPPLIER_PROVINCES,
} from "@/lib/suppliers/constants";

function normalizeLocalImagePath(value) {
  const image = String(value || "").trim();

  if (!image) {
    return "";
  }

  if (
    image.startsWith("/") ||
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return `/suppliers/${image}`;
}

function getLocalImageInputValue(value) {
  const image = String(value || "");
  const prefix = "/suppliers/";

  return image.startsWith(prefix) ? image.slice(prefix.length) : image;
}

export default function SupplierForm({
  action,
  onSuccess,
  supplier,
  submitLabel = "Agregar proveedor",
  useFirebaseStorage = false,
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(supplier?.imageUrl || "");
  const [objectPreviewUrl, setObjectPreviewUrl] = useState("");

  useEffect(() => {
    return () => {
      if (objectPreviewUrl) {
        URL.revokeObjectURL(objectPreviewUrl);
      }
    };
  }, [objectPreviewUrl]);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setError("");
    setLoading(true);

    try {
      if (!action) {
        throw new Error("El formulario todavia no tiene una accion configurada.");
      }

      const formData = new FormData(form);

      if (useFirebaseStorage) {
        const imageFile = formData.get("imageFile");
        const hasNewImage = imageFile instanceof File && imageFile.size > 0;
        formData.delete("imageFile");

        if (hasNewImage) {
          if (!getClientAuth().currentUser) {
            throw new Error("Tenes que iniciar sesion para subir imagenes.");
          }

          const uploadedImage = await uploadEntityImage({
            entity: "suppliers",
            file: imageFile,
            itemId: supplier?.id || "uploads",
          });

          formData.set("imageUrl", uploadedImage.imageUrl);
          formData.set("imagePath", uploadedImage.imagePath);
        } else {
          formData.set("imageUrl", supplier?.imageUrl || "");
          formData.set("imagePath", supplier?.imagePath || "");
        }
      } else {
        formData.set(
          "imageUrl",
          normalizeLocalImagePath(formData.get("imageUrl")),
        );
        formData.set("imagePath", "");
      }

      await action(formData);
      onSuccess?.();

      if (!supplier) {
        form.reset();
        setPreviewUrl("");
        setObjectPreviewUrl("");
      }
    } catch (submissionError) {
      setError(submissionError.message || "No se pudo guardar el proveedor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="grid min-w-0 gap-4 border border-accent p-4 sm:p-5"
      onSubmit={handleSubmit}
    >
      <label className="grid gap-2 text-sm font-medium text-ink">
        <span>Nombre</span>
        <input
          className="h-11 border border-accent bg-surface px-3 text-ink outline-none transition focus:border-secondary"
          defaultValue={supplier?.name || ""}
          disabled={loading}
          name="name"
          required
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-ink">
        <span>Descripcion</span>
        <textarea
          className="min-h-28 resize-y border border-accent bg-surface px-3 py-3 text-ink outline-none transition focus:border-secondary"
          defaultValue={supplier?.description || ""}
          disabled={loading}
          name="description"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-ink">
        <span>Categoria</span>
        <select
          className="h-11 border border-accent bg-surface px-3 text-ink outline-none transition focus:border-secondary"
          defaultValue={supplier?.category || ""}
          disabled={loading}
          name="category"
          required
        >
          <option disabled value="">
            Selecciona una categoria
          </option>
          {SUPPLIER_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-ink">
          <span>Localidad</span>
          <input
            className="h-11 border border-accent bg-surface px-3 text-ink outline-none transition focus:border-secondary"
            defaultValue={supplier?.locality || ""}
            disabled={loading}
            name="locality"
            required
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-ink">
          <span>Provincia</span>
          <select
            className="h-11 border border-accent bg-surface px-3 text-ink outline-none transition focus:border-secondary"
            defaultValue={supplier?.province || ""}
            disabled={loading}
            name="province"
            required
          >
            <option disabled value="">
              Selecciona una provincia
            </option>
            {SUPPLIER_PROVINCES.map((province) => (
              <option key={province.value} value={province.value}>
                {province.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-ink">
        <span>WhatsApp</span>
        <input
          className="h-11 border border-accent bg-surface px-3 text-ink outline-none transition focus:border-secondary"
          defaultValue={supplier?.whatsapp || ""}
          disabled={loading}
          name="whatsapp"
          placeholder="+54 9 261 555 5555"
          type="tel"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-ink">
        <span>Instagram</span>
        <input
          className="h-11 border border-accent bg-surface px-3 text-ink outline-none transition focus:border-secondary"
          defaultValue={supplier?.instagram || ""}
          disabled={loading}
          name="instagram"
          placeholder="https://instagram.com/proveedor"
          type="url"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-ink">
        <span>Sitio web</span>
        <input
          className="h-11 border border-accent bg-surface px-3 text-ink outline-none transition focus:border-secondary"
          defaultValue={supplier?.website || ""}
          disabled={loading}
          name="website"
          placeholder="https://proveedor.com"
          type="url"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-ink">
        <span>Imagen</span>
        {useFirebaseStorage ? (
          <>
            <input name="imageUrl" type="hidden" value={supplier?.imageUrl || ""} readOnly />
            <input name="imagePath" type="hidden" value={supplier?.imagePath || ""} readOnly />
            <input
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="min-w-0 border border-accent bg-surface px-3 py-2 text-sm text-ink outline-none transition file:mr-4 file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-semibold hover:file:bg-secondary/30 focus:border-secondary"
              disabled={loading}
              name="imageFile"
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (!file) {
                  setObjectPreviewUrl("");
                  setPreviewUrl(supplier?.imageUrl || "");
                  return;
                }

                const nextPreviewUrl = URL.createObjectURL(file);
                setObjectPreviewUrl(nextPreviewUrl);
                setPreviewUrl(nextPreviewUrl);
              }}
            />
            <span className="text-sm font-normal leading-6 text-brand">
              Formatos admitidos: JPG, PNG, WEBP o GIF. Tamano maximo: 2 MB.
            </span>
          </>
        ) : (
          <>
            <input
              className="h-11 border border-accent bg-surface px-3 text-ink outline-none transition placeholder:text-brand/60 focus:border-secondary"
              defaultValue={getLocalImageInputValue(supplier?.imageUrl)}
              disabled={loading}
              name="imageUrl"
              placeholder="imagen.jpg"
              onChange={(event) => setPreviewUrl(normalizeLocalImagePath(event.target.value))}
            />
            <span className="text-sm font-normal leading-6 text-brand">
              Guardar la imagen en `public/suppliers` y escribir solamente el nombre del archivo.
            </span>
          </>
        )}
      </label>

      {previewUrl ? (
        <div className="overflow-hidden border border-accent bg-secondary/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Vista previa del proveedor"
            className="h-44 w-full object-cover"
            src={previewUrl}
          />
        </div>
      ) : null}

      <button
        className="h-11 w-full border border-secondary bg-secondary px-4 text-sm font-semibold text-surface transition hover:bg-secondary/90"
        disabled={loading}
        type="submit"
      >
        {loading ? "Guardando..." : submitLabel}
      </button>

      {error ? (
        <p className="border border-brand/40 bg-brand/10 p-3 text-sm leading-6 text-brand">
          {error}
        </p>
      ) : null}
    </form>
  );
}
