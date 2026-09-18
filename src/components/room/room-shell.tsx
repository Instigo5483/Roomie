"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, Home } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "./bottom-nav";
import type { MyRoom } from "@/lib/data/rooms";
import type { Room, RoomMember } from "@/types/database";

export function RoomShell({
  room,
  membership,
  myRooms,
  children,
}: {
  room: Room;
  membership: RoomMember;
  myRooms: MyRoom[];
  children: ReactNode;
}) {
  const otherRooms = myRooms.filter((r) => r.room.id !== room.id);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <DropdownMenu>
          <DropdownMenuTrigger className="group flex min-w-0 items-center gap-1.5 rounded-md py-1 text-left outline-none">
            <p className="truncate text-sm font-semibold leading-tight transition-colors group-hover:text-primary">
              {room.name}
            </p>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-y-0.5 group-data-[state=open]:rotate-180" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>Switch room</DropdownMenuLabel>
            {otherRooms.length > 0 ? (
              otherRooms.map((r) => (
                <DropdownMenuItem key={r.room.id} asChild>
                  <Link href={`/room/${r.room.id}`}>
                    <Home /> {r.room.name}
                  </Link>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">No other rooms</div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/rooms">
                <Home /> All rooms
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {membership.role === "admin" && (
          <Badge variant="secondary" className="shrink-0">
            Admin
          </Badge>
        )}
      </header>

      <main className="flex-1 px-4 pb-24 pt-4">{children}</main>

      <BottomNav roomId={room.id} />
    </div>
  );
}
