"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CheckCircle2, ChevronRight, Star, TrendingDown, Users } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { MyRoom } from "@/lib/data/rooms";

const TILE_COLORS = [
  "bg-[#91f4e7] text-[#00201d]",
  "bg-[#f1e0ce] text-[#231a0f]",
  "bg-[#e9e1d9] text-[#1e1b16]",
];

function tileColor(roomId: string) {
  const index = roomId.charCodeAt(0) % TILE_COLORS.length;
  return TILE_COLORS[index];
}

export function RoomCard({ room, role, memberCount, netBalance }: MyRoom) {
  const isSettled = Math.abs(netBalance) <= 0.01;
  const isOwed = netBalance > 0.01;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Link href={`/room/${room.id}`}>
        <Card className="group border-none py-4 shadow-sm transition-all duration-200 hover:shadow-md">
          <CardContent className="space-y-3 px-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-xl text-base font-bold shadow-sm",
                    tileColor(room.id),
                  )}
                >
                  {room.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold leading-tight">{room.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="size-3.5" />
                    {memberCount} {memberCount === 1 ? "roommate" : "roommates"}
                  </p>
                </div>
              </div>

              {role === "admin" ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold text-secondary-foreground">
                  <Star className="size-3 fill-current" /> Admin
                </span>
              ) : (
                <span className="inline-flex shrink-0 items-center rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                  Member
                </span>
              )}
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <span
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium",
                  isSettled ? "text-muted-foreground" : isOwed ? "text-success" : "text-destructive",
                )}
              >
                {isSettled ? (
                  <CheckCircle2 className="size-4" />
                ) : isOwed ? (
                  <TrendingDown className="size-4 rotate-180" />
                ) : (
                  <TrendingDown className="size-4" />
                )}
                {isSettled
                  ? "No pending dues"
                  : isOwed
                    ? `You are owed ${formatCurrency(netBalance)}`
                    : `You owe ${formatCurrency(Math.abs(netBalance))}`}
              </span>
              <motion.div whileHover={{ x: 3 }} transition={{ duration: 0.15 }}>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
