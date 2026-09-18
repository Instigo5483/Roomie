"use client";

import { useActionState, useRef } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { addRoomMember } from "@/lib/actions/rooms";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const initialState: ActionState = { error: null };

export function AddMemberForm({ roomId }: { roomId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await addRoomMember(prev, formData);
    if (!result.error) {
      toast.success("Roommate added");
      formRef.current?.reset();
    }
    return result;
  }, initialState);

  return (
    <Card>
      <CardContent className="space-y-3 py-2">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <UserPlus className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Add a roommate</p>
            <p className="text-xs text-muted-foreground">Enter their username to add them instantly.</p>
          </div>
        </div>
        <form ref={formRef} action={formAction} className="flex items-end gap-2">
          <input type="hidden" name="roomId" value={roomId} />
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="add-username" className="sr-only">
              Username
            </Label>
            <Input
              id="add-username"
              name="username"
              placeholder="username"
              required
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
              }}
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            Add
          </Button>
        </form>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      </CardContent>
    </Card>
  );
}
