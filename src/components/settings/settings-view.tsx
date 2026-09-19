"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ChevronLeft, SlidersHorizontal } from "lucide-react";
import { AccountIdentityCard } from "./account-identity-card";
import { AccountActionsCard } from "./account-actions-card";
import { PasswordForm } from "./password-form";

export function SettingsView({
  username,
  email,
  avatarUrl,
  hasUnsettledBalance,
}: {
  username: string;
  email: string;
  avatarUrl: string | null;
  hasUnsettledBalance: boolean;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b bg-background/85 px-5 backdrop-blur-xl">
        <Link
          href="/rooms"
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <Image src="/logo.svg" alt="Roomie" width={32} height={32} className="size-8 rounded-lg" />
        <span className="font-bold text-primary">Roomie</span>
        <span className="text-muted-foreground/50">/</span>
        <span className="font-semibold">Settings</span>
      </header>

      <main className="flex-1 px-5 pb-10 pt-5">
        <div className="mb-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-secondary-foreground">
            <SlidersHorizontal className="size-3" /> Preferences
          </span>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">Account Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your profile, password, and account security.</p>
        </div>

        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <AccountIdentityCard username={username} email={email} avatarUrl={avatarUrl} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <PasswordForm />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <AccountActionsCard hasUnsettledBalance={hasUnsettledBalance} />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
