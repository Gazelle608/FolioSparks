# FolioSparks

Serialized fiction that pays its authors directly.

## Stack

- **Frontend:** React + TypeScript + Vite + TailwindCSS (this repo — app code lives in `src/`)
- **Database + Auth + Storage:** Supabase (hosted — tables live in your Supabase project, accessed directly from the client)

This repo is frontend-only. There is no local server; the app talks straight to Supabase.

## Environment

There is exactly **one** env file: [`.env`](.env) in the project root, created from the committed template [`.env.example`](.env.example):

```bash
cp .env.example .env   # then fill in your Supabase values
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL (Project Settings → API) |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key — the app throws at startup without it |
| `VITE_API_URL` | optional | Base URL of a deployed API, only for audio streaming/generation and Stripe checkout |

Notes:

- Vite only reads env files from the project root, and only variables prefixed with `VITE_` reach the browser bundle.
- Never put service-role or secret keys here — everything in this file is shipped to the browser. Row Level Security in Supabase is what protects your data.

## Supabase tables used by the app

Tables: `audio_assets`, `authors`, `chapters`, `desk_invites`, `desk_members`, `desk_submissions`, `desks`, `donation_links`, `library_entries`, `memberships`, `poll_options`, `poll_votes`, `polls`, `profiles`, `reading_progress`, `spark_ledger`, `stories`

Views: `author_spark_totals`, `chapter_spark_totals`, `spark_balances`

Storage buckets: `covers`, `avatars`, `audio`

Schema changes are made in the Supabase dashboard (SQL editor); regenerate `src/types/database.ts` from there if you change the schema.

## Email verification (Resend)

Sign-up verification needs **no server code and no extra env vars** — Supabase Auth
sends the confirmation email itself, and delivers it through Resend via custom SMTP.
The Resend API key lives only in the Supabase dashboard (never in this repo, never
in the browser bundle).

**How the flow works (already built into the app):**

1. User signs up → `supabase.auth.signUp()` triggers a confirmation email
2. App routes them to `/verify-email` ("check your inbox", with a resend button)
3. User clicks the link → Supabase verifies → redirects to `/auth/callback?next=…`
4. Session lands → user is routed to onboarding / their dashboard

**One-time setup (dashboard + DNS, no code changes):**

1. **Resend** ([resend.com](https://resend.com)) — free plan is 3,000 emails/month, 100/day:
   - Add your domain (e.g. `foliosparks.com`) and add the DNS records it gives you
     (DKIM/SPF/DMARC) at your domain registrar; wait for the domain to show **Verified**
   - Create an **API key** (API Keys → Create API Key)
2. **Supabase dashboard** → your project → **Authentication → Sign In / Providers → Email**:
   - Toggle **Confirm email** ON
   - Enable **custom SMTP** and fill in:
     | Field | Value |
     | --- | --- |
     | SMTP Host | `smtp.resend.com` |
     | SMTP Port | `465` (SSL) — or `587` (STARTTLS) |
     | SMTP User | `resend` |
     | SMTP Password | your Resend API key (`re_…`) |
     | Sender Email | `no-reply@foliosparks.com` (must be on the verified domain) |
     | Sender Name | `FolioSparks` |
3. **Supabase dashboard** → **Authentication → URL Configuration**:
   - **Site URL:** `http://localhost:5173` in dev / your production URL in prod
   - **Redirect URLs:** add both:
     - `http://localhost:5173/auth/callback`
     - `https://foliosparks.com/auth/callback`

Without step 3, the confirmation link is rejected as a non-allowlisted redirect and
lands nowhere. Optional polish: **Authentication → Email Templates → Confirm signup**
can now be customized (custom templates require custom SMTP).

## Setup

```bash
# 1. Install
npm install

# 2. Check .env has your Supabase URL + anon key

# 3. Run
npm run dev

# 4. Test verification: sign up in the app, then click the link
#    that arrives at the email you used (check spam on first send)
```
