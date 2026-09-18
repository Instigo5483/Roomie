"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUserId } from "@/lib/auth/session";
import { isValidUsername, normalizeUsername } from "@/lib/users/username";
import type { ActionState } from "./auth";

export async function updateUsername(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const username = normalizeUsername(String(formData.get("username") ?? ""));

  if (!isValidUsername(username)) {
    return {
      error: "Username must be 3-20 characters: lowercase letters, numbers, or underscores.",
    };
  }

  const userId = await requireUserId();

  const existing = await db.query.users.findFirst({ where: eq(users.username, username) });
  if (existing && existing.id !== userId) {
    return { error: "That username is already taken." };
  }

  await db.update(users).set({ username }).where(eq(users.id, userId));

  revalidatePath("/settings");
  revalidatePath("/rooms");
  return { error: null };
}

export async function updatePassword(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword) return { error: "All fields are required." };
  if (newPassword.length < 6) return { error: "New password must be at least 6 characters." };
  if (newPassword !== confirmPassword) return { error: "New passwords don't match." };

  const userId = await requireUserId();
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user?.password_hash) return { error: "Account not found." };

  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) return { error: "Current password is incorrect." };

  const newHash = await bcrypt.hash(newPassword, 10);
  await db.update(users).set({ password_hash: newHash }).where(eq(users.id, userId));

  return { error: null };
}
