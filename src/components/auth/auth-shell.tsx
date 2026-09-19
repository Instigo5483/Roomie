import type { ReactNode } from "react";
import Image from "next/image";
import { Zap } from "lucide-react";
import { AuthTabs } from "./auth-tabs";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-5 flex items-center gap-2.5">
          <Image src="/logo.svg" alt="Roomie" width={40} height={40} className="size-10 rounded-xl" />
          <div>
            <p className="text-lg font-extrabold tracking-tight">Roomie</p>
            <p className="-mt-1 text-xs font-medium text-muted-foreground">Cozy living made simple</p>
          </div>
        </div>

        <div className="mb-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Zap className="size-3 text-primary" /> Shared living hub
          </span>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground text-balance">{subtitle}</p>
        </div>

        <AuthTabs />
        {children}
      </div>
    </main>
  );
}
