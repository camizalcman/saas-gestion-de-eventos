import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase/firestore";

const COLLECTION = "suppliers";

function serializeSupplier(doc) {
  const data = doc.data();

  return {
    id: doc.id,
    name: data.name || "",
    category: data.category || "",
    whatsapp: data.whatsapp || "",
    instagram: data.instagram || "",
    website: data.website || "",
    createdAt: data.createdAt?.toDate?.().toISOString() || null,
    updatedAt: data.updatedAt?.toDate?.().toISOString() || null,
  };
}

export async function getSuppliers() {
  const snapshot = await getDb()
    .collection(COLLECTION)
    .orderBy("name")
    .get();

  return snapshot.docs.map(serializeSupplier);
}

export async function getSuppliersByCategory(category) {
  const snapshot = await getDb()
    .collection(COLLECTION)
    .where("category", "==", category)
    .orderBy("name")
    .get();

  return snapshot.docs.map(serializeSupplier);
}

export async function createSupplier(data) {
  const now = FieldValue.serverTimestamp();

  const docRef = await getDb().collection(COLLECTION).add({
    name: data.name,
    category: data.category,
    whatsapp: data.whatsapp,
    instagram: data.instagram || "",
    website: data.website || "",
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}