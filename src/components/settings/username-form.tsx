"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateUsername } from "@/lib/actions/account";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: ActionState = { error: null };

export function UsernameForm({ currentUsername }: { currentUsername: string }) {
  const [state, formAction, pending] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await updateUsername(prev, formData);
    if (!result.error) toast.success("Username updated");
    return result;
  }, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Username</CardTitle>
        <CardDescription>What roommates use to add you to a room.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <form action={formAction} className="flex items-end gap-2">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="username" className="sr-only">
              Username
            </Label>
            <Input
              id="username"
              name="username"
              defaultValue={currentUsername}
              required
              minLength={3}
              maxLength={20}
              pattern="[a-z0-9_]{3,20}"
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
              }}
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            Save
          </Button>
        </form>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      </CardContent>
    </Card>
  );
}
