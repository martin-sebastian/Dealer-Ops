# Dealer Ops AppShell

Dealership operations shell with Sales, Service, AI Chat, and Print Center.
UI is [shadcn/ui](https://ui.shadcn.com) on Vite + React + TypeScript.

## Print Center (phase one)

Designer-first templates. Print goes through the PC’s installed printers as PDF. No ZPL.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` for named template sync and background uploads to the `print-images` bucket. The designer still saves locally when those are unset.

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — typecheck and production build
- `npm run lint` — ESLint
