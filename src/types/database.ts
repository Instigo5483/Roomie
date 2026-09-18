import type {
  users,
  rooms,
  room_members,
  expenses,
  expense_splits,
  settlements,
} from "@/db/schema";

export type RoomMemberRole = "admin" | "member";

export type Profile = typeof users.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type RoomMember = typeof room_members.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type ExpenseSplit = typeof expense_splits.$inferSelect;
export type Settlement = typeof settlements.$inferSelect;
