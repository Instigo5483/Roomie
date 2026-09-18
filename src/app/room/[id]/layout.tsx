import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMyMembership, getMyRooms, getRoomById } from "@/lib/data/rooms";
import { RoomShell } from "@/components/room/room-shell";

export default async function RoomLayout({
  children,
  params,
}: LayoutProps<"/room/[id]">) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const room = await getRoomById(id);
  if (!room) redirect("/rooms?error=room_not_found");

  const membership = await getMyMembership(room.id, session.user.id);
  if (!membership || !membership.is_active) redirect("/rooms?error=not_a_member");

  const myRooms = await getMyRooms(session.user.id);

  return (
    <RoomShell room={room} membership={membership} myRooms={myRooms}>
      {children}
    </RoomShell>
  );
}
