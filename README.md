# Tomorrowland Light & Power Co.

A personal blog set in the world of *New Tomorrowland 1994* — retro-futuristic spaceport city, headquarters of the League of Planets.

## Features

- **Prompted Story Posts** — Weekly AI-generated writing prompts set in New Tomorrowland lore, powered by Claude
- **Free-Form Blog Posts** — Write and publish on any topic
- **Rich Text Editor** — Full Tiptap editor with headings, lists, images, links, code blocks, blockquotes
- **Single-user auth** — Secure login with bcrypt-hashed credentials (no registration)
- **Auto-save** — Drafts auto-save every 30 seconds while editing
- **Retro-futuristic design** — Art deco aesthetic, copper/amber palette, Josefin Sans display font

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Edit `.env.local` with your values:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH="<bcrypt hash — see below>"
ANTHROPIC_API_KEY="sk-ant-..."
CRON_SECRET="your-random-cron-secret"
```

### 3. Generate your admin password hash

```bash
node -e "const bcrypt=require('bcryptjs');bcrypt.hash('yourpassword',12).then(console.log)"
```

Copy the output hash into `ADMIN_PASSWORD_HASH` in `.env.local`.

**Default credentials (development only):**
- Username: `admin`
- Password: `tomorrowland1994`

Change these before deploying to production.

### 4. Run database migrations

```bash
npx prisma migrate dev
```

### 5. Start development server

```bash
npm run dev
```

- Public blog: [http://localhost:3000](http://localhost:3000)
- Admin login: [http://localhost:3000/login](http://localhost:3000/login)
- Admin dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

## Deployment on Vercel

1. Push to GitHub
2. Import project in Vercel dashboard
3. Add all environment variables from `.env.local`
4. Set `DATABASE_URL` to a production Postgres URL (e.g., Neon via Vercel Marketplace)
5. Update `lib/db.ts` to use `@prisma/adapter-neon` for production
6. Deploy

### Weekly Prompt Cron Job

`vercel.json` configures a cron job every Monday at 1:00 PM UTC:

```json
{ "crons": [{ "path": "/api/cron/generate-prompt", "schedule": "0 13 * * 1" }] }
```

The endpoint is secured with the `x-cron-secret` header matching `CRON_SECRET`.

To manually trigger: use the "Generate Prompt" button in the admin dashboard.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Tiptap** rich text editor
- **Prisma 7** with better-sqlite3 adapter
- **Auth.js v5** with credentials provider
- **Anthropic Claude** for weekly prompt generation
- **Vercel** deployment with cron jobs
