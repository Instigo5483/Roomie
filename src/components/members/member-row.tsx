"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Loader2, Lock, MoreVertical, ShieldMinus, ShieldPlus, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { deactivateMember } from "@/lib/actions/settlements";
import { setMemberRole } from "@/lib/actions/rooms";
import { cn, formatCurrency } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  isViewerAdmin,
  canManage,
}: {
  member: RoomMember;
  net: number;
  roomId: string;
  isMe: boolean;
  isViewerAdmin: boolean;
  canManage: boolean;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [rolePending, startRoleTransition] = useTransition();
  const canDeactivate = Math.abs(net) <= 0.01;

  function handleDeactivate() {
    startTransition(async () => {
      const { error } = await deactivateMember(member.id, roomId);
      if (error) toast.error(error);
      else toast.success(`${member.display_name} removed from the room`);
      setConfirmOpen(false);
    });
  }

  function handleToggleAdmin() {
    const nextRole = member.role === "admin" ? "member" : "admin";
    startRoleTransition(async () => {
      const { error } = await setMemberRole(member.id, roomId, nextRole);
      if (error) toast.error(error);
      else
        toast.success(
          nextRole === "admin"
            ? `${member.display_name} is now an admin`
            : `${member.display_name} is no longer an admin`,
        );
    });
  }

  const showMenu = (canManage || isViewerAdmin) && member.is_active;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card px-3.5 py-3",
        !member.is_active && "opacity-50",
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="size-9">
          <AvatarFallback className="bg-muted text-sm">
            {member.display_name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-card",
            member.is_active ? "bg-success" : "bg-muted-foreground",
          )}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
          <span className={cn("truncate", !member.is_active && "text-muted-foreground line-through")}>
            {member.display_name}
          </span>
          {isMe && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
              You
            </span>
          )}
          {member.role === "admin" && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              Admin
            </Badge>
          )}
          {!member.is_active && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
              Inactive
            </span>
          )}
        </p>
        {!member.is_active ? (
          <p className="text-xs text-muted-foreground">History preserved</p>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-0.5">
        {!member.is_active ? (
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {formatCurrency(0)}
          </span>
        ) : (
          <>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {net > 0.01 ? "Gets back" : net < -0.01 ? "Owes" : "Settled"}
            </span>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-bold",
                net > 0.01
                  ? "bg-success/10 text-success"
                  : net < -0.01
                    ? "bg-destructive/10 text-destructive"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {net > 0.01 ? "+" : net < -0.01 ? "-" : ""}
              {formatCurrency(Math.abs(net))}
            </span>
          </>
        )}
      </div>

      {showMenu && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isViewerAdmin && (
                <DropdownMenuItem disabled={rolePending} onSelect={handleToggleAdmin}>
                  {rolePending ? (
                    <Loader2 className="animate-spin" />
                  ) : member.role === "admin" ? (
                    <ShieldMinus />
                  ) : (
                    <ShieldPlus />
                  )}
                  {member.role === "admin" ? "Remove admin" : "Make admin"}
                </DropdownMenuItem>
              )}
              {canManage && (
                <>
                  {isViewerAdmin && <DropdownMenuSeparator />}
                  <DropdownMenuItem variant="destructive" onSelect={() => setConfirmOpen(true)}>
                    <UserMinus /> Remove from room
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove {member.display_name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  They&apos;ll be marked inactive and won&apos;t be included in future expense splits. Their
                  expense history stays intact.
                </AlertDialogDescription>
              </AlertDialogHeader>

              {!canDeactivate && (
                <div className="flex flex-col gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <p className="flex items-start gap-2 font-medium">
                    <Lock className="mt-0.5 size-4 shrink-0" />
                    Can&apos;t remove yet — {member.display_name} currently{" "}
                    {net > 0 ? "gets back" : "owes"} {formatCurrency(Math.abs(net))}.
                  </p>
                  <Link
                    href={`/room/${roomId}/balances`}
                    className="self-start rounded-md bg-destructive px-2.5 py-1 text-xs font-medium text-destructive-foreground"
                  >
                    Go to settle up in Balances
                  </Link>
                </div>
              )}

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
