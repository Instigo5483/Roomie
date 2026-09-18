"use client";

import { motion } from "motion/react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatTime } from "@/lib/utils";
import { getCategoryMeta } from "@/lib/expenses/categories";
import { deleteExpense } from "@/lib/actions/expenses";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Expense, ExpenseSplit, RoomMember } from "@/types/database";

export function ExpenseItem({
  expense,
  splits,
  members,
  currentMemberId,
  roomId,
  canDelete,
}: {
  expense: Expense;
  splits: ExpenseSplit[];
  members: RoomMember[];
  currentMemberId: string | null;
  roomId: string;
  canDelete: boolean;
}) {
  const payer = members.find((m) => m.id === expense.paid_by);
  const mySplit = splits.find((s) => s.room_member_id === currentMemberId);
  const paidByMe = expense.paid_by === currentMemberId;
  const categoryMeta = getCategoryMeta(expense.category);
  const time = formatTime(expense.expense_time);

  const handleDelete = async () => {
    const { error } = await deleteExpense(expense.id, roomId);
    if (error) toast.error(error);
    else toast.success("Expense deleted");
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-center gap-3 rounded-xl border bg-card px-3.5 py-3"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <categoryMeta.icon className="size-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{expense.title}</p>
        <p className="text-xs text-muted-foreground">
          {payer?.display_name ?? "Someone"} paid {formatCurrency(Number(expense.amount))}
          {time && <> · {time}</>}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2 text-right">
        <div>
          {mySplit ? (
            <p className={`text-sm font-semibold ${paidByMe ? "text-success" : "text-destructive"}`}>
              {paidByMe ? "+" : "-"}
              {formatCurrency(Math.abs(paidByMe ? Number(expense.amount) - Number(mySplit.share_amount) : Number(mySplit.share_amount)))}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Not split with you</p>
          )}
        </div>

        {canDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete expense"
              >
                <Trash2 className="size-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes &quot;{expense.title}&quot; and its splits for everyone in the room.
                  This can&apos;t be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </motion.div>
  );
}
