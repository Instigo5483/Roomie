"use client";

import { motion } from "motion/react";
import { computeBalances } from "@/lib/expenses/balances";
import { MemberRow } from "./member-row";
import { AddMemberForm } from "./add-member-form";
import type { Expense, ExpenseSplit, Room, RoomMember, Settlement } from "@/types/database";

export function MembersView({
  room,
  members,
  expenses,
  splits,
  settlements,
  currentMemberId,
  isAdmin,
}: {
  room: Room;
  members: RoomMember[];
  expenses: Expense[];
  splits: ExpenseSplit[];
  settlements: Settlement[];
  currentMemberId: string | null;
  isAdmin: boolean;
}) {
  const balances = computeBalances(members, expenses, splits, settlements);
  const balanceByMember = Object.fromEntries(balances.map((b) => [b.memberId, b.net]));

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <AddMemberForm roomId={room.id} />
      </motion.div>

      <div className="space-y-2">
        {members.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <MemberRow
              member={member}
              net={balanceByMember[member.id] ?? 0}
              roomId={room.id}
              isMe={member.id === currentMemberId}
              canManage={isAdmin || member.id === currentMemberId}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
