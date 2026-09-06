function cleanSegment(value, fallback) {
  return String(value || fallback)
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "-");
}

export async function uploadEntityImage({
  file,
  entity = "items",
  itemId = "uploads",
}) {
  if (!file || file.size === 0) {
    return null;
  }

  const body = new FormData();
  body.set("file", file);
  body.set("entity", cleanSegment(entity, "items"));
  body.set("itemId", cleanSegment(itemId, "uploads"));

  const response = await fetch("/api/storage/upload", {
    method: "POST",
    body,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "No se pudo subir la imagen.");
  }

  return {
    imagePath: data.imagePath,
    imageUrl: data.imageUrl,
  };
}