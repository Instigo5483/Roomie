"use client";

import { useActionState, useState } from "react";
import { motion } from "motion/react";
import { Check, Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { signUpWithPassword, type ActionState } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = { error: null };

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUpWithPassword, initialState);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const usernameValid = username.length >= 3 && username.length <= 20;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="fullName">Full name</Label>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              Optional
            </span>
          </div>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="fullName" name="fullName" placeholder="Priya Sharma" autoComplete="name" className="pl-9" />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="username">
              Username <span className="text-destructive">*</span>
            </Label>
            {username.length > 0 && (
              <span
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  usernameValid ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
                )}
              >
                {usernameValid && <Check className="size-2.5" />}
                {usernameValid ? "Valid format" : "3–20 chars"}
              </span>
            )}
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              @
            </span>
            <Input
              id="username"
              name="username"
              placeholder="priya_s"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-z0-9_]{3,20}"
              autoComplete="username"
              className="pl-7"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Roommates use this to find and add you — lowercase letters, numbers, underscores.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="pl-9"
            />
          </div>
          <p className="text-xs text-muted-foreground">Any personal or work email — no institution required.</p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">
              Password <span className="text-destructive">*</span>
            </Label>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                password.length === 0
                  ? "bg-muted text-muted-foreground"
                  : password.length < 6
                    ? "bg-accent text-accent-foreground"
                    : "bg-success/10 text-success",
              )}
            >
              {password.length === 0
                ? "Min 6 characters"
                : password.length < 6
                  ? `${password.length}/6 chars`
                  : "Meets requirement"}
            </span>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete="new-password"
              className="pl-9 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                password.length === 0
                  ? "w-0"
                  : password.length < 6
                    ? "w-[45%] bg-accent-foreground/60"
                    : "w-full bg-success",
              )}
            />
          </div>
        </div>

        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          Create account
        </Button>
      </form>
    </motion.div>
  );
}
