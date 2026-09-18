"use client";

import { useActionState, useState, type KeyboardEvent } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { createRoom } from "@/lib/actions/rooms";
import type { ActionState } from "@/lib/actions/auth";
import { normalizeUsername } from "@/lib/users/username";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const initialState: ActionState = { error: null };

export function CreateRoomDialog() {
  const [open, setOpen] = useState(false);
  const [usernames, setUsernames] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [state, formAction, pending] = useActionState(createRoom, initialState);

  function addUsername() {
    const normalized = normalizeUsername(draft);
    if (normalized && !usernames.includes(normalized)) {
      setUsernames((prev) => [...prev, normalized]);
    }
    setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addUsername();
    } else if (e.key === "Backspace" && draft === "" && usernames.length > 0) {
      setUsernames((prev) => prev.slice(0, -1));
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setUsernames([]);
          setDraft("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          <Plus /> Create a room
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a room</DialogTitle>
          <DialogDescription>
            Add roommates by their username — they&apos;ll be added right away.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="room-name">Room name</Label>
            <Input id="room-name" name="name" placeholder="e.g. Room 304, The Apartment" required maxLength={60} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="room-usernames">Add roommates (optional)</Label>
            <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring/50">
              {usernames.map((username) => (
                <Badge key={username} variant="secondary" className="gap-1 pr-1">
                  @{username}
                  <button
                    type="button"
                    onClick={() => setUsernames((prev) => prev.filter((u) => u !== username))}
                    className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                    aria-label={`Remove @${username}`}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
              <input
                id="room-usernames"
                value={draft}
                onChange={(e) => setDraft(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                onKeyDown={handleKeyDown}
                onBlur={addUsername}
                placeholder={usernames.length === 0 ? "username, then Enter" : "Add another…"}
                className="min-w-[8ch] flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            {usernames.map((u) => (
              <input key={u} type="hidden" name="usernames" value={u} />
            ))}
            <p className="text-xs text-muted-foreground">
              You can also add more roommates later from the room&apos;s Members tab.
            </p>
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending && <Loader2 className="animate-spin" />}
              Create room
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
