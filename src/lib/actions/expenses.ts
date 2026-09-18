"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { expense_splits, expenses } from "@/db/schema";
import { requireActiveMembership, requireUserId } from "@/lib/auth/session";
import { splitEqually } from "@/lib/expenses/balances";
import { isValidExpenseCategory } from "@/lib/expenses/categories";
import type { ActionState } from "./auth";

export async function addExpense(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const roomId = String(formData.get("roomId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const category = String(formData.get("category") ?? "other");
  const paidBy = String(formData.get("paidBy") ?? "");
  const expenseDate = String(formData.get("expenseDate") ?? "");
  const expenseTime = String(formData.get("expenseTime") ?? "").trim();
  const splitMode = String(formData.get("splitMode") ?? "equal");
  const includedMemberIds = formData.getAll("includedMemberIds").map(String);

  if (!roomId || !title || !paidBy || !expenseDate) {
    return { error: "All fields are required." };
  }
  if (!isValidExpenseCategory(category)) {
    return { error: "Choose a valid category." };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Enter a valid amount." };
  }
  if (includedMemberIds.length === 0) {
    return { error: "Select at least one member to split with." };
  }

  const userId = await requireUserId();
  try {
    await requireActiveMembership(userId, roomId);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Not permitted." };
  }

  let shares: Record<string, number>;

  if (splitMode === "manual") {
    shares = {};
    let total = 0;
    for (const memberId of includedMemberIds) {
      const value = Number(formData.get(`manualAmount_${memberId}`));
      if (!Number.isFinite(value) || value < 0) {
        return { error: "Manual split amounts must be valid non-negative numbers." };
      }
      shares[memberId] = Math.round(value * 100) / 100;
      total += shares[memberId];
    }
    if (Math.abs(total - amount) > 0.01) {
      return {
        error: `Manual split totals ₹${total.toFixed(2)}, but the expense is ₹${amount.toFixed(2)}.`,
      };
    }
  } else {
    shares = splitEqually(amount, includedMemberIds);
  }

  const [expense] = await db
    .insert(expenses)
    .values({
      room_id: roomId,
      title,
      amount: amount.toFixed(2),
      category,
      paid_by: paidBy,
      expense_date: expenseDate,
      expense_time: expenseTime || null,
      created_by: userId,
    })
    .returning({ id: expenses.id });

  const splitRows = Object.entries(shares).map(([room_member_id, share_amount]) => ({
    expense_id: expense.id,
    room_member_id,
    share_amount: share_amount.toFixed(2),
  }));

  try {
    await db.insert(expense_splits).values(splitRows);
  } catch (error) {
    await db.delete(expenses).where(eq(expenses.id, expense.id));
    return { error: error instanceof Error ? error.message : "Could not save the splits." };
  }

  revalidatePath(`/room/${roomId}`);
  revalidatePath(`/room/${roomId}/balances`);
  return { error: null };
}

export async function deleteExpense(expenseId: string, roomId: string) {
  const userId = await requireUserId();

  const [expense] = await db.select().from(expenses).where(eq(expenses.id, expenseId)).limit(1);
  if (!expense) return { error: "Expense not found." };

  try {
    const membership = await requireActiveMembership(userId, expense.room_id);
    if (expense.created_by !== userId && membership.role !== "admin") {
      return { error: "Only the creator or a room admin can delete this expense." };
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Not permitted." };
  }

  await db.delete(expenses).where(eq(expenses.id, expenseId));

  revalidatePath(`/room/${roomId}`);
  revalidatePath(`/room/${roomId}/balances`);
  return { error: null };
}
