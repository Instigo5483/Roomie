import { auth } from "@/auth";
import { getMyMembership, getRoomById } from "@/lib/data/rooms";
import {
  getExpenseSplits,
  getRoomExpenses,
  getRoomMembers,
  getRoomSettlements,
  getUpiIdsByUserIds,
} from "@/lib/data/room-data";
import { BalancesView } from "@/components/balances/balances-view";

export default async function RoomBalancesPage({ params }: PageProps<"/room/[id]">) {
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
  const upiIds = await getUpiIdsByUserIds(members.map((m) => m.user_id));

  return (
    <BalancesView
      room={room}
      members={members}
      expenses={expenses}
      splits={splits}
      settlements={settlements}
      upiIds={upiIds}
      currentMemberId={membership?.id ?? null}
    />
  );
}
