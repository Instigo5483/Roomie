"use client";

import { motion } from "motion/react";
import { ArrowRight, CheckCircle2, Scale, Smartphone } from "lucide-react";
import { computeBalances } from "@/lib/expenses/balances";
import { simplifyDebts } from "@/lib/expenses/simplify-debts";
import { buildUpiLink } from "@/lib/expenses/upi";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SettleUpDialog } from "./settle-up-dialog";
import type { Expense, ExpenseSplit, Room, RoomMember, Settlement } from "@/types/database";

export function BalancesView({
  room,
  members,
  expenses,
  splits,
  settlements,
  upiIds,
  currentMemberId,
}: {
  room: Room;
  members: RoomMember[];
  expenses: Expense[];
  splits: ExpenseSplit[];
  settlements: Settlement[];
  upiIds: Record<string, string | null>;
  currentMemberId: string | null;
}) {
  const balances = computeBalances(members, expenses, splits, settlements);
  const transactions = simplifyDebts(balances.map((b) => ({ memberId: b.memberId, net: b.net })));
  const memberById = Object.fromEntries(members.map((m) => [m.id, m]));

  const myBalance = balances.find((b) => b.memberId === currentMemberId);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-none bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md">
          <CardContent className="py-2">
            <p className="text-sm opacity-80">
              {myBalance && myBalance.net > 0.01
                ? "You are owed"
                : myBalance && myBalance.net < -0.01
                  ? "You owe"
                  : "You're all settled up"}
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight">
              {myBalance ? formatCurrency(Math.abs(myBalance.net)) : formatCurrency(0)}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <section>
        <h2 className="mb-2.5 px-1 text-sm font-semibold">Balances</h2>
        <div className="space-y-2">
          {balances.map((b, i) => (
            <motion.div
              key={b.memberId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 rounded-xl border bg-card px-3.5 py-3"
            >
              <Avatar className="size-9">
                <AvatarFallback className="bg-muted text-sm">
                  {b.member.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {b.member.display_name}
                  {b.memberId === currentMemberId && (
                    <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>
                  )}
                </p>
                {!b.member.is_active && (
                  <p className="text-xs text-muted-foreground">Inactive</p>
                )}
              </div>
              <p
                className={cn(
                  "text-sm font-semibold",
                  b.net > 0.01 ? "text-success" : b.net < -0.01 ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {b.net > 0.01 ? "+" : b.net < -0.01 ? "-" : ""}
                {formatCurrency(Math.abs(b.net))}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2.5 flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold">Suggested settlements</h2>
          <SettleUpDialog room={room} members={members} trigger={<Button size="sm" variant="outline">Settle up</Button>} />
        </div>

        {transactions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
              <Scale className="size-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Everyone is settled up. Nice!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {transactions.map((t, i) => {
              const from = memberById[t.fromMemberId];
              const to = memberById[t.toMemberId];
              const toUpi = upiIds[to?.user_id ?? ""];
              const iAmPayer = t.fromMemberId === currentMemberId;

              return (
                <motion.div
                  key={`${t.fromMemberId}-${t.toMemberId}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card>
                    <CardContent className="flex flex-col gap-3 py-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{from?.display_name}</span>
                        <ArrowRight className="size-4 text-muted-foreground" />
                        <span className="font-medium">{to?.display_name}</span>
                        <span className="ml-auto font-semibold">{formatCurrency(t.amount)}</span>
                      </div>
                      <div className="flex gap-2">
                        {iAmPayer && toUpi && to && (
                          <Button asChild size="sm" variant="secondary" className="flex-1">
                            <a
                              href={buildUpiLink({
                                payeeUpiId: toUpi,
                                payeeName: to.display_name,
                                amount: t.amount,
                                note: `${room.name} settlement`,
                              })}
                            >
                              <Smartphone /> Pay with UPI
                            </a>
                          </Button>
                        )}
                        <SettleUpDialog
                          room={room}
                          members={members}
                          defaultFrom={t.fromMemberId}
                          defaultTo={t.toMemberId}
                          defaultAmount={t.amount}
                          trigger={
                            <Button size="sm" variant="outline" className="flex-1">
                              Mark as settled
                            </Button>
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {settlements.length > 0 && (
        <section>
          <h2 className="mb-2.5 px-1 text-sm font-semibold">Settlement history</h2>
          <div className="space-y-2">
            {settlements.map((s, i) => {
              const from = memberById[s.from_member_id];
              const to = memberById[s.to_member_id];

              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 rounded-xl border bg-card px-3.5 py-3"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                      {from?.display_name ?? "Someone"}
                      <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                      {to?.display_name ?? "Someone"}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>{formatDate(s.created_at)}</span>
                      <Badge variant="secondary" className="h-4 px-1.5 text-[10px] capitalize">
                        {s.method}
                      </Badge>
                      {s.note && <span className="truncate">· {s.note}</span>}
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-semibold">{formatCurrency(Number(s.amount))}</p>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
