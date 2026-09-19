"use client";

import { useActionState, useMemo, useRef, useState, type ComponentProps } from "react";
import { Check, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { updatePassword } from "@/lib/actions/account";
import type { ActionState } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: ActionState = { error: null };

function PasswordInput({ className, ...props }: ComponentProps<"input">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className={cn("pr-10", className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

const RULES = [
  { key: "length", label: "Min 8 characters", test: (v: string) => v.length >= 8 },
  { key: "number", label: "At least 1 number", test: (v: string) => /\d/.test(v) },
  { key: "special", label: "1 special symbol", test: (v: string) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
  { key: "upper", label: "Capital letter", test: (v: string) => /[A-Z]/.test(v) },
];

export function PasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [state, formAction, pending] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await updatePassword(prev, formData);
    if (!result.error) {
      toast.success("Password updated");
      formRef.current?.reset();
      setNewPassword("");
      setConfirmPassword("");
    }
    return result;
  }, initialState);

  const passedRules = RULES.filter((r) => r.test(newPassword)).length;
  const strength =
    newPassword.length === 0
      ? null
      : passedRules <= 1
        ? { label: "Weak", pct: 25, color: "bg-destructive", text: "text-destructive" }
        : passedRules <= 3
          ? { label: "Good", pct: 65, color: "bg-accent-foreground/70", text: "text-accent-foreground" }
          : { label: "Strong", pct: 100, color: "bg-success", text: "text-success" };

  const passwordsMatch = useMemo(
    () => confirmPassword.length > 0 && newPassword === confirmPassword,
    [newPassword, confirmPassword],
  );

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <ShieldCheck className="size-5 text-primary" />
        <div>
          <CardTitle className="text-base">Security &amp; Login</CardTitle>
          <CardDescription>Change the password you log in with.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current password</Label>
            <PasswordInput
              id="currentPassword"
              name="currentPassword"
              required
              autoComplete="current-password"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <PasswordInput
              id="newPassword"
              name="newPassword"
              required
              minLength={8}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            {strength && (
              <div className="space-y-1.5 pt-0.5">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-all duration-300", strength.color)}
                    style={{ width: `${strength.pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Strength:</span>
                  <span className={cn("font-medium", strength.text)}>{strength.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {RULES.map((rule) => {
                    const passed = rule.test(newPassword);
                    return (
                      <span
                        key={rule.key}
                        className={cn(
                          "flex items-center gap-1 text-xs",
                          passed ? "text-primary" : "text-muted-foreground",
                        )}
                      >
                        {passed ? (
                          <Check className="size-3.5" />
                        ) : (
                          <span className="size-1.5 rounded-full border border-current" />
                        )}
                        {rule.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {passwordsMatch && (
              <p className="flex items-center gap-1 text-xs font-medium text-primary">
                <CheckCircle2 className="size-3.5" /> Passwords match
              </p>
            )}
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <KeyRound />}
            Update password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
