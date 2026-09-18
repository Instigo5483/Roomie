import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "Log in — Roomie" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to see your rooms and split expenses with your roommates."
    >
      <LoginForm />
    </AuthShell>
  );
}
