"use client";

import { motion } from "motion/react";
import { ArrowRight, Banknote, Landmark, Scale, Smartphone, Sparkles, Zap } from "lucide-react";
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
        <Card className="border-none bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-md">
          <CardContent className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">
                <span className="size-1.5 rounded-full bg-white" /> Net Balance
              </span>
            </div>

            <div>
              <p className="text-sm text-primary-foreground/85">
                {myBalance && myBalance.net > 0.01
                  ? "You are owed money overall"
                  : myBalance && myBalance.net < -0.01
                    ? "You owe money overall"
                    : "You're all settled up"}
              </p>
              <p className="mt-1 text-3xl font-bold tracking-tight">
                {myBalance && myBalance.net > 0.01 && "+"}
                {myBalance && myBalance.net < -0.01 && "-"}
                {myBalance ? formatCurrency(Math.abs(myBalance.net)) : formatCurrency(0)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl bg-black/15 p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/70">
                  You lent
                </p>
                <p className="text-base font-semibold">{formatCurrency(myBalance?.totalPaid ?? 0)}</p>
              </div>
              <div className="rounded-xl bg-black/15 p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/70">
                  You owe
                </p>
                <p className="text-base font-semibold">{formatCurrency(myBalance?.totalOwed ?? 0)}</p>
              </div>
            </div>

            <SettleUpDialog
              room={room}
              members={members}
              trigger={
                <Button className="w-full bg-white text-primary hover:bg-white/90" size="lg">
                  Settle up now
                </Button>
              }
            />
          </CardContent>
        </Card>
      </motion.div>

      <section>
        <div className="mb-2.5 flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold">Roommate balances</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {balances.length} total
          </span>
        </div>
        <div className="space-y-2">
          {balances.map((b, i) => {
            const isMe = b.memberId === currentMemberId;
            const statusLabel = !b.member.is_active
              ? "Settled up"
              : b.net > 0.01
                ? isMe
                  ? "Owed to you overall"
                  : "Owed money"
                : b.net < -0.01
                  ? "Owes money"
                  : "Settled up";
            return (
              <motion.div
                key={b.memberId}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  "flex items-center gap-3 rounded-xl border bg-card px-3.5 py-3",
                  !b.member.is_active && "opacity-60",
                )}
              >
                <Avatar className="size-9">
                  <AvatarFallback className="bg-muted text-sm">
                    {b.member.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                    {b.member.display_name}
                    {isMe && (
                      <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        You
                      </span>
                    )}
                    {!b.member.is_active && (
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Inactive
                      </span>
                    )}
                  </p>
                  <p
                    className={cn(
                      "text-xs font-medium",
                      b.net > 0.01 && b.member.is_active
                        ? "text-success"
                        : b.net < -0.01 && b.member.is_active
                          ? "text-destructive"
                          : "text-muted-foreground",
                    )}
                  >
                    {statusLabel}
                  </p>
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
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-2.5 flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold">Suggested settlements</h2>
          <SettleUpDialog room={room} members={members} trigger={<Button size="sm" variant="outline">Settle up</Button>} />
        </div>

        {transactions.length > 0 && (
          <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Optimized to {transactions.length} {transactions.length === 1 ? "transfer" : "transfers"} to clear all
            debts
          </div>
        )}

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
              const iAmRecipient = t.toMemberId === currentMemberId;

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
                        <span className={cn("font-medium", iAmPayer && "text-destructive")}>
                          {iAmPayer ? "You" : from?.display_name}
                        </span>
                        <ArrowRight className="size-4 text-muted-foreground" />
                        <span className={cn("font-medium", iAmRecipient && "text-success")}>
                          {iAmRecipient ? "You" : to?.display_name}
                        </span>
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
              const iPaid = s.from_member_id === currentMemberId;
              const iReceived = s.to_member_id === currentMemberId;
              const MethodIcon = s.method === "upi" ? Zap : s.method === "cash" ? Banknote : Landmark;

              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 rounded-xl border bg-card px-3.5 py-3"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <MethodIcon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                      {iPaid ? "You" : from?.display_name ?? "Someone"}
                      <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                      {iReceived ? "You" : to?.display_name ?? "Someone"}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>{formatDate(s.created_at)}</span>
                      <Badge variant="secondary" className="h-4 px-1.5 text-[10px] capitalize">
                        {s.method}
                      </Badge>
                      {s.note && <span className="truncate">· {s.note}</span>}
                    </div>
                  </div>
                  <p
                    className={cn(
                      "shrink-0 text-sm font-semibold",
                      iReceived ? "text-success" : iPaid ? "text-destructive" : "text-foreground",
                    )}
                  >
                    {iReceived ? "+" : iPaid ? "-" : ""}
                    {formatCurrency(Number(s.amount))}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
