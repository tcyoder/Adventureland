@AGENTS.md

# Tomorrowland Light & Power Co. — Project Guide

Personal blog site for writing short stories and dispatches set in the world of *New Tomorrowland 1994*.

## Stack

- **Next.js 16** App Router + TypeScript + Tailwind CSS v4
- **Prisma 7** with Neon serverless adapter (`@prisma/adapter-neon`) — generated client at `app/generated/prisma/`
- **Neon** PostgreSQL (production) via `DATABASE_URL` connection string
- **Auth.js v5** (`next-auth@beta`) with credentials provider, single admin user
- **Tiptap** rich text editor (client-side only, loaded via `next/dynamic`)
- **Vercel** deployment with cron job (live at `https://tomorrowlandlightandpowerco.vercel.app`)
- **pnpm** as package manager

## Key Architecture Notes

### Prisma 7 quirks
- Schema uses `provider = "prisma-client"` (not `prisma-client-js`) — no URL in `schema.prisma`
- DB URL lives in `prisma.config.ts` and `lib/db.ts`
- Client is generated to `app/generated/prisma/` (not `node_modules`)
- **Client components must NOT import runtime code from `@/app/generated/prisma/client`** — use `import type` only
- Enum values for client components come from `@/app/generated/prisma/enums`
- Database adapter: `PrismaNeon` from `@prisma/adapter-neon` — uses `DATABASE_URL` (Neon connection string)
- `prisma.config.ts` loads `.env.local` explicitly so migrations work locally
- `prisma.config.ts` is excluded from `tsconfig.json` (it's a config file, not app code)

### Auth
- `proxy.ts` (not `middleware.ts`) handles route protection in Next.js 16
- Proxy uses `auth()` from `lib/auth.ts` directly — Next.js 16 proxy runs in Node.js runtime (not Edge), so bcryptjs and Prisma work fine here
- `auth()` is used in proxy, Server Components, and API routes
- **After adding the `AdminCredentials` migration, always run `pnpm prisma generate`** — stale client causes silent runtime errors on login

### Meet the Admin page
- Lives at `/about` — always renders content regardless of post status (draft or published)
- Content is stored as a regular `Post` with slug `meet-the-admin`, type `FREE`
- `/admin/about` creates the post if it doesn't exist, then redirects to the standard post editor
- Publishing the post also adds it to the main Dispatch feed on the homepage
- Do not change the slug `meet-the-admin` — `/about` is hardcoded to look it up by that slug
- Official portrait of N. Litenment (Administrator) is at `public/images/admin-portrait.png` — hardcoded into the `/about` page template, not the post content, so it won't appear in the Dispatch feed

### Client components
- `PostEditor`, `PromptPanel`, `PromptBankManager`, `AdminDeletePost`, `AdminSignOut` are all `"use client"`
- Tiptap editor (`RichTextEditor`) is loaded with `ssr: false` to avoid hydration issues

## Project Structure

```
app/
  page.tsx                        # Public post list
  about/page.tsx                  # Meet the Admin page (reads from meet-the-admin post)
  post/[slug]/page.tsx            # Public single post
  login/page.tsx                  # Login form
  admin/
    layout.tsx                    # Admin shell (auth check + nav)
    page.tsx                      # Dashboard (stats, weekly prompt, recent drafts, about status)
    about/page.tsx                # Finds/creates meet-the-admin post, redirects to editor
    posts/page.tsx                # All posts table with filters
    post/new/page.tsx             # New post editor
    post/[id]/edit/page.tsx       # Edit post
    prompts/page.tsx              # Prompt bank manager
  api/
    auth/[...nextauth]/route.ts   # NextAuth handler
    posts/route.ts                # GET (list) / POST (create)
    posts/[id]/route.ts           # GET / PATCH / DELETE
    prompt-bank/route.ts          # GET / POST (add) / DELETE
    prompts/route.ts              # GET current week's prompt
    cron/generate-prompt/route.ts # GET (Vercel cron) / POST (admin manual trigger)
    upload/route.ts               # Image upload → Vercel Blob (returns CDN URL)

components/
  SiteHeader.tsx                  # Public site header
  PostCard.tsx                    # Post list card
  PostFilters.tsx                 # All / Transmissions / Dispatches filter
  PostTypeBadge.tsx               # Badge for PROMPTED vs FREE
  PostEditor.tsx                  # Full post editor (client)
  Editor/RichTextEditor.tsx       # Tiptap editor (no SSR)
  PromptPanel.tsx                 # Dashboard widget for weekly prompt
  PromptBankManager.tsx           # Add/view/remove prompts from bank
  AdminSignOut.tsx                # Sign out button
  AdminDeletePost.tsx             # Delete post with confirm
  SessionProvider.tsx             # NextAuth session wrapper

lib/
  auth.ts                         # Auth.js config
  db.ts                           # Prisma client (Neon serverless adapter)
  slugify.ts                      # Slug generation utility
```

## Prompt Bank System

Prompts are pre-written and stored in the `PromptBank` table. No AI API calls are made at runtime.

- Add prompts at `/admin/prompts` — paste multiple prompts separated by blank lines
- Each Monday, the Vercel cron job calls `/api/cron/generate-prompt` (GET, secured with `x-cron-secret` header)
- The cron picks the next unused prompt (by `sortOrder`, then `createdAt`) and assigns it to the current week
- Admin can manually assign the next prompt from the dashboard ("Assign This Week's Prompt" button)
- The `WeeklyPrompt` record links to the `PromptBank` entry via `promptBankId`

## Environment Variables

```env
DATABASE_URL="postgresql://..."     # Neon connection string (local dev + production)
NEXTAUTH_SECRET="random-string"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH="bcrypt-hash"   # node -e "require('bcryptjs').hash('pw',12).then(console.log)"
CRON_SECRET="random-string"         # sent as x-cron-secret header by Vercel cron
RESET_SECRET="random-string"        # guards /reset-password emergency page (keep offline/safe)
BLOB_READ_WRITE_TOKEN="..."         # Vercel Blob storage token (auto-provisioned via Vercel dashboard)
```

## Dev Credentials (local only)

- Username: `admin`
- Password: `tomorrowland1994`

Change `ADMIN_PASSWORD_HASH` before deploying.

## Common Commands

```bash
pnpm dev                       # Start dev server
pnpm prisma migrate dev        # Apply schema changes AND regenerates client (uses Neon via .env.local)
pnpm prisma generate           # Regenerate client after schema change — MUST run after migrate dev
pnpm prisma studio             # Browse/edit data in browser
```

## Repository

**GitHub:** https://github.com/tcyoder/Tomorrowland

## Progress

### Completed
- [x] Next.js 16 project scaffold with TypeScript + Tailwind CSS v4
- [x] Prisma 7 schema: `Post`, `WeeklyPrompt`, `PromptBank`
- [x] SQLite database with better-sqlite3 adapter (local dev, now replaced)
- [x] Auth.js v5 credentials login (`/login`)
- [x] Route protection via `proxy.ts` (Node.js runtime, uses `auth()` directly)
- [x] Public post list (`/`) with All / Transmissions / Dispatches filters
- [x] Public single post view (`/post/[slug]`) with prompt callout + prev/next nav
- [x] Admin layout with nav (Dashboard, All Posts, New Post, Prompt Bank)
- [x] Admin dashboard with stats, weekly prompt panel, recent drafts
- [x] Admin all-posts table with status/type filters and sort
- [x] Post editor with full Tiptap rich text (H1–H3, bold/italic/underline/strike, lists, blockquote, code, links, images, HR)
- [x] Auto-slug generation from title
- [x] Auto-save every 30 seconds while editing
- [x] Cover image upload via Vercel Blob (upload-only, no URL input)
- [x] Save as Draft / Publish / Unpublish / Delete actions
- [x] Prompt Bank: add/view/remove pre-written prompts
- [x] Cron endpoint draws from prompt bank (no AI API needed)
- [x] Manual "Assign This Week's Prompt" button in dashboard
- [x] Art deco retro-futuristic design (copper/navy palette, Josefin Sans display font)
- [x] Vercel cron config (`vercel.json`) — Mondays 1PM UTC
- [x] `.gitignore` updated (excludes `*.db`, `.env*`, `public/uploads/`, generated Prisma client)
- [x] Image uploads in Tiptap editor body via "Upload Img" toolbar button → Vercel Blob
- [x] Migrated from SQLite/better-sqlite3 to Neon PostgreSQL (`@prisma/adapter-neon`)
- [x] Deployed to Vercel production (https://tomorrowlandlightandpowerco.vercel.app) — now live at https://tomorrowlandlightandpower.co
- [x] DB-backed admin credentials (`AdminCredentials` table) — seeded from env vars on first login
- [x] Emergency password reset at `/reset-password` (gated by `RESET_SECRET` env var, timing-safe)
- [x] In-session password change at `/admin/change-password` (requires current password)
- [x] Pushed to GitHub (https://github.com/tcyoder/Tomorrowland)
- [x] Public header nav: "Meet the Admin" link replacing Stories/Posts filters
- [x] `/about` page — DB-backed, editable from admin dashboard, doubles as first Dispatch when published
- [x] Mobile optimizations: responsive header, touch targets, always-visible post CTAs, responsive typography
- [x] Official admin portrait (`public/images/admin-portrait.png`) on `/about` page — N. Litenment, Administrator; not included in Dispatch post content
- [x] Open Graph / Twitter Card meta tags — site-wide defaults in layout, per-post with cover image and excerpt
- [x] `/sitemap.xml` — all published posts + tag pages, auto-generated by Next.js App Router
- [x] `/robots.txt` — blocks admin/api, points to sitemap
- [x] `/feed.xml` — RSS 2.0 feed of latest 20 posts with cover image enclosures; auto-discovery link in `<head>`
- [x] Google Search Console verified and sitemap submitted
- [x] Tags (`String[]` on Post) — hidden from public UI, present in `<meta keywords>` and JSON-LD for SEO; default tags pre-filled on new posts; editable per post in admin editor
- [x] JSON-LD `BlogPosting` schema on every post page
- [x] Twitter/X, Reddit, and Bluesky share links on every post page
- [x] `/tag/[tag]` pages exist (linked from sitemap) but tags not shown in public UI
- [x] Post card CTA on homepage is type-aware: "Read Dispatch →" for FREE posts, "Read Transmission →" for PROMPTED posts
- [x] Custom domain `tomorrowlandlightandpower.co` via Cloudflare Registrar — DNS points to Vercel (A + CNAME, proxy off); all SITE_URL references updated
- [x] Homepage limited to 5 most recent posts (per active filter) with "View More →" link
- [x] `/archive` page — month-filtered post list with sticky left sidebar month/year nav; filter type carries through from homepage
- [x] Footer links: Bluesky profile, Contact email, RSS — centered under deco divider using equal-width grid
- [x] Bluesky share link on every post page (alongside Twitter/X and Reddit)
- [x] RSS link in site footer (`/feed.xml`)
- [x] Vercel Analytics installed (`@vercel/analytics`) — tracks page views site-wide
- [x] Post view counter — `views Int` on Post model, increments on each public page load; admin dashboard shows Top 5 Posts by Views widget
- [x] GitHub repo set to private
- [x] Google Search Console updated with new domain; sitemap resubmitted
- [x] Expanded default tags: added `retrofuturism`, `atompunk`, `raygun-gothic`, `atomic-age`, `short-fiction`, `speculative-fiction`, `worldbuilding`; backfilled to all existing posts

- [x] Buttondown email subscription link in footer (https://buttondown.com/xatencio) — Bluesky · Contact · Subscribe · RSS row on homepage and archive page

### Not Yet Built
- [ ] Email notification when weekly prompt is assigned (optional)
