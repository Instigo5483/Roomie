import { auth } from "@/auth";
import { getMyMembership, getRoomById } from "@/lib/data/rooms";
import { getExpenseSplits, getRoomExpenses, getRoomMembers } from "@/lib/data/room-data";
import { ExpensesView } from "@/components/expenses/expenses-view";

export default async function RoomExpensesPage({ params }: PageProps<"/room/[id]">) {
  const { id } = await params;
  const session = await auth();
  const room = (await getRoomById(id))!;

  const [members, expenses, membership] = await Promise.all([
    getRoomMembers(room.id),
    getRoomExpenses(room.id),
    getMyMembership(room.id, session!.user.id),
  ]);
  const splits = await getExpenseSplits(expenses.map((e) => e.id));

  return (
    <ExpensesView
      room={room}
      members={members}
      expenses={expenses}
      splits={splits}
      currentMemberId={membership?.id ?? null}
      currentUserId={session!.user.id}
      isAdmin={membership?.role === "admin"}
    />
  );
}
