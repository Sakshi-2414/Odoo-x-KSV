# VendorBridge AI

VendorBridge AI is a procurement workflow app for RFQs, quotations, approvals, purchase orders, invoices, vendor scoring, and AI-assisted decision making.

This repository currently contains the Next.js application shell, typed domain models, Supabase helpers, and local seed/cleanup scripts used to bootstrap demo data.

## What is in the repo

- App Router structure for authentication, dashboard, vendor portal, and API routes.
- TypeScript models for procurement, vendor, quotation, invoice, RFQ, and AI data.
- Supabase clients for browser, server, and admin usage.
- Seed and cleanup scripts for populating demo data in Supabase.

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Supabase
- Zod
- Resend
- Gemini / AI integration hooks

## Prerequisites

- Node.js 18+ recommended
- npm
- A Supabase project

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file named `.env.local` and add the required variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3. Start the development server:

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Scripts

- `npm run dev` - start the Next.js development server
- `npm run build` - build the app for production
- `npm run start` - start the production server
- `npm run lint` - run ESLint
- `npm run seed:supabase` - seed demo procurement data into Supabase
- `npm run cleanup:supabase` - remove rows created by the seed script

## Seeding Demo Data

The seed script expects `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to be available in your local `.env.local` file.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Then run:

```bash
npm run seed:supabase
```

The seed script stores created IDs in `scripts/seed-ids.json` so reruns stay predictable. Use the cleanup script to remove the seeded rows.

```bash
npm run cleanup:supabase
```

## Project Structure

```text
app/          Next.js app routes and route groups
components/   UI components for dashboard, AI, vendors, and procurement flows
features/     Domain logic for AI and procurement workflows
hooks/        React hooks for approvals, RFQs, vendors, realtime, and AI copilot
lib/          Shared utilities and Supabase clients
scripts/      Seed and cleanup scripts for Supabase
services/     Service-layer modules for procurement objects
types/        TypeScript domain models
utils/        Formatting, validation, and generator helpers
```

## Notes

- The repository is set up around the VendorBridge AI procurement workflow described in `vendorbridge-ai-blueprint.md`.
- Local-generated files such as `.next`, `node_modules`, `.env.local`, and `scripts/seed-ids.json` are ignored.
- If you update the database schema, keep the corresponding files in `types/` and the seed script in sync.
