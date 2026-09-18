import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { room_members } from "@/db/schema";

export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  return session.user.id;
}

/** Throws unless the user is an active member of the room — the app-level stand-in for RLS. */
export async function requireActiveMembership(userId: string, roomId: string) {
  const [membership] = await db
    .select()
    .from(room_members)
    .where(
      and(
        eq(room_members.room_id, roomId),
        eq(room_members.user_id, userId),
        eq(room_members.is_active, true),
      ),
    )
    .limit(1);

  if (!membership) throw new Error("You're not a member of this room.");
  return membership;
}
