"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { room_members, rooms, users } from "@/db/schema";
import { signOut as authSignOut } from "@/auth";
import { requireUserId } from "@/lib/auth/session";
import { isValidUsername, normalizeUsername } from "@/lib/users/username";
import { getRoomMembers } from "@/lib/data/room-data";
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
  if (newPassword.length < 8) return { error: "New password must be at least 8 characters." };
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

const MAX_AVATAR_BYTES = 600 * 1024;

export async function updateAvatar(dataUrl: string): Promise<ActionState> {
  if (!dataUrl.startsWith("data:image/")) return { error: "Invalid image data." };

  const approxBytes = (dataUrl.length * 3) / 4;
  if (approxBytes > MAX_AVATAR_BYTES) return { error: "Image is too large — try a different one." };

  const userId = await requireUserId();
  await db.update(users).set({ avatar_url: dataUrl }).where(eq(users.id, userId));

  revalidatePath("/settings");
  revalidatePath("/rooms");
  return { error: null };
}

export async function removeAvatar(): Promise<ActionState> {
  const userId = await requireUserId();
  await db.update(users).set({ avatar_url: null }).where(eq(users.id, userId));

  revalidatePath("/settings");
  revalidatePath("/rooms");
  return { error: null };
}

/**
 * Invalidates every JWT issued before now for this user (see the `jwt`
 * callback in src/auth.ts) and signs the current browser out too, so "sign
 * out everywhere" actually covers the device that clicked it.
 */
export async function signOutAllDevices(): Promise<ActionState> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Not permitted." };
  }

  await db.update(users).set({ sessions_invalidated_at: new Date() }).where(eq(users.id, userId));
  await authSignOut({ redirect: false });
  redirect("/login");
}

/**
 * Deletes the account without hard-deleting the `users` row: room_members,
 * expenses, and settlements all reference users and would violate foreign
 * keys (or, worse, silently corrupt other members' shared history) if we
 * removed it outright. Instead we anonymize the row and deactivate the
 * user's room memberships, same as leaving each room individually.
 */
export async function deleteAccount(): Promise<ActionState> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Not permitted." };
  }

  const memberships = await db
    .select({ id: room_members.id, room_id: room_members.room_id, role: room_members.role })
    .from(room_members)
    .where(and(eq(room_members.user_id, userId), eq(room_members.is_active, true)));

  for (const membership of memberships) {
    const roomMembers = await getRoomMembers(membership.room_id);
    const otherActive = roomMembers.filter((m) => m.is_active && m.id !== membership.id);

    if (otherActive.length === 0) {
      // Last active member — the room has no one left to hand it to.
      await db.delete(rooms).where(eq(rooms.id, membership.room_id));
      continue;
    }

    if (membership.role === "admin" && !otherActive.some((m) => m.role === "admin")) {
      await db
        .update(room_members)
        .set({ role: "admin" })
        .where(eq(room_members.id, otherActive[0].id));
    }

    await db.update(room_members).set({ is_active: false }).where(eq(room_members.id, membership.id));
  }

  const tag = userId.slice(0, 8);
  await db
    .update(users)
    .set({
      username: `deleted_${tag}`,
      email: `deleted-${tag}@deleted.roomie.local`,
      password_hash: null,
      full_name: null,
      avatar_url: null,
      upi_id: null,
      sessions_invalidated_at: new Date(),
    })
    .where(eq(users.id, userId));

  await authSignOut({ redirect: false });
  redirect("/login");
}
