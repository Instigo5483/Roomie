"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Receipt, Scale, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav({ roomId }: { roomId: string }) {
  const pathname = usePathname();
  const base = `/room/${roomId}`;

  const tabs = [
    { href: base, label: "Expenses", icon: Receipt, match: pathname === base },
    {
      href: `${base}/balances`,
      label: "Balances",
      icon: Scale,
      match: pathname === `${base}/balances`,
    },
    {
      href: `${base}/members`,
      label: "Members",
      icon: Users,
      match: pathname === `${base}/members`,
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-lg border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="group relative flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors"
          >
            {tab.match && (
              <motion.div
                layoutId="bottom-nav-indicator"
                className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
            <tab.icon
              className={cn(
                "size-5 transition-transform duration-150 group-hover:scale-110",
                tab.match ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
              )}
            />
            <span
              className={cn(
                "transition-colors",
                tab.match ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
              )}
            >
              {tab.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
