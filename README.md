# Roomie — Roommate Share Expenses

A mobile-first Next.js app for splitting shared room expenses across multiple, fully-isolated rooms. Open to anyone — sign up with any email and pick a username, create a room, and add roommates directly by their username. Add expenses with dynamic equal/manual splits, track a live balance ledger, and settle up with a debt-minimizing algorithm and one-tap UPI payment links.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** + hand-authored shadcn/ui-style components (Radix primitives)
- **Motion** (`motion/react`) for animation
- **Drizzle ORM** + **Neon Postgres** (serverless HTTP driver)
- **Auth.js v5** (Credentials — email + password)

## Local setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Postgres database.** Any Postgres works, but this app is tuned for [Neon](https://neon.tech) (free tier, serverless HTTP driver, and the same database Vercel's own Postgres offering uses under the hood):
   - Create a free project at neon.tech, or add "Postgres" from the Storage tab in your Vercel project (Marketplace → Neon).
   - Copy the pooled connection string.

3. **Copy the env file and fill it in:**
   ```bash
   cp .env.local.example .env.local
   ```
   - `DATABASE_URL` — your Neon connection string.
   - `AUTH_SECRET` — generate with `npx auth secret`.
   - `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` for local dev.

4. **Push the schema to your database:**
   ```bash
   npm run db:push
   ```

5. **Run the app:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## How authorization works (no RLS)

This app doesn't use Postgres Row-Level Security — Neon's plain connection doesn't carry a per-request user identity the way Supabase's does. Instead, every server action and data-fetching function that touches room data explicitly checks the caller's session and room membership before reading or writing (see `src/lib/auth/session.ts`'s `requireActiveMembership`). If you add a new query or action, make sure to call it.

## Deploying

Deploy to Vercel as a normal Next.js app (`vercel deploy` or connect the repo in the dashboard), and set the same environment variables from `.env.local` in the Vercel project settings. If you provisioned Postgres via Vercel's Neon integration, `DATABASE_URL` is usually wired up for you automatically.

## Useful scripts

- `npm run db:push` — sync the Drizzle schema to your database (good for local dev/prototyping).
- `npm run db:generate` / `npm run db:migrate` — generate and run versioned SQL migrations (preferred for production once the schema stabilizes).
- `npm run db:studio` — browse your database with Drizzle Studio.
