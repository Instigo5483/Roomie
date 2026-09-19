"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Receipt, SearchX } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { defaultExpenseFilters, filterExpenses } from "@/lib/expenses/filters";
import { ExpenseItem } from "./expense-item";
import { AddExpenseSheet } from "./add-expense-sheet";
import { ExpensesToolbar } from "./expenses-toolbar";
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
  const [filters, setFilters] = useState(defaultExpenseFilters);

  const filteredExpenses = useMemo(
    () => filterExpenses(expenses, filters),
    [expenses, filters],
  );

  const monthLabel = new Date().toLocaleDateString("en-IN", { month: "long" });
  const monthTotal = useMemo(() => {
    const ym = new Date().toISOString().slice(0, 7);
    return expenses
      .filter((e) => e.expense_date.startsWith(ym))
      .reduce((sum, e) => sum + Number(e.amount), 0);
  }, [expenses]);

  const groups = filteredExpenses.reduce<Record<string, Expense[]>>((acc, e) => {
    (acc[e.expense_date] ??= []).push(e);
    return acc;
  }, {});

  return (
    <div>
      {expenses.length > 0 && (
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Expenses</h1>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(monthTotal)} spent in {monthLabel}
            </p>
          </div>
        </div>
      )}

      {expenses.length > 0 && <ExpensesToolbar members={members} filters={filters} onChange={setFilters} />}

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
      ) : filteredExpenses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 py-20 text-center"
        >
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
            <SearchX className="size-7 text-muted-foreground" />
          </div>
          <p className="font-medium">No matching expenses</p>
          <p className="max-w-[26ch] text-sm text-muted-foreground">
            Try a different search term or clear your filters.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groups).map(([date, dayExpenses]) => (
            <div key={date}>
              <p className="mb-2 flex items-center justify-between px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <span>{formatDate(date)}</span>
                <span>{formatCurrency(dayExpenses.reduce((sum, e) => sum + Number(e.amount), 0))}</span>
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
