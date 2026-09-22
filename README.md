# Adventure Trading Company

A personal blog set in the world of *Adventureland* — dispatches and transmissions from the jungle, featuring locations, stories, and characters from Adventureland at Disney's Magic Kingdom and Disneyland.

## Features

- **Prompted Story Posts** — Weekly writing prompts set in Adventureland lore
- **Free Dispatches** — Free-form explorer's journal entries
- **Rich Text Editor** — Tiptap-powered editor with image uploads
- **Admin Dashboard** — Post management, prompt bank, analytics
- **RSS Feed** — Auto-generated RSS 2.0 feed
- **Dark jungle aesthetic** — Gold accents, parchment text, Cinzel/Lora fonts

## Stack

Next.js 16 · Prisma 7 · Neon PostgreSQL · Auth.js v5 · Tiptap 3 · Vercel Blob · Tailwind CSS v4

## Setup

1. Clone and install: `pnpm install`
2. Copy `.env.example` to `.env.local` and fill in values
3. Run migrations: `pnpm prisma migrate dev`
4. Start dev server: `pnpm dev`

## Environment Variables

```env
DATABASE_URL=           # Neon PostgreSQL connection string
NEXTAUTH_SECRET=        # Random 32+ char string
NEXTAUTH_URL=           # http://localhost:3000
ADMIN_USERNAME=         # e.g., admin
ADMIN_PASSWORD_HASH=    # bcrypt hash (node -e "require('bcryptjs').hash('password',12).then(console.log)")
CRON_SECRET=            # Secret for Vercel cron
RESET_SECRET=           # Emergency reset secret
BLOB_READ_WRITE_TOKEN=  # Vercel Blob token
```
