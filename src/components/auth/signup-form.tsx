"use client";

import { useActionState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { signUpWithPassword, type ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = { error: null };

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUpWithPassword, initialState);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" placeholder="Priya Sharma" autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            placeholder="priya_s"
            required
            minLength={3}
            maxLength={20}
            pattern="[a-z0-9_]{3,20}"
            autoComplete="username"
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
            }}
          />
          <p className="text-xs text-muted-foreground">
            This is what roommates use to add you to a room — lowercase letters, numbers, underscores.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" />
          <p className="text-xs text-muted-foreground">At least 6 characters.</p>
        </div>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </motion.div>
  );
}
