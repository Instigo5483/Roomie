"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";
import { computeBalances } from "@/lib/expenses/balances";
import { cn } from "@/lib/utils";
import { MemberRow } from "./member-row";
import { AddMemberForm } from "./add-member-form";
import { DeleteRoomSection } from "./delete-room-section";
import type { Expense, ExpenseSplit, Room, RoomMember, Settlement } from "@/types/database";

type MemberFilter = "all" | "active" | "inactive";

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

  const [filter, setFilter] = useState<MemberFilter>("all");
  const activeCount = members.filter((m) => m.is_active).length;
  const inactiveCount = members.length - activeCount;

  const filteredMembers = useMemo(
    () => members.filter((m) => filter === "all" || (filter === "active" ? m.is_active : !m.is_active)),
    [members, filter],
  );

  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-card p-4">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" />
          {members.length} members ({activeCount} active{inactiveCount > 0 && `, ${inactiveCount} inactive`})
        </p>
        {isAdmin && (
          <p className="mt-2 flex items-start gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
            <span>
              <span className="font-medium text-foreground">You are an admin.</span> You can invite roommates,
              manage member permissions, and delete this room.
            </span>
          </p>
        )}

        {inactiveCount > 0 && (
          <div className="mt-3 flex items-center gap-1.5">
            {(
              [
                { key: "all", label: `All (${members.length})` },
                { key: "active", label: `Active (${activeCount})` },
                { key: "inactive", label: `Inactive (${inactiveCount})` },
              ] as const
            ).map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  filter === f.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <AddMemberForm roomId={room.id} />
      </motion.div>

      <div className="space-y-2">
        {filteredMembers.map((member, i) => (
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
              isViewerAdmin={isAdmin}
              canManage={isAdmin || member.id === currentMemberId}
            />
          </motion.div>
        ))}
      </div>

      {isAdmin && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <DeleteRoomSection roomId={room.id} roomName={room.name} />
        </motion.div>
      )}
    </div>
  );
}
