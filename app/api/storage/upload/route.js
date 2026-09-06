import { NextResponse } from "next/server";
import { getAdminStorage } from "@/lib/firebase/admin";
import { getCurrentUser } from "@/lib/firebase/session";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

function cleanSegment(value, fallback) {
  return String(value || fallback)
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "-");
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const entity = String(formData.get("entity") || "items");
  const itemId = String(formData.get("itemId") || "uploads");

  if (!file || typeof file.arrayBuffer !== "function") {
    return NextResponse.json({ error: "Falta el archivo." }, { status: 400 });
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "La imagen debe ser JPG, PNG, WEBP o GIF." },
      { status: 400 },
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json(
      { error: "La imagen no puede superar los 2 MB." },
      { status: 400 },
    );
  }

  try {
    const safeEntity = cleanSegment(entity, "items");
    const safeUserId = cleanSegment(user.uid, "user");
    const safeItemId = cleanSegment(itemId, "uploads");
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const imagePath = `${safeEntity}/${safeUserId}/${safeItemId}/${Date.now()}.${extension}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    const bucket = bucketName ? getAdminStorage().bucket(bucketName) : getAdminStorage().bucket();
    const storageFile = bucket.file(imagePath);
    await storageFile.save(buffer, { contentType: file.type });

    const [imageUrl] = await storageFile.getSignedUrl({
      action: "read",
      expires: "01-01-2100",
    });

    return NextResponse.json({ imagePath, imageUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "No se pudo subir la imagen." },
      { status: 500 },
    );
  }
}