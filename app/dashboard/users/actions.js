"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import {
  createManagedUser,
  deleteManagedUser,
  getCurrentUserProfile,
  updateManagedUser,
  USER_TYPES,
} from "@/lib/users/users";
import {
  emailInput,
  enumInput,
  optionalText,
  passwordInput,
} from "@/lib/validation";

async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentUserProfile(user);

  if (profile?.user_type !== "admin") {
    redirect("/dashboard");
  }

  return user;
}

function parseUserForm(formData, { requirePassword = false } = {}) {
  const email = emailInput(formData.get("email"), { label: "El email", required: requirePassword });
  const password = passwordInput(formData.get("password"), { label: "La contrasena", required: requirePassword });
  const displayName = optionalText(formData.get("displayName"), { label: "El nombre visible", max: 120 });
  const userType = enumInput(formData.get("user_type"), { label: "El tipo de usuario", allowed: USER_TYPES, required: true });

  return {
    email,
    password,
    displayName,
    user_type: userType,
  };
}

export async function createUser(formData) {
  await requireAdmin();
  await createManagedUser(parseUserForm(formData, { requirePassword: true }));
  revalidatePath("/dashboard/users");
}

export async function updateUser(uid, formData) {
  await requireAdmin();
  await updateManagedUser(uid, parseUserForm(formData));
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}

export async function deleteUser(uid) {
  const admin = await requireAdmin();

  if (admin.uid === uid) {
    throw new Error("No se puede eliminar el usuario administrador actual.");
  }

  await deleteManagedUser(uid);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/users");
}
