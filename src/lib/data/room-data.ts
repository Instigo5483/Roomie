import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { expense_splits, expenses, room_members, settlements, users } from "@/db/schema";

export async function getRoomMembers(roomId: string) {
  return db
    .select()
    .from(room_members)
    .where(eq(room_members.room_id, roomId))
    .orderBy(asc(room_members.joined_at));
}

export async function getRoomExpenses(roomId: string) {
  return db
    .select()
    .from(expenses)
    .where(eq(expenses.room_id, roomId))
    .orderBy(desc(expenses.expense_date), desc(expenses.created_at));
}

export async function getExpenseSplits(expenseIds: string[]) {
  if (expenseIds.length === 0) return [];
  return db.select().from(expense_splits).where(inArray(expense_splits.expense_id, expenseIds));
}

export async function getRoomSettlements(roomId: string) {
  return db
    .select()
    .from(settlements)
    .where(eq(settlements.room_id, roomId))
    .orderBy(desc(settlements.created_at));
}

export async function getUpiIdsByUserIds(userIds: string[]) {
  if (userIds.length === 0) return {};
  const rows = await db
    .select({ id: users.id, upi_id: users.upi_id })
    .from(users)
    .where(inArray(users.id, userIds));

  const map: Record<string, string | null> = {};
  for (const row of rows) map[row.id] = row.upi_id;
  return map;
}
