"use client";

import { useActionState, useState, type KeyboardEvent } from "react";
import { Building2, Check, Loader2, Plus, UserPlus, X } from "lucide-react";
import { createRoom } from "@/lib/actions/rooms";
import type { ActionState } from "@/lib/actions/auth";
import { normalizeUsername } from "@/lib/users/username";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const initialState: ActionState = { error: null };

export function CreateRoomSheet() {
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
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setUsernames([]);
          setDraft("");
        }
      }}
    >
      <SheetTrigger asChild>
        <Button size="sm">
          <Plus /> Create Room
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-3xl">
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-muted" />
        <SheetHeader>
          <SheetTitle>Create a room</SheetTitle>
          <SheetDescription>
            Set up a space for rent, bills, and expenses with your roommates.
          </SheetDescription>
        </SheetHeader>
        <form action={formAction} className="space-y-5 px-4 pb-6">
          <div className="space-y-1.5">
            <Label htmlFor="room-name">Room name</Label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="room-name"
                name="name"
                placeholder="e.g. Room 304, The Apartment"
                required
                maxLength={60}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="room-usernames">Add roommates by username</Label>
            <p className="text-xs text-muted-foreground">Optional — they&apos;ll be added right away.</p>
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-input bg-muted/40 px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring/50">
              {usernames.map((username) => (
                <Badge key={username} variant="secondary" className="gap-1 rounded-full pr-1">
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
              <div className="flex min-w-[8ch] flex-1 items-center gap-1.5">
                <span className="text-sm font-semibold text-muted-foreground">@</span>
                <input
                  id="room-usernames"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  onKeyDown={handleKeyDown}
                  placeholder={usernames.length === 0 ? "username" : "add another…"}
                  className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button
                type="button"
                onClick={addUsername}
                className="flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1.5 text-xs font-semibold text-secondary-foreground transition hover:bg-secondary/80 active:scale-95"
              >
                <UserPlus className="size-3.5" /> Add
              </button>
            </div>
            {usernames.map((u) => (
              <input key={u} type="hidden" name="usernames" value={u} />
            ))}
            <p className="text-xs text-muted-foreground">
              You can also add more roommates later from the room&apos;s Members tab.
            </p>
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <SheetFooter className="flex-row gap-2 px-0">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-[2]" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <Check />}
              Create &amp; enter room
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
