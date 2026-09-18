import {
  ArrowLeftRight,
  Car,
  Clapperboard,
  Home,
  Plane,
  Receipt,
  ShoppingBag,
  ShoppingBasket,
  Utensils,
  Zap,
} from "lucide-react";
import type { ComponentType } from "react";

export const EXPENSE_CATEGORIES = [
  "food",
  "groceries",
  "travel",
  "transport",
  "entertainment",
  "shopping",
  "utilities",
  "rent",
  "transfer",
  "other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

const CATEGORY_META: Record<ExpenseCategory, { label: string; icon: ComponentType<{ className?: string }> }> = {
  food: { label: "Food", icon: Utensils },
  groceries: { label: "Groceries", icon: ShoppingBasket },
  travel: { label: "Travel", icon: Plane },
  transport: { label: "Transport", icon: Car },
  entertainment: { label: "Entertainment", icon: Clapperboard },
  shopping: { label: "Shopping", icon: ShoppingBag },
  utilities: { label: "Utilities", icon: Zap },
  rent: { label: "Rent", icon: Home },
  transfer: { label: "Transfer", icon: ArrowLeftRight },
  other: { label: "Other", icon: Receipt },
};

export function getCategoryMeta(category: string) {
  return CATEGORY_META[category as ExpenseCategory] ?? CATEGORY_META.other;
}

export function isValidExpenseCategory(value: string): value is ExpenseCategory {
  return (EXPENSE_CATEGORIES as readonly string[]).includes(value);
}
