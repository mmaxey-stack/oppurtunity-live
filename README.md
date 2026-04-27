# Oppurtunity

Oppurtunity is a clean, mobile-friendly web app that connects athletes and businesses through paid promotion deals.

## Core Product Areas

- Role-based dashboards for athletes and businesses
- Deal marketplace feed with offer actions
- Messaging center between users
- Notification inbox for activity updates
- Stripe billing for:
  - `$9/month` Basic
  - `$24.99/month` Pro
  - `$100` one-time onboarding call

## Tech Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Stripe Checkout API integration
- Supabase (Auth, Postgres, Realtime)

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env template:

```bash
cp .env.example .env.local
```

3. Add Supabase and Stripe values in `.env.local`.

4. Run dev server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Supabase Setup

1. Create a Supabase project.
2. In SQL editor, run `supabase/schema.sql`.
3. In Authentication settings, keep email/password auth enabled.
4. In Authentication URL config, add your local and production URLs.

## Stripe Configuration

Set these environment variables in `.env.local`:

- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_BASIC`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_ONBOARDING`

`/api/stripe/checkout` creates checkout sessions and redirects users to Stripe-hosted payment pages.

## Live Features Connected to Supabase

- Signup/login with email and password
- `users` role profiles (`athlete` or `business`)
- Businesses can create deals in marketplace
- Athletes can accept open deals
- Users can send messages to opposite-role users
- Notifications insert on deal accept/message send
- Notifications page updates in real time via Supabase Realtime
