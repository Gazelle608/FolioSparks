# FolioSparks

Serialized fiction that pays its authors directly.

## Stack
- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **Backend:** Node.js + Express + TypeScript
- **Database + Auth + Storage:** Supabase (Postgres)
- **Payments:** Stripe (subscriptions only — donations go direct to authors)
- **TTS:** Google Cloud TTS (Spark Pro audio downloads)

## Setup

```bash
# 1. Install
npm install

# 2. Copy env
cp .env.example .env

# 3. Link Supabase
supabase link --project-ref <your-ref>

# 4. Push migrations
npm run db:push

# 5. Generate TS types
npm run db:types

# 6. Run
npm run dev