import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase/firestore";

const COLLECTION = "suppliers";

function serializeSupplier(doc) {
  const data = doc.data();

  return {
    id: doc.id,
    name: data.name || "",
    description: data.description || "",
    category: data.category || "",
    locality: data.locality || "",
    province: data.province || "",
    whatsapp: data.whatsapp || "",
    instagram: data.instagram || "",
    website: data.website || "",
    imageUrl: data.imageUrl || "",
    imagePath: data.imagePath || "",
    createdAt: data.createdAt?.toDate?.().toISOString() || null,
    updatedAt: data.updatedAt?.toDate?.().toISOString() || null,
  };
}

function normalizeFilter(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/-/g, " ");
}

function matchesFilter(value, filter) {
  if (!filter) {
    return true;
  }

  return normalizeFilter(value) === filter;
}

export async function getSuppliers(filters = {}) {
  const snapshot = await getDb()
    .collection(COLLECTION)
    .orderBy("name")
    .get();

  const category = normalizeFilter(filters.category);
  const province = normalizeFilter(filters.province);
  const locality = normalizeFilter(filters.locality);

  return snapshot.docs
    .map(serializeSupplier)
    .filter(
      (supplier) =>
        matchesFilter(supplier.category, category) &&
        matchesFilter(supplier.province, province) &&
        matchesFilter(supplier.locality, locality),
    );
}

export async function getSuppliersByCategory(category) {
  return getSuppliers({ category });
}

export async function getSupplierById(id) {
  if (!id) return null;

  const doc = await getDb().collection(COLLECTION).doc(id).get();

  if (!doc.exists) return null;

  return serializeSupplier(doc);
}

export async function createSupplier(data) {
  const now = FieldValue.serverTimestamp();

  const docRef = await getDb().collection(COLLECTION).add({
    name: data.name,
    description: data.description || "",
    category: data.category,
    locality: data.locality || "",
    province: data.province || "",
    whatsapp: data.whatsapp,
    instagram: data.instagram || "",
    website: data.website || "",
    imageUrl: data.imageUrl || "",
    imagePath: data.imagePath || "",
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

export async function updateSupplier(id, data) {
  if (!id) throw new Error("ID de proveedor requerido.");

  const now = FieldValue.serverTimestamp();

  await getDb().collection(COLLECTION).doc(id).update({
    name: data.name,
    description: data.description || "",
    category: data.category,
    locality: data.locality || "",
    province: data.province || "",
    whatsapp: data.whatsapp || "",
    instagram: data.instagram || "",
    website: data.website || "",
    imageUrl: data.imageUrl || "",
    imagePath: data.imagePath || "",
    updatedAt: now,
  });
}

export async function deleteSupplier(id) {
  if (!id) throw new Error("ID de proveedor requerido.");

  await getDb().collection(COLLECTION).doc(id).delete();
}
