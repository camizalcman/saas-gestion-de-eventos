"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActiveEvent } from "@/lib/events/active";
import { addEventProvider, getUserEvent } from "@/lib/events/events";
import { getCurrentUser } from "@/lib/firebase/session";
import { createSupplier, getSupplierById } from "@/lib/suppliers/suppliers";
import { validateSupplier } from "@/lib/suppliers/validation";
import { getCurrentUserProfile } from "@/lib/users/users";

async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentUserProfile(user);

  if (profile?.user_type !== "admin") {
    redirect("/dashboard/panel");
  }

  return user;
}

function parseSupplierForm(formData) {
  return validateSupplier({
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
    locality: formData.get("locality"),
    province: formData.get("province"),
    whatsapp: formData.get("whatsapp"),
    instagram: formData.get("instagram"),
    website: formData.get("website"),
    imageUrl: formData.get("imageUrl"),
    imagePath: formData.get("imagePath"),
  });
}

export async function createSupplierAction(formData) {
  await requireAdmin();
  await createSupplier(parseSupplierForm(formData));

  revalidatePath("/dashboard/suppliers");
  revalidatePath("/dashboard");
}

export async function addSupplierToEvent(supplierId, eventId) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const event = eventId
    ? await getUserEvent(user.uid, eventId)
    : await getActiveEvent(user);

  if (!event) {
    throw new Error("No tenés ningún evento creado.");
  }

  const supplier = await getSupplierById(supplierId);

  if (!supplier) {
    throw new Error("Proveedor no encontrado.");
  }

  const providers = event.providers || [];
  const alreadyExists = providers.some((p) => p.supplierId === supplierId);

  if (alreadyExists) {
    throw new Error("Este proveedor ya está en tu evento.");
  }

  await addEventProvider(user.uid, event.id, {
    name: supplier.name,
    category: supplier.category,
    description: supplier.description || "",
    locality: supplier.locality || "",
    province: supplier.province || "",
    whatsapp: supplier.whatsapp || "",
    instagram: supplier.instagram || "",
    website: supplier.website || "",
    imageUrl: supplier.imageUrl || "",
    supplierId: supplier.id,
  });

  revalidatePath("/dashboard/proveedores", "layout");

  return event.title;
}
