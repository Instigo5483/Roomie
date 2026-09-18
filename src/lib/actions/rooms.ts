"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { room_members, rooms, users } from "@/db/schema";
import { requireActiveMembership, requireUserId } from "@/lib/auth/session";
import { findUserByUsername } from "@/lib/data/rooms";
import { normalizeUsername } from "@/lib/users/username";
import type { ActionState } from "./auth";

export async function createRoom(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const rawUsernames = formData.getAll("usernames").map(String);

  if (!name) return { error: "Room name is required." };

  const userId = await requireUserId();
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return { error: "Not authenticated." };

  const uniqueUsernames = [...new Set(rawUsernames.map(normalizeUsername))].filter(
    (u) => u && u !== user.username,
  );

  const roommates = [];
  for (const username of uniqueUsernames) {
    const found = await findUserByUsername(username);
    if (!found) {
      return {
        error: `No account found for "@${username}". Ask them to sign up first.`,
      };
    }
    roommates.push(found);
  }

  const [room] = await db.insert(rooms).values({ name, created_by: userId }).returning();

  await db.insert(room_members).values([
    {
      room_id: room.id,
      user_id: userId,
      display_name: user.full_name || user.username,
      role: "admin",
    },
    ...roommates.map((roommate) => ({
      room_id: room.id,
      user_id: roommate.id,
      display_name: roommate.full_name || roommate.username,
      role: "member" as const,
    })),
  ]);

  revalidatePath("/rooms");
  redirect(`/room/${room.id}`);
}

export async function addRoomMember(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const roomId = String(formData.get("roomId") ?? "");
  const username = normalizeUsername(String(formData.get("username") ?? ""));

  if (!roomId || !username) return { error: "Enter a username." };

  const userId = await requireUserId();
  try {
    await requireActiveMembership(userId, roomId);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Not permitted." };
  }

  const found = await findUserByUsername(username);
  if (!found) {
    return { error: `No account found for "@${username}". Ask them to sign up first.` };
  }

  const existing = await db
    .select()
    .from(room_members)
    .where(eq(room_members.room_id, roomId))
    .then((rows) => rows.find((m) => m.user_id === found.id));

  if (existing) {
    if (existing.is_active) return { error: `@${username} is already in this room.` };
    await db
      .update(room_members)
      .set({ is_active: true })
      .where(eq(room_members.id, existing.id));
  } else {
    await db.insert(room_members).values({
      room_id: roomId,
      user_id: found.id,
      display_name: found.full_name || found.username,
      role: "member",
    });
  }

  revalidatePath(`/room/${roomId}/members`);
  revalidatePath(`/room/${roomId}/balances`);
  return { error: null };
}
