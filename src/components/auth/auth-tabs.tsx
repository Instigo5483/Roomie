"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function AuthTabs() {
  const pathname = usePathname();
  const isSignup = pathname === "/signup";

  const tabs = [
    { href: "/login", label: "Log in", active: !isSignup },
    { href: "/signup", label: "Create account", active: isSignup },
  ];

  return (
    <div className="mb-6 flex items-center rounded-2xl bg-muted p-1">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "relative flex-1 rounded-xl py-2 text-center text-sm font-semibold transition-colors",
            tab.active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.active && (
            <motion.div
              layoutId="auth-tab-glider"
              className="absolute inset-0 rounded-xl bg-card shadow-sm"
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </Link>
      ))}
    </div>
  );
}
