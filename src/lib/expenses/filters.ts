import type { Expense } from "@/types/database";

export type ExpenseFilters = {
  search: string;
  paidBy: string; // "all" or a room_member id
  fromDate: string; // "" or "YYYY-MM-DD"
  toDate: string; // "" or "YYYY-MM-DD"
};

export const defaultExpenseFilters: ExpenseFilters = {
  search: "",
  paidBy: "all",
  fromDate: "",
  toDate: "",
};

export function filterExpenses(expenses: Expense[], filters: ExpenseFilters): Expense[] {
  const search = filters.search.trim().toLowerCase();

  return expenses.filter((expense) => {
    if (search && !expense.title.toLowerCase().includes(search)) return false;
    if (filters.paidBy !== "all" && expense.paid_by !== filters.paidBy) return false;
    if (filters.fromDate && expense.expense_date < filters.fromDate) return false;
    if (filters.toDate && expense.expense_date > filters.toDate) return false;
    return true;
  });
}

export function countActiveFilters(filters: ExpenseFilters): number {
  let count = 0;
  if (filters.paidBy !== "all") count++;
  if (filters.fromDate) count++;
  if (filters.toDate) count++;
  return count;
}
