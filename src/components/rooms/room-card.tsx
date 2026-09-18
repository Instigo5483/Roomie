"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ChevronRight, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MyRoom } from "@/lib/data/rooms";

export function RoomCard({ room, role, memberCount }: MyRoom) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Link href={`/room/${room.id}`}>
        <Card className="transition-all duration-200 hover:border-primary/40 hover:bg-accent/40 hover:shadow-md">
          <CardContent className="flex items-center gap-4 py-1">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold tracking-wide text-primary">
              {room.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{room.name}</p>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="size-3" /> {memberCount} member{memberCount === 1 ? "" : "s"}
                </span>
                {role === "admin" && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    Admin
                  </Badge>
                )}
              </div>
            </div>
            <motion.div whileHover={{ x: 3 }} transition={{ duration: 0.15 }}>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
            </motion.div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
