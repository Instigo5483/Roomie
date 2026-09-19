import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getMyRooms } from "@/lib/data/rooms";
import { RoomsGateway } from "@/components/rooms/rooms-gateway";

export const metadata: Metadata = { title: "Your Rooms — Roomie" };

export default async function RoomsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [rooms, user] = await Promise.all([
    getMyRooms(session.user.id),
    db.query.users.findFirst({ where: eq(users.id, session.user.id) }),
  ]);

  return (
    <RoomsGateway
      rooms={rooms}
      username={user?.username ?? ""}
      userEmail={session.user.email ?? ""}
      avatarUrl={user?.avatar_url ?? null}
    />
  );
}
