# Adventure Trading Company — Project Guide

Personal blog site for writing short stories and dispatches set in the world of *Adventureland* — the Disney theme park locations, characters, and lore from Magic Kingdom and Disneyland.

## Stack

- **Next.js 16** App Router, TypeScript, Tailwind CSS v4
- **Prisma 7** with **Neon** serverless PostgreSQL
- **Auth.js v5** (NextAuth) with credentials provider
- **Tiptap 3** rich text editor (client-side only)
- **Vercel Blob** for image storage
- **Vercel Analytics**
- **Vercel** deployment with cron job

## Theme

**Adventure Trading Company** — Dispatches and transmissions from the furthest reaches of the jungle, set in the world of Adventureland. Jungle Cruise, Pirates of the Caribbean, the Tiki Room, Swiss Family Treehouse, and more.

**Color palette:**
- Background: `#0d1a08` (jungle dark)
- Primary accent: `#c9a227` (adventure gold)
- Secondary accent: `#2d9c6e` (jade)
- Text: `#f0e6c8` (parchment)
- Card bg: `#1a2e10` (dark jungle)

**Fonts:** Cinzel (display/headings) · Lora (body)

## Content Types

- **Transmissions** (PROMPTED) — weekly writing prompt responses
- **Dispatches** (FREE) — free-form explorer's journal entries

## Post Bank

Uses 10 writing prompts at a time (not 25 like the Tomorrowland project).

## Public Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage, 5 latest posts, filter by type |
| `/post/[slug]` | Single post view with prompt display |
| `/archive` | Month/year browsable archive |
| `/about` | "Meet the Skipper" introduction page |
| `/tag/[tag]` | Tag-filtered post list |
| `/feed.xml` | RSS 2.0 feed |
| `/sitemap.xml` | Auto-generated sitemap |
| `/robots.txt` | SEO robots file |

## Admin Routes

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard (stats, prompt, drafts) |
| `/admin/posts` | All posts table |
| `/admin/post/new` | New post editor |
| `/admin/post/[id]/edit` | Edit existing post |
| `/admin/about` | Find/create "Meet the Skipper" post |
| `/admin/prompts` | Prompt bank manager |
| `/admin/change-password` | Change password |

## Database Schema

- **Post** — content, slug, type (PROMPTED/FREE), status, tags, views
- **WeeklyPrompt** — weekly writing brief linked to posts
- **PromptBank** — pre-written prompts, assigned weekly by cron
- **AdminCredentials** — single admin user, bcrypt-hashed

## Key Files

- `lib/config.ts` — SITE_URL, SITE_NAME, SITE_DESCRIPTION
- `lib/auth.ts` — Auth.js credentials provider
- `lib/db.ts` — Prisma + Neon adapter
- `proxy.ts` — Route protection for /admin/* (Node.js runtime)
- `components/PostEditor.tsx` — Rich text post editor with auto-save
- `components/PromptPanel.tsx` — Weekly prompt widget
- `components/PromptBankManager.tsx` — Add/delete prompts

## Prisma Notes

- Schema uses `provider = "prisma-client"` (custom provider, not standard js)
- Client generated to `app/generated/prisma/`
- Client components must import enums only from `@/app/generated/prisma/enums`
- Runtime client code must NOT be imported in browsers

## Environment Variables

```env
DATABASE_URL=           # Neon PostgreSQL connection string
NEXTAUTH_SECRET=        # Random 32+ char string
NEXTAUTH_URL=           # https://yourdomain.com (or http://localhost:3000)
ADMIN_USERNAME=         # e.g., admin
ADMIN_PASSWORD_HASH=    # bcrypt hash of password
CRON_SECRET=            # Secret for Vercel cron validation
RESET_SECRET=           # Emergency password reset secret (keep offline)
BLOB_READ_WRITE_TOKEN=  # Vercel Blob token
```

## Weekly Prompt Cron

- Vercel cron: `vercel.json` → Mondays at 1:00 PM UTC
- Endpoint: `/api/cron/generate-prompt` (GET with `x-cron-secret` header)
- Manual trigger: POST from admin dashboard

## About/Portrait

- "Meet the Skipper" post stored with slug `meet-the-admin`
- Portrait: `public/images/admin-portrait.png` — hardcoded in `/about` page, not in post content (won't appear in Dispatch feed)

## Dev Commands

```bash
pnpm dev                     # Dev server
pnpm build                   # Build (runs: prisma generate && next build)
pnpm prisma migrate dev      # Apply migrations + regenerate client
pnpm prisma generate         # Regenerate Prisma client
pnpm prisma studio           # Browser-based DB editor
```

## Default Dev Credentials

- Username: `admin`
- Password: (set via ADMIN_PASSWORD_HASH env var)
