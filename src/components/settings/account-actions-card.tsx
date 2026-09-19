"use client";

import { useState, useTransition } from "react";
import { ChevronRight, Laptop2, Loader2, TriangleAlert, UserX } from "lucide-react";
import { toast } from "sonner";
import { deleteAccount, signOutAllDevices } from "@/lib/actions/account";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export function AccountActionsCard({ hasUnsettledBalance }: { hasUnsettledBalance: boolean }) {
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [signOutPending, startSignOut] = useTransition();
  const [deletePending, startDelete] = useTransition();

  function handleSignOutAll() {
    startSignOut(async () => {
      const result = await signOutAllDevices();
      if (result?.error) {
        toast.error(result.error);
        setSignOutOpen(false);
      }
    });
  }

  function handleDeleteAccount() {
    startDelete(async () => {
      const result = await deleteAccount();
      if (result?.error) {
        toast.error(result.error);
        setDeleteOpen(false);
      }
    });
  }

  return (
    <Card className="border-destructive/30 bg-muted/30">
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <TriangleAlert className="size-5 text-destructive" />
          <p className="font-semibold">Account Actions</p>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setSignOutOpen(true)}
            className="flex w-full items-center justify-between rounded-lg bg-card px-3.5 py-3 shadow-sm transition active:scale-[0.98]"
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <Laptop2 className="size-4 text-muted-foreground" /> Sign Out of All Devices
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>

          <button
            type="button"
            onClick={() => {
              setConfirmText("");
              setDeleteOpen(true);
            }}
            className="flex w-full items-center justify-between rounded-lg bg-card px-3.5 py-3 text-destructive shadow-sm transition active:scale-[0.98]"
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <UserX className="size-4" /> Delete Account Permanently
            </span>
            <Badge variant="destructive" className="rounded text-[10px] uppercase">
              Destructive
            </Badge>
          </button>
        </div>
      </CardContent>

      <AlertDialog open={signOutOpen} onOpenChange={setSignOutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out of all devices?</AlertDialogTitle>
            <AlertDialogDescription>
              This immediately ends every active session on every device — including this one.
              You&apos;ll need to log in again everywhere.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={signOutPending} onClick={handleSignOutAll}>
              {signOutPending && <Loader2 className="animate-spin" />}
              Sign out everywhere
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This can&apos;t be undone. Your email, username, and password are erased, you&apos;re
              removed from every room, and any room where you&apos;re the only member gets deleted
              too.
              {hasUnsettledBalance && (
                <span className="mt-2 block font-medium text-destructive">
                  You currently have unsettled balances in at least one room — that history will
                  remain visible to your roommates after you&apos;re gone.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-delete-account">
              Type <span className="font-semibold">DELETE</span> to confirm
            </Label>
            <Input
              id="confirm-delete-account"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoComplete="off"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={confirmText !== "DELETE" || deletePending}
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePending && <Loader2 className="animate-spin" />}
              Delete forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
