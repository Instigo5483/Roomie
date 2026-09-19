import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { room_members, rooms, users } from "@/db/schema";
import type { Room, RoomMemberRole } from "@/types/database";
import { normalizeUsername } from "@/lib/users/username";
import { getExpenseSplits, getRoomExpenses, getRoomMembers, getRoomSettlements } from "@/lib/data/room-data";
import { computeBalances } from "@/lib/expenses/balances";

export type MyRoom = {
  room: Room;
  role: RoomMemberRole;
  memberCount: number;
  netBalance: number;
};

export async function getMyRooms(userId: string): Promise<MyRoom[]> {
  const memberships = await db
    .select({ room: rooms, role: room_members.role, memberId: room_members.id })
    .from(room_members)
    .innerJoin(rooms, eq(room_members.room_id, rooms.id))
    .where(and(eq(room_members.user_id, userId), eq(room_members.is_active, true)))
    .orderBy(desc(room_members.joined_at));

  const details = await Promise.all(
    memberships.map(async (m) => {
      const [memberCountRows, members, expenses, settlements] = await Promise.all([
        db
          .select({ value: count() })
          .from(room_members)
          .where(and(eq(room_members.room_id, m.room.id), eq(room_members.is_active, true))),
        getRoomMembers(m.room.id),
        getRoomExpenses(m.room.id),
        getRoomSettlements(m.room.id),
      ]);
      const splits = await getExpenseSplits(expenses.map((e) => e.id));
      const balances = computeBalances(members, expenses, splits, settlements);
      const netBalance = balances.find((b) => b.memberId === m.memberId)?.net ?? 0;

      return { memberCount: memberCountRows[0]?.value ?? 1, netBalance };
    }),
  );

  return memberships.map((m, i) => ({
    room: m.room,
    role: m.role,
    memberCount: details[i].memberCount,
    netBalance: details[i].netBalance,
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
