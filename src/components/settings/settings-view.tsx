"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ChevronLeft } from "lucide-react";
import { UsernameForm } from "./username-form";
import { PasswordForm } from "./password-form";

export function SettingsView({ username, email }: { username: string; email: string }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pb-10">
      <header className="flex items-center gap-2 py-6">
        <Link
          href="/rooms"
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
      </header>

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className="mb-1.5 px-1 text-xs text-muted-foreground">Signed in as {email}</p>
          <UsernameForm currentUsername={username} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <PasswordForm />
        </motion.div>
      </div>
    </main>
  );
}
