# JAMB Verify

Instant NIN verification for JAMB registration with wallet funding via Paystack and receipts ready for UTME profile creation.

## Core workflow
- Candidates create an account and fund a wallet.
- ₦500 is deducted per NIN verification and checked against NIMC (YouVerify).
- Failed verifications auto-refund the wallet.
- Receipts are downloadable and NINs are masked in history.

## Tech stack
- Next.js App Router
- Neon Postgres + Drizzle ORM
- Paystack Inline + webhook verification
- YouVerify NIN verification
- Tailwind + shadcn-style UI + Framer Motion

## Local setup
1. Install dependencies
2. Copy `.env.example` to `.env.local` and fill values.
3. Run database migrations (optional): `npm run db:generate` then `npm run db:migrate`.
4. Start dev server: `npm run dev`

## Notes
- Wallet amounts are stored in kobo.
- NINs are never stored in full; only masked values appear in history.
- Webhooks must be configured in Paystack to point to `/api/paystack/webhook`.
