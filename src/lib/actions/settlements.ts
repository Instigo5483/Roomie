"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { room_members, settlements } from "@/db/schema";
import { requireActiveMembership, requireUserId } from "@/lib/auth/session";
import { computeBalances } from "@/lib/expenses/balances";
import { getExpenseSplits, getRoomExpenses, getRoomMembers, getRoomSettlements } from "@/lib/data/room-data";
import type { ActionState } from "./auth";

export async function recordSettlement(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const roomId = String(formData.get("roomId") ?? "");
  const fromMemberId = String(formData.get("fromMemberId") ?? "");
  const toMemberId = String(formData.get("toMemberId") ?? "");
  const amount = Number(formData.get("amount"));
  const method = String(formData.get("method") ?? "cash");
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!roomId || !fromMemberId || !toMemberId) return { error: "Missing settlement details." };
  if (fromMemberId === toMemberId) return { error: "Payer and receiver must be different." };
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Enter a valid amount." };

  const userId = await requireUserId();
  try {
    await requireActiveMembership(userId, roomId);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Not permitted." };
  }

  await db.insert(settlements).values({
    room_id: roomId,
    from_member_id: fromMemberId,
    to_member_id: toMemberId,
    amount: amount.toFixed(2),
    method,
    note,
    created_by: userId,
  });

  revalidatePath(`/room/${roomId}/balances`);
  return { error: null };
}

export async function deactivateMember(memberId: string, roomId: string) {
  const userId = await requireUserId();

  const [member] = await db
    .select()
    .from(room_members)
    .where(eq(room_members.id, memberId))
    .limit(1);
  if (!member) return { error: "Member not found." };

  let membership;
  try {
    membership = await requireActiveMembership(userId, member.room_id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Not permitted." };
  }

  const isSelfOrAdmin = member.user_id === userId || membership.role === "admin";
  if (!isSelfOrAdmin) return { error: "Not permitted." };

  const [members, memberExpenses, roomSettlements] = await Promise.all([
    getRoomMembers(member.room_id),
    getRoomExpenses(member.room_id),
    getRoomSettlements(member.room_id),
  ]);
  const splits = await getExpenseSplits(memberExpenses.map((e) => e.id));

  const balances = computeBalances(members, memberExpenses, splits, roomSettlements);
  const net = balances.find((b) => b.memberId === memberId)?.net ?? 0;

  if (Math.abs(net) > 0.01) {
    return {
      error: `This member has a non-zero balance (₹${net.toFixed(2)}) and can't be removed until settled up.`,
    };
  }

  await db.update(room_members).set({ is_active: false }).where(eq(room_members.id, memberId));

  revalidatePath(`/room/${roomId}/members`);
  revalidatePath(`/room/${roomId}/balances`);
  return { error: null };
}
