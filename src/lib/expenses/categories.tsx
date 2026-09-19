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

const CATEGORY_META: Record<
  ExpenseCategory,
  { label: string; icon: ComponentType<{ className?: string }>; tint: string }
> = {
  food: { label: "Food", icon: Utensils, tint: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
  groceries: { label: "Groceries", icon: ShoppingBasket, tint: "bg-lime-500/10 text-lime-600 dark:text-lime-400" },
  travel: { label: "Travel", icon: Plane, tint: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  transport: { label: "Transport", icon: Car, tint: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  entertainment: { label: "Entertainment", icon: Clapperboard, tint: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  shopping: { label: "Shopping", icon: ShoppingBag, tint: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
  utilities: { label: "Utilities", icon: Zap, tint: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
  rent: { label: "Rent", icon: Home, tint: "bg-secondary text-secondary-foreground" },
  transfer: { label: "Transfer", icon: ArrowLeftRight, tint: "bg-primary/10 text-primary" },
  other: { label: "Other", icon: Receipt, tint: "bg-muted text-muted-foreground" },
};

export function getCategoryMeta(category: string) {
  return CATEGORY_META[category as ExpenseCategory] ?? CATEGORY_META.other;
}

export function isValidExpenseCategory(value: string): value is ExpenseCategory {
  return (EXPENSE_CATEGORIES as readonly string[]).includes(value);
}
