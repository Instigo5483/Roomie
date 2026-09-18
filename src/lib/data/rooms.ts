import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { room_members, rooms, users } from "@/db/schema";
import type { Room, RoomMemberRole } from "@/types/database";
import { normalizeUsername } from "@/lib/users/username";

export type MyRoom = {
  room: Room;
  role: RoomMemberRole;
  memberCount: number;
};

export async function getMyRooms(userId: string): Promise<MyRoom[]> {
  const memberships = await db
    .select({ room: rooms, role: room_members.role })
    .from(room_members)
    .innerJoin(rooms, eq(room_members.room_id, rooms.id))
    .where(and(eq(room_members.user_id, userId), eq(room_members.is_active, true)))
    .orderBy(desc(room_members.joined_at));

  const counts = await Promise.all(
    memberships.map((m) =>
      db
        .select({ value: count() })
        .from(room_members)
        .where(and(eq(room_members.room_id, m.room.id), eq(room_members.is_active, true))),
    ),
  );

  return memberships.map((m, i) => ({
    room: m.room,
    role: m.role,
    memberCount: counts[i][0]?.value ?? 1,
  }));
}

export async function getRoomById(id: string): Promise<Room | null> {
  const [room] = await db.select().from(rooms).where(eq(rooms.id, id)).limit(1);
  return room ?? null;
}

export async function getMyMembership(roomId: string, userId: string) {
  const [membership] = await db
    .select()
    .from(room_members)
    .where(and(eq(room_members.room_id, roomId), eq(room_members.user_id, userId)))
    .limit(1);

  return membership ?? null;
}

export async function findUserByUsername(usernameRaw: string) {
  const username = normalizeUsername(usernameRaw);
  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return user ?? null;
}
