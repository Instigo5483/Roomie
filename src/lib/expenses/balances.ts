import type { Expense, ExpenseSplit, RoomMember, Settlement } from "@/types/database";
import type { MemberBalance } from "./simplify-debts";

export type MemberBalanceDetail = MemberBalance & {
  member: RoomMember;
  totalPaid: number;
  totalOwed: number;
  settledOut: number;
  settledIn: number;
};

/**
 * Net balance per member: positive means the group owes them money, negative
 * means they owe the group. Mirrors the SQL in deactivate_member() so the
 * client and the zero-balance guard never disagree.
 */
export function computeBalances(
  members: RoomMember[],
  expenses: Expense[],
  splits: ExpenseSplit[],
  settlements: Settlement[],
): MemberBalanceDetail[] {
  return members.map((member) => {
    const totalPaid = expenses
      .filter((e) => e.paid_by === member.id)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const totalOwed = splits
      .filter((s) => s.room_member_id === member.id)
      .reduce((sum, s) => sum + Number(s.share_amount), 0);

    const settledOut = settlements
      .filter((s) => s.from_member_id === member.id)
      .reduce((sum, s) => sum + Number(s.amount), 0);

    const settledIn = settlements
      .filter((s) => s.to_member_id === member.id)
      .reduce((sum, s) => sum + Number(s.amount), 0);

    const net = Math.round((totalPaid - totalOwed - settledOut + settledIn) * 100) / 100;

    return { memberId: member.id, member, net, totalPaid, totalOwed, settledOut, settledIn };
  });
}

/** Even split across the given member ids, cents-accurate (leftover cents spread across the first few members). */
export function splitEqually(amount: number, memberIds: string[]): Record<string, number> {
  if (memberIds.length === 0) return {};
  const cents = Math.round(amount * 100);
  const base = Math.floor(cents / memberIds.length);
  const remainder = cents - base * memberIds.length;

  const shares: Record<string, number> = {};
  memberIds.forEach((id, index) => {
    const centsForMember = base + (index < remainder ? 1 : 0);
    shares[id] = Math.round(centsForMember) / 100;
  });
  return shares;
}
