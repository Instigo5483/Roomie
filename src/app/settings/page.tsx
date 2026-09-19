import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getMyRooms } from "@/lib/data/rooms";
import { SettingsView } from "@/components/settings/settings-view";

export const metadata: Metadata = { title: "Settings — Roomie" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, rooms] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, session.user.id) }),
    getMyRooms(session.user.id),
  ]);
  if (!user) redirect("/login");

  const hasUnsettledBalance = rooms.some((r) => Math.abs(r.netBalance) > 0.01);

  return (
    <SettingsView
      username={user.username}
      email={user.email}
      avatarUrl={user.avatar_url}
      hasUnsettledBalance={hasUnsettledBalance}
    />
  );
}
