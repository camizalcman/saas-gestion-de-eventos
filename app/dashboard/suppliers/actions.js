"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import { createSupplier } from "@/lib/suppliers/suppliers";
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
