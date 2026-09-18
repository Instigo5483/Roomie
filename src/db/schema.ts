import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  boolean,
  pgEnum,
  date,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Column keys below are intentionally snake_case (matching the actual
// Postgres column names 1:1) rather than the usual Drizzle camelCase
// convention, so the inferred row types line up with the rest of the app.

export const room_member_role = pgEnum("room_member_role", ["admin", "member"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password_hash: text("password_hash"),
  full_name: text("full_name"),
  avatar_url: text("avatar_url"),
  upi_id: text("upi_id"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  created_by: uuid("created_by")
    .notNull()
    .references(() => users.id),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const room_members = pgTable(
  "room_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    room_id: uuid("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    display_name: text("display_name").notNull(),
    role: room_member_role("role").notNull().default("member"),
    is_active: boolean("is_active").notNull().default(true),
    joined_at: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.room_id, table.user_id)],
);

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  room_id: uuid("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  paid_by: uuid("paid_by")
    .notNull()
    .references(() => room_members.id),
  expense_date: date("expense_date").notNull().defaultNow(),
  created_by: uuid("created_by")
    .notNull()
    .references(() => users.id),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const expense_splits = pgTable(
  "expense_splits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    expense_id: uuid("expense_id")
      .notNull()
      .references(() => expenses.id, { onDelete: "cascade" }),
    room_member_id: uuid("room_member_id")
      .notNull()
      .references(() => room_members.id),
    share_amount: numeric("share_amount", { precision: 12, scale: 2 }).notNull(),
  },
  (table) => [unique().on(table.expense_id, table.room_member_id)],
);

export const settlements = pgTable("settlements", {
  id: uuid("id").primaryKey().defaultRandom(),
  room_id: uuid("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  from_member_id: uuid("from_member_id")
    .notNull()
    .references(() => room_members.id),
  to_member_id: uuid("to_member_id")
    .notNull()
    .references(() => room_members.id),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  method: text("method").notNull().default("cash"),
  note: text("note"),
  created_by: uuid("created_by")
    .notNull()
    .references(() => users.id),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rooms_relations = relations(rooms, ({ many }) => ({
  members: many(room_members),
}));

export const room_members_relations = relations(room_members, ({ one }) => ({
  room: one(rooms, { fields: [room_members.room_id], references: [rooms.id] }),
  user: one(users, { fields: [room_members.user_id], references: [users.id] }),
}));
