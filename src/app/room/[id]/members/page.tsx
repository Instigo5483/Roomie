import { auth } from "@/auth";
import { getMyMembership, getRoomById } from "@/lib/data/rooms";
import {
  getExpenseSplits,
  getRoomExpenses,
  getRoomMembers,
  getRoomSettlements,
} from "@/lib/data/room-data";
import { MembersView } from "@/components/members/members-view";

export default async function RoomMembersPage({ params }: PageProps<"/room/[id]">) {
  const { id } = await params;
  const session = await auth();
  const room = (await getRoomById(id))!;

  const [members, expenses, settlements, membership] = await Promise.all([
    getRoomMembers(room.id),
    getRoomExpenses(room.id),
    getRoomSettlements(room.id),
    getMyMembership(room.id, session!.user.id),
  ]);
  const splits = await getExpenseSplits(expenses.map((e) => e.id));

  return (
    <MembersView
      room={room}
      members={members}
      expenses={expenses}
      splits={splits}
      settlements={settlements}
      currentMemberId={membership?.id ?? null}
      isAdmin={membership?.role === "admin"}
    />
  );
}
