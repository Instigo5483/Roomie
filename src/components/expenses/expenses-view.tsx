"use client";

import { AnimatePresence, motion } from "motion/react";
import { Receipt } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ExpenseItem } from "./expense-item";
import { AddExpenseSheet } from "./add-expense-sheet";
import type { Expense, ExpenseSplit, Room, RoomMember } from "@/types/database";

export function ExpensesView({
  room,
  members,
  expenses,
  splits,
  currentMemberId,
  currentUserId,
  isAdmin,
}: {
  room: Room;
  members: RoomMember[];
  expenses: Expense[];
  splits: ExpenseSplit[];
  currentMemberId: string | null;
  currentUserId: string;
  isAdmin: boolean;
}) {
  const activeMembers = members.filter((m) => m.is_active);

  const groups = expenses.reduce<Record<string, Expense[]>>((acc, e) => {
    (acc[e.expense_date] ??= []).push(e);
    return acc;
  }, {});

  return (
    <div>
      {expenses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 py-20 text-center"
        >
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
            <Receipt className="size-7 text-muted-foreground" />
          </div>
          <p className="font-medium">No expenses yet</p>
          <p className="max-w-[26ch] text-sm text-muted-foreground">
            Tap the + button to add your first shared expense.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groups).map(([date, dayExpenses]) => (
            <div key={date}>
              <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {formatDate(date)}
              </p>
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {dayExpenses.map((expense) => (
                    <ExpenseItem
                      key={expense.id}
                      expense={expense}
                      splits={splits.filter((s) => s.expense_id === expense.id)}
                      members={members}
                      currentMemberId={currentMemberId}
                      roomId={room.id}
                      canDelete={expense.created_by === currentUserId || isAdmin}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddExpenseSheet room={room} members={activeMembers} />
    </div>
  );
}
