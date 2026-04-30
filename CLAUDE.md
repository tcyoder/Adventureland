@AGENTS.md

# Tomorrowland Light & Power Co. — Project Guide

Personal blog site for writing short stories and dispatches set in the world of *New Tomorrowland 1994*.

## Stack

- **Next.js 16** App Router + TypeScript + Tailwind CSS v4
- **Prisma 7** with `better-sqlite3` adapter — generated client at `app/generated/prisma/`
- **Auth.js v5** (`next-auth@beta`) with credentials provider, single admin user
- **Tiptap** rich text editor (client-side only, loaded via `next/dynamic`)
- **Vercel** deployment with cron job

## Key Architecture Notes

### Prisma 7 quirks
- Schema uses `provider = "prisma-client"` (not `prisma-client-js`) — no URL in `schema.prisma`
- DB URL lives in `prisma.config.ts` and `lib/db.ts`
- Client is generated to `app/generated/prisma/` (not `node_modules`)
- **Client components must NOT import runtime code from `@/app/generated/prisma/client`** — use `import type` only
- Enum values for client components come from `@/app/generated/prisma/enums`
- Dev database: `./dev.db` (project root), configured via `DATABASE_URL=file:./dev.db`

### Auth
- `proxy.ts` (not `middleware.ts`) handles route protection in Next.js 16
- Proxy uses `getToken` from `next-auth/jwt` — not `auth()` — because proxy runs in Edge runtime (no bcryptjs)
- `auth()` from `lib/auth.ts` is used in Server Components and API routes only

### Client components
- `PostEditor`, `PromptPanel`, `PromptBankManager`, `AdminDeletePost`, `AdminSignOut` are all `"use client"`
- Tiptap editor (`RichTextEditor`) is loaded with `ssr: false` to avoid hydration issues

## Project Structure

```
app/
  page.tsx                        # Public post list
  post/[slug]/page.tsx            # Public single post
  login/page.tsx                  # Login form
  admin/
    layout.tsx                    # Admin shell (auth check + nav)
    page.tsx                      # Dashboard (stats, this week's prompt, recent drafts)
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
    upload/route.ts               # Image upload → public/uploads/

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
  db.ts                           # Prisma client (better-sqlite3 adapter)
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
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="random-string"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH="bcrypt-hash"   # node -e "require('bcryptjs').hash('pw',12).then(console.log)"
CRON_SECRET="random-string"         # sent as x-cron-secret header by Vercel cron
```

## Dev Credentials (local only)

- Username: `admin`
- Password: `tomorrowland1994`

Change `ADMIN_PASSWORD_HASH` before deploying.

## Common Commands

```bash
npm run dev                    # Start dev server
npx prisma migrate dev         # Apply schema changes
npx prisma generate            # Regenerate client after schema change
npx prisma studio              # Browse/edit data in browser
```

## Repository

**GitHub:** https://github.com/tcyoder/Tomorrowland

## Progress

### Completed
- [x] Next.js 16 project scaffold with TypeScript + Tailwind CSS v4
- [x] Prisma 7 schema: `Post`, `WeeklyPrompt`, `PromptBank`
- [x] SQLite database with better-sqlite3 adapter
- [x] Auth.js v5 credentials login (`/login`)
- [x] Route protection via `proxy.ts` (Edge-compatible JWT check)
- [x] Public post list (`/`) with All / Transmissions / Dispatches filters
- [x] Public single post view (`/post/[slug]`) with prompt callout + prev/next nav
- [x] Admin layout with nav (Dashboard, All Posts, New Post, Prompt Bank)
- [x] Admin dashboard with stats, weekly prompt panel, recent drafts
- [x] Admin all-posts table with status/type filters and sort
- [x] Post editor with full Tiptap rich text (H1–H3, bold/italic/underline/strike, lists, blockquote, code, links, images, HR)
- [x] Auto-slug generation from title
- [x] Auto-save every 30 seconds while editing
- [x] Cover image upload + URL input
- [x] Save as Draft / Publish / Unpublish / Delete actions
- [x] Prompt Bank: add/view/remove pre-written prompts
- [x] Cron endpoint draws from prompt bank (no AI API needed)
- [x] Manual "Assign This Week's Prompt" button in dashboard
- [x] Art deco retro-futuristic design (copper/navy palette, Josefin Sans display font)
- [x] Vercel cron config (`vercel.json`) — Mondays 1PM UTC
- [x] `.gitignore` updated (excludes `*.db`, `.env*`, `public/uploads/`, generated Prisma client)
- [x] Pushed to GitHub (https://github.com/tcyoder/Tomorrowland)

### Not Yet Built
- [ ] Deploy to Vercel (needs production DB — swap `better-sqlite3` for Neon/Postgres adapter)
- [ ] Image uploads in the Tiptap editor body (currently only cover image upload works)
- [ ] Email notification when weekly prompt is assigned (optional)
