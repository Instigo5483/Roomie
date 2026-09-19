"use client";

import { useActionState, useState, type ReactNode } from "react";
import { Banknote, Landmark, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { recordSettlement } from "@/lib/actions/settlements";
import type { ActionState } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Room, RoomMember } from "@/types/database";

const initialState: ActionState = { error: null };

export function SettleUpDialog({
  room,
  members,
  trigger,
  defaultFrom,
  defaultTo,
  defaultAmount,
}: {
  room: Room;
  members: RoomMember[];
  trigger: ReactNode;
  defaultFrom?: string;
  defaultTo?: string;
  defaultAmount?: number;
}) {
  const [open, setOpen] = useState(false);
  const [fromMemberId, setFromMemberId] = useState(defaultFrom ?? "");
  const [toMemberId, setToMemberId] = useState(defaultTo ?? "");
  const [method, setMethod] = useState("cash");

  const [state, formAction, pending] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await recordSettlement(prev, formData);
    if (!result.error) {
      toast.success("Settlement recorded");
      setOpen(false);
    }
    return result;
  }, initialState);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setFromMemberId(defaultFrom ?? "");
          setToMemberId(defaultTo ?? "");
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record a settlement</DialogTitle>
          <DialogDescription>
            Log a cash or digital payment between two members to update balances.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="roomId" value={room.id} />

          <div className="space-y-1.5">
            <Label>Paid by</Label>
            <Select name="fromMemberId" value={fromMemberId} onValueChange={setFromMemberId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Who paid?" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Received by</Label>
            <Select name="toMemberId" value={toMemberId} onValueChange={setToMemberId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Who received it?" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="settle-amount">Amount (₹)</Label>
              <Input
                id="settle-amount"
                name="amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                required
                defaultValue={defaultAmount?.toFixed(2)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Method</Label>
              <input type="hidden" name="method" value={method} />
              <div className="grid h-9 grid-cols-3 gap-1 rounded-lg bg-muted p-1">
                {(
                  [
                    { value: "cash", label: "Cash", icon: Banknote },
                    { value: "upi", label: "UPI", icon: Zap },
                    { value: "other", label: "Other", icon: Landmark },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMethod(m.value)}
                    className={cn(
                      "flex items-center justify-center gap-1 rounded-md text-xs font-medium transition-colors",
                      method === m.value
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <m.icon className="size-3.5" /> {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="settle-note">Note (optional)</Label>
            <Input id="settle-note" name="note" maxLength={100} placeholder="e.g. Paid via GPay" />
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending && <Loader2 className="animate-spin" />}
              Record settlement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
