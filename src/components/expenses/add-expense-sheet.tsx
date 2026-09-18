"use client";

import { useActionState, useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { addExpense } from "@/lib/actions/expenses";
import type { ActionState } from "@/lib/actions/auth";
import { cn, currentTimeHHmm, formatCurrency } from "@/lib/utils";
import { splitEqually } from "@/lib/expenses/balances";
import { EXPENSE_CATEGORIES, getCategoryMeta, type ExpenseCategory } from "@/lib/expenses/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Room, RoomMember } from "@/types/database";

const initialState: ActionState = { error: null };
const todayIso = () => new Date().toISOString().slice(0, 10);

export function AddExpenseSheet({ room, members }: { room: Room; members: RoomMember[] }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("other");
  const [paidBy, setPaidBy] = useState(members[0]?.id ?? "");
  const [included, setIncluded] = useState<Set<string>>(new Set(members.map((m) => m.id)));
  const [manualMode, setManualMode] = useState(false);
  const [manualAmounts, setManualAmounts] = useState<Record<string, string>>({});

  const numericAmount = Number(amount) || 0;
  const includedIds = useMemo(() => members.filter((m) => included.has(m.id)), [members, included]);

  const equalShares = useMemo(
    () => splitEqually(numericAmount, includedIds.map((m) => m.id)),
    [numericAmount, includedIds],
  );

  const manualTotal = includedIds.reduce(
    (sum, m) => sum + (Number(manualAmounts[m.id]) || 0),
    0,
  );

  const [state, formAction, pending] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await addExpense(prev, formData);
    if (!result.error) {
      toast.success("Expense added");
      setOpen(false);
      setAmount("");
      setCategory("other");
      setManualAmounts({});
    }
    return result;
  }, initialState);

  function toggleMember(id: string) {
    setIncluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const manualMismatch = manualMode && Math.abs(manualTotal - numericAmount) > 0.01;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30 mx-auto flex w-full max-w-lg justify-end px-5">
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="pointer-events-auto h-14 w-14 rounded-full shadow-lg"
            aria-label="Add expense"
          >
            <Plus className="size-6" />
          </Button>
        </SheetTrigger>
      </div>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Add an expense</SheetTitle>
          <SheetDescription>Split it equally or set exact amounts per person.</SheetDescription>
        </SheetHeader>

        <form action={formAction} className="space-y-5 px-4 pb-6">
          <input type="hidden" name="roomId" value={room.id} />
          <input type="hidden" name="splitMode" value={manualMode ? "manual" : "equal"} />

          <div className="space-y-1.5">
            <Label htmlFor="title">What was it for?</Label>
            <Input id="title" name="title" placeholder="Groceries, cab, Zomato..." required maxLength={80} />
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select name="category" value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((value) => {
                  const meta = getCategoryMeta(value);
                  return (
                    <SelectItem key={value} value={value}>
                      <meta.icon className="size-4 text-muted-foreground" />
                      {meta.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="expenseDate">Date</Label>
              <Input id="expenseDate" name="expenseDate" type="date" defaultValue={todayIso()} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expenseTime">Time</Label>
              <Input id="expenseTime" name="expenseTime" type="time" defaultValue={currentTimeHHmm()} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Paid by</Label>
            <Select name="paidBy" value={paidBy} onValueChange={setPaidBy}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select who paid" />
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

          <div className="flex items-center justify-between rounded-lg border px-3.5 py-3">
            <div>
              <p className="text-sm font-medium">Manual split</p>
              <p className="text-xs text-muted-foreground">Set exact amounts instead of equal shares</p>
            </div>
            <Switch checked={manualMode} onCheckedChange={setManualMode} />
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label>Split with</Label>
              {manualMode && (
                <span
                  className={cn(
                    "text-xs font-medium",
                    manualMismatch ? "text-destructive" : "text-success",
                  )}
                >
                  {formatCurrency(manualTotal)} of {formatCurrency(numericAmount || 0)}
                </span>
              )}
            </div>

            <div className="space-y-2">
              {members.map((m) => {
                const isIncluded = included.has(m.id);
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
                      isIncluded ? "border-border bg-card" : "border-transparent bg-muted/50 opacity-60",
                    )}
                  >
                    <Checkbox
                      id={`member-${m.id}`}
                      name="includedMemberIds"
                      value={m.id}
                      checked={isIncluded}
                      onCheckedChange={() => toggleMember(m.id)}
                    />
                    <Label htmlFor={`member-${m.id}`} className="flex-1 cursor-pointer font-normal">
                      {m.display_name}
                    </Label>
                    {isIncluded && !manualMode && (
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(equalShares[m.id] ?? 0)}
                      </span>
                    )}
                    {isIncluded && manualMode && (
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        name={`manualAmount_${m.id}`}
                        className="h-8 w-24 text-right"
                        value={manualAmounts[m.id] ?? ""}
                        onChange={(e) =>
                          setManualAmounts((prev) => ({ ...prev, [m.id]: e.target.value }))
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <SheetFooter className="px-0">
            <Button type="submit" size="lg" className="w-full" disabled={pending || manualMismatch}>
              {pending && <Loader2 className="animate-spin" />}
              Add expense
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
