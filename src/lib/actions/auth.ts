"use server";

import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut as authSignOut } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { isValidUsername, normalizeUsername } from "@/lib/users/username";

export type ActionState = { error: string | null };

export async function signUpWithPassword(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();

  if (!email || !password || !username) {
    return { error: "Email, username, and password are required." };
  }
  if (!isValidUsername(username)) {
    return {
      error: "Username must be 3-20 characters: lowercase letters, numbers, or underscores.",
    };
  }
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const existingEmail = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existingEmail) return { error: "An account with this email already exists." };

  const existingUsername = await db.query.users.findFirst({
    where: eq(users.username, username),
  });
  if (existingUsername) return { error: "That username is already taken." };

  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(users).values({
    email,
    username,
    password_hash: passwordHash,
    full_name: fullName || null,
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/rooms" });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Account created, but sign-in failed. Try logging in." };
    throw error;
  }

  return { error: null };
}

export async function signInWithPassword(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Email and password are required." };

  try {
    await signIn("credentials", { email, password, redirectTo: "/rooms" });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Incorrect email or password." };
    throw error;
  }

  return { error: null };
}

export async function signOut() {
  await authSignOut({ redirect: false });
  redirect("/login");
}
