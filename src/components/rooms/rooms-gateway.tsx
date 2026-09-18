"use client";

import { motion } from "motion/react";
import { Copy, Home, LogOut } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "@/lib/actions/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RoomCard } from "./room-card";
import { CreateRoomDialog } from "./create-room-dialog";
import type { MyRoom } from "@/lib/data/rooms";

export function RoomsGateway({
  rooms,
  username,
  userEmail,
}: {
  rooms: MyRoom[];
  username: string;
  userEmail: string;
}) {
  const initial = username.charAt(0).toUpperCase() || "?";

  const copyUsername = async () => {
    await navigator.clipboard.writeText(username);
    toast.success("Username copied — share it so roommates can add you");
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pb-10">
      <header className="flex items-center justify-between py-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Roomie
          </p>
          <h1 className="text-xl font-semibold tracking-tight">Your rooms</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full">
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary">{initial}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
            <div className="px-2 pb-1.5 text-sm text-muted-foreground truncate">{userEmail}</div>
            <DropdownMenuItem onSelect={copyUsername}>
              <Copy /> Copy username (@{username})
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => {
                signOut();
              }}
            >
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {rooms.length > 0 ? (
        <div className="flex flex-col gap-3">
          {rooms.map((r, i) => (
            <motion.div
              key={r.room.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <RoomCard {...r} />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center"
        >
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
            <Home className="size-7 text-muted-foreground" />
          </div>
          <p className="font-medium">No rooms yet</p>
          <p className="max-w-[26ch] text-sm text-muted-foreground">
            Create a room and add roommates by their username.
          </p>
        </motion.div>
      )}

      <div className="mt-8">
        <CreateRoomDialog />
      </div>
    </main>
  );
}
