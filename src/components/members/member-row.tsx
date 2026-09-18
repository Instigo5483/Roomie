"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { Loader2, MoreVertical, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { deactivateMember } from "@/lib/actions/settlements";
import { cn, formatCurrency } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { RoomMember } from "@/types/database";

export function MemberRow({
  member,
  net,
  roomId,
  isMe,
  canManage,
}: {
  member: RoomMember;
  net: number;
  roomId: string;
  isMe: boolean;
  canManage: boolean;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const canDeactivate = Math.abs(net) <= 0.01;

  function handleDeactivate() {
    startTransition(async () => {
      const { error } = await deactivateMember(member.id, roomId);
      if (error) toast.error(error);
      else toast.success(`${member.display_name} removed from the room`);
      setConfirmOpen(false);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card px-3.5 py-3",
        !member.is_active && "opacity-50",
      )}
    >
      <Avatar className="size-9">
        <AvatarFallback className="bg-muted text-sm">
          {member.display_name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-sm font-medium">
          {member.display_name}
          {isMe && <span className="text-xs text-muted-foreground">(you)</span>}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          {member.role === "admin" && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              Admin
            </Badge>
          )}
          {!member.is_active ? (
            <span className="text-xs text-muted-foreground">Inactive</span>
          ) : (
            <span
              className={cn(
                "text-xs",
                net > 0.01 ? "text-success" : net < -0.01 ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {net > 0.01 ? "gets back " : net < -0.01 ? "owes " : "settled"}
              {Math.abs(net) > 0.01 && formatCurrency(Math.abs(net))}
            </span>
          )}
        </div>
      </div>

      {canManage && member.is_active && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                variant="destructive"
                disabled={!canDeactivate}
                onSelect={() => setConfirmOpen(true)}
              >
                <UserMinus /> Remove from room
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove {member.display_name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  {canDeactivate
                    ? "They'll be marked inactive and won't be included in future expense splits. Their expense history stays intact."
                    : "This member has a non-zero balance and can't be removed until they're settled up."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction disabled={!canDeactivate || pending} onClick={handleDeactivate}>
                  {pending && <Loader2 className="animate-spin" />}
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </motion.div>
  );
}
