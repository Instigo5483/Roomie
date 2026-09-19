"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Copy, Home, LogOut, Settings } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "@/lib/actions/auth";
import { getTimeOfDayGreeting } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RoomCard } from "./room-card";
import { CreateRoomSheet } from "./create-room-sheet";
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
  const greeting = getTimeOfDayGreeting();

  const copyUsername = async () => {
    await navigator.clipboard.writeText(username);
    toast.success("Username copied — share it so roommates can add you");
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b bg-background/85 px-5 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Roomie" width={32} height={32} className="size-8 rounded-lg" />
          <span className="font-bold text-primary">Roomie</span>
          <span className="text-muted-foreground/50">/</span>
          <span className="font-semibold">Rooms</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full transition-transform duration-150 hover:scale-105 active:scale-95">
              <Avatar>
                <AvatarImage src="/default-avatar.jpg" alt={username} />
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
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings /> Settings
              </Link>
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

      <main className="flex-1 px-5 pb-10 pt-5">
        <div className="mb-5 space-y-1">
          <span
            suppressHydrationWarning
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground"
          >
            👋 {greeting}
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">Your rooms</h1>
          <p className="text-sm text-muted-foreground">
            Pick a room to jump back in, or start something new.
          </p>
        </div>

        <div className="mb-5 flex items-center justify-between gap-2 rounded-xl bg-muted p-2.5">
          <div className="flex items-center gap-2 pl-1">
            <Home className="size-5 text-primary" />
            <span className="text-sm font-semibold">Rooms</span>
            <Badge variant="secondary" className="h-5 rounded-full px-2 text-[10px]">
              {rooms.length}
            </Badge>
          </div>
          <CreateRoomSheet />
        </div>

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
            className="flex flex-col items-center gap-3 rounded-2xl bg-card py-16 text-center shadow-sm"
          >
            <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
              <Home className="size-8 text-secondary-foreground" />
            </div>
            <p className="font-semibold">No rooms yet</p>
            <p className="max-w-[28ch] text-sm text-muted-foreground">
              You haven&apos;t joined or created any rooms. Create one to start splitting
              expenses with your roommates.
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
