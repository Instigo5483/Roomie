"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteRoom } from "@/lib/actions/rooms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function DeleteRoomSection({ roomId, roomName }: { roomId: string; roomName: string }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteRoom(roomId);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <Card className="border-destructive/30">
      <CardContent className="space-y-3 py-2">
        <div>
          <p className="text-sm font-medium text-destructive">Danger zone</p>
          <p className="text-xs text-muted-foreground">
            Permanently delete this room, its members, and all expense and settlement history.
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            setConfirmText("");
            setOpen(true);
          }}
        >
          <Trash2 /> Delete room
        </Button>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &quot;{roomName}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                This can&apos;t be undone. Every expense, split, and settlement in this room will be
                permanently deleted for all members.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-room-name">
                Type <span className="font-semibold">{roomName}</span> to confirm
              </Label>
              <Input
                id="confirm-room-name"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                autoComplete="off"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={confirmText !== roomName || pending}
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {pending && <Loader2 className="animate-spin" />}
                Delete forever
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
