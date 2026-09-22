# Adventure Trading Company — Project Guide

Personal blog site for writing short stories and dispatches set in the world of *Adventureland* — the Disney theme park locations, characters, and lore from Magic Kingdom and Disneyland.

## Stack

- **Next.js 16** App Router, TypeScript, Tailwind CSS v4
- **Prisma 7** with **Neon** serverless PostgreSQL
- **Auth.js v5** (NextAuth) with credentials provider
- **Tiptap 3** rich text editor (client-side only)
- **Vercel Blob** for image storage
- **Vercel Analytics**
- **Vercel** deployment (no cron)

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

- **Transmissions** (PROMPTED) — prompt-driven stories; admin picks a prompt from the bank when creating
- **Dispatches** (FREE) — free-form explorer's journal entries

## Transmission / Prompt Workflow

No cron or weekly timer. When creating a new post:
1. Choose type: **Dispatch** or **Transmission** via pill buttons
2. If Transmission: a prompt picker appears showing all available (unused) prompts first, then previously used ones
3. Selecting a prompt attaches it to the post and marks it used in the bank (atomically on save)
4. Type and prompt are immutable after the post is first saved

`Post.promptBankId` links directly to `PromptBank`. The legacy `Post.promptId → WeeklyPrompt` relation is preserved for any existing posts but not used for new ones.

## Post Bank

Prompts managed via `/admin/prompts`. No fixed size limit. Add prompts any time — they queue up for future Transmissions.

## Public Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage, 5 latest posts, filter by type |
| `/post/[slug]` | Single post view with prompt display |
| `/archive` | Month/year browsable archive |
| `/about` | "Meet the CEO" introduction page |
| `/tag/[tag]` | Tag-filtered post list |
| `/feed.xml` | RSS 2.0 feed |
| `/sitemap.xml` | Auto-generated sitemap |
| `/robots.txt` | SEO robots file |

## Admin Routes

| Route | Description |
|-------|-------------|
| `/admin` | Chart Room dashboard (stats, transmissions panel, drafts) |
| `/admin/posts` | All posts table |
| `/admin/post/new` | New post editor (type selector + prompt picker) |
| `/admin/post/[id]/edit` | Edit existing post |
| `/admin/about` | Find/create "Meet the CEO" post |
| `/admin/prompts` | Prompt bank manager |
| `/admin/change-password` | Change password |

## Database Schema

- **Post** — content, slug, type (PROMPTED/FREE), status, tags, views, `promptBankId` (FK to PromptBank for new Transmissions), `promptId` (legacy FK to WeeklyPrompt)
- **WeeklyPrompt** — legacy model, preserved for existing posts, no longer used for new ones
- **PromptBank** — pool of writing prompts; `usedAt` stamped when attached to a post
- **AdminCredentials** — single admin user, bcrypt-hashed

## Key Files

- `lib/config.ts` — SITE_URL, SITE_NAME, SITE_DESCRIPTION
- `lib/auth.ts` — Auth.js credentials provider
- `lib/db.ts` — Prisma + Neon adapter
- `proxy.ts` — Route protection for /admin/* (Node.js runtime)
- `components/PostEditor.tsx` — Rich text post editor with type toggle, prompt picker, auto-save
- `components/PromptPanel.tsx` — Transmissions dashboard panel (bank count + recent transmissions)
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
RESET_SECRET=           # Emergency password reset secret (keep offline)
BLOB_READ_WRITE_TOKEN=  # Vercel Blob token
```

## About/Portrait

- "Meet the CEO" post stored with slug `meet-the-admin`
- Cover image: `public/images/logo-big.jpg` (set directly on the post record)
- Portrait: `public/images/admin-portrait.png` — hardcoded in `/about` page, not in post content
- Admin persona: Chief Expeditionary Officer Arthur "Art" Bellweather

## Feed Ordering

`publishedAt` is stamped only on first publish and never updated on edits or republish. Feed and archive order is therefore stable — editing a post never moves it.

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
