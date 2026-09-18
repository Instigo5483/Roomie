import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "Sign up — Roomie" };

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="One account, as many rooms as you like. Any email works — no institution required."
    >
      <SignupForm />
    </AuthShell>
  );
}
