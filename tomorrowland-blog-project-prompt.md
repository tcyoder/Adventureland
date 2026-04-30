# Project Prompt: Personal Blog — Tomorrowland Light & Power Co.

## Project Overview

Build a personal blog site called **Tomorrowland Light & Power Co.** for a single authenticated user. The blog has two distinct creative modes:

1. **Prompted Story Posts** — Each week, the site automatically generates a short-story writing prompt themed around the fictional world of *New Tomorrowland 1994* (described in detail below). The user can write and publish a short story in response.
2. **Free-Form Blog Posts** — The user can create, draft, edit, and publish blog posts on any topic at any time.

This is a private, single-user site. No public registration exists. The owner logs in with a secure credential to access the admin/writing interface. The public-facing side displays all published posts.

---

## The World: New Tomorrowland 1994

All weekly story prompts must draw from the lore, aesthetic, and inhabitants of the **1994 redesign of Tomorrowland at Walt Disney World's Magic Kingdom** — a retro-futuristic spaceport city imagined through the lens of 1920s–1930s pulp science fiction. Think art deco architecture, gleaming chrome, copper rivets, exposed gears and turbines, and a sense of wonder about a future that never quite arrived. The key lore elements to weave into prompts include:

- **The League of Planets** — Tomorrowland is the headquarters of this interplanetary governing body. Stories can involve diplomatic intrigue, alien dignitaries, or galactic politics playing out against the city's art deco skyline.
- **Spaceport City / Avenue of the Planets** — The city's main boulevard connects a bustling intergalactic hub. Space Mountain serves as the city's spaceport and, thanks to a FedEx partnership, a hub for intergalactic shipping and cargo.
- **X-S Tech** — A morally ambiguous megacorporation operating in the city. Known for pushing the boundaries of science and experimenting on the public (see: ExtraTERRORestrial Alien Encounter). Great source of villain energy, corporate dystopia threads, or whistleblower stories.
- **The Timekeeper** — A time-traveling scientist/robot stationed at the Tomorrowland Science Center (Circle-Vision Theater). Prompts can involve temporal anomalies, visits from historical figures, or paradoxes rippling through the city.
- **Tomorrowland Metro-Retro Historical Society** — A preservation society that curates exhibits on the city's past (including the Carousel of Progress and Dreamflight). Think archivists, historians, and keepers of civic memory in a world always racing toward the next thing.
- **Tomorrowland Transit Authority (TTA / PeopleMover)** — The city's elevated transit system, humming through the skyline. Great backdrop for chance encounters, commuters, and city life vignettes.
- **Astro Orbiter** — The iconic spinning rocket tower at the city's center. A landmark, a beacon, a meeting point.
- **The Robot Newsboy** — An automated vendor who hawks headlines from across the galaxy. Could be a source of rumors, plot hooks, or unreliable narration.
- **Alien Communications Phone** — A public phone where citizens can eavesdrop on transmissions from off-world residents and visitors.
- **The Tomorrowland Power Plant** — The arcade and gift shop area repurposed as the city's energy hub.

**Aesthetic touchstones:** Art deco geometry, copper and brass finishes, bioluminescent signage, retro-rocket silhouettes, alien species living alongside humans, a city proud of its own mythology.

Prompts should vary in tone — some whimsical, some noir, some quietly melancholic, some adventurous — and should always feel grounded in this specific world rather than generic sci-fi.

---

## Technical Requirements

### Stack (Recommended)
- **Frontend:** Next.js (App Router) with TypeScript
- **Styling:** Tailwind CSS
- **Rich Text Editor:** Tiptap (supports images, links, headings, bold/italic/lists, etc.)
- **Database:** PostgreSQL via Prisma ORM (or SQLite for simpler local setup)
- **Authentication:** NextAuth.js with credentials provider (username + password, bcrypt hashed) — single hardcoded admin user, no registration flow
- **Scheduled Tasks:** Vercel Cron Jobs (or node-cron for self-hosted) to trigger weekly prompt generation
- **AI Prompt Generation:** Anthropic Claude API (claude-haiku or claude-sonnet) to generate the weekly story prompt
- **Image Storage:** Local filesystem or Cloudinary/S3 for uploaded images in posts
- **Deployment:** Vercel (recommended) or self-hosted Node.js

Feel free to adjust the stack based on user preferences or constraints, but preserve the feature set described below.

---

## Authentication

- Single admin user. Credentials (username + hashed password) are stored in an environment variable or seeded into the database on first run.
- Login page at `/login` — username and password form.
- Protected routes: `/admin/*` — all writing, editing, drafting, and settings pages.
- Public routes: `/` (post list), `/post/[slug]` (individual post view).
- Session managed via NextAuth.js with JWT or database sessions.
- No registration, no password reset flow (owner manages credentials directly via env vars or DB seed).

---

## Data Model

### Post
```
id           String    @id @default(cuid())
title        String
slug         String    @unique
content      String    // Rich text stored as JSON (Tiptap) or HTML
excerpt      String?   // Optional short summary shown in post list
type         PostType  // PROMPTED | FREE
status       PostStatus // DRAFT | PUBLISHED
promptId     String?   // FK to WeeklyPrompt if type = PROMPTED
coverImage   String?   // URL or path to cover image
createdAt    DateTime  @default(now())
updatedAt    DateTime  @updatedAt
publishedAt  DateTime?
```

### WeeklyPrompt
```
id           String    @id @default(cuid())
weekOf       DateTime  // Start of the week this prompt belongs to
promptText   String    // The AI-generated prompt
theme        String?   // Optional: which lore element(s) were used
createdAt    DateTime  @default(now())
post         Post?     // The response post, if written
```

### PostType Enum
```
PROMPTED   // Generated from a weekly story prompt
FREE       // User-initiated blog post
```

### PostStatus Enum
```
DRAFT      // Saved but not publicly visible
PUBLISHED  // Live and publicly visible
```

---

## Features

### Public Side

**Post List (`/`)**
- Shows all PUBLISHED posts, newest first.
- Each post card shows: title, publish date, post type badge (📡 Prompted Story / ✍️ Free Post), excerpt or first ~150 chars of content, cover image if present.
- **Filter controls:** Toggle between All / Prompted Stories / Free Posts.
- Clean, readable layout. Subtle retro-futuristic design touches are encouraged (see Design Notes).

**Single Post View (`/post/[slug]`)**
- Full post content rendered from rich text.
- Shows title, publish date, post type badge, cover image.
- If type = PROMPTED, show the original prompt in a styled callout above the post.
- Navigation to previous / next post.

### Admin Side (all behind auth)

**Dashboard (`/admin`)**
- Quick stats: total posts, drafts, published count.
- Current week's prompt displayed prominently. If no response post exists yet, show a "Write Your Story" CTA button.
- List of recent drafts with edit links.
- Button to create a new free-form post.

**Weekly Prompt Panel**
- Displays this week's auto-generated prompt.
- Button: "Write a Response" → creates a new PROMPTED post pre-linked to this week's prompt and navigates to the editor.
- Shows status: "Responded" (with link to post) or "Not yet written."
- Optionally: ability to regenerate the prompt if the user doesn't like it (triggers a new AI call).

**Post Editor (`/admin/post/new` and `/admin/post/[id]/edit`)**
- Rich text editor (Tiptap) with:
  - Headings (H1, H2, H3)
  - Bold, italic, underline, strikethrough
  - Ordered and unordered lists
  - Blockquote
  - Inline code and code blocks
  - Hyperlinks (insert/edit/remove)
  - Image upload or image-by-URL insertion
  - Horizontal rule
- Fields:
  - Title (text input)
  - Slug (auto-generated from title, editable)
  - Excerpt (optional short description)
  - Cover image (upload or URL)
  - Post type (auto-set for PROMPTED; user selects FREE for new free posts)
  - Status toggle: Save as Draft / Publish
  - If PROMPTED: shows the linked prompt in a read-only panel for reference
- **Auto-save:** Debounced draft auto-save every 30 seconds while editing.
- Actions:
  - "Save Draft" — saves with status DRAFT
  - "Publish" — sets status PUBLISHED and sets publishedAt
  - "Unpublish" — reverts a published post back to DRAFT
  - "Delete" — soft delete or hard delete with confirmation dialog

**All Posts List (`/admin/posts`)**
- Full list of all posts (draft + published).
- Columns: Title, Type, Status, Created, Published date, Actions (Edit, Delete).
- Filterable by status (All / Draft / Published) and type (All / Prompted / Free).
- Sortable by date.

### Weekly Prompt Generation

**Schedule:** Every Monday at 8:00 AM (user's local timezone or UTC — configurable via env var).

**Logic:**
1. Cron job triggers the `/api/cron/generate-prompt` endpoint (secured with a `CRON_SECRET` header).
2. Endpoint checks if a prompt already exists for the current week (idempotent).
3. If not, calls the Claude API with a system prompt instructing it to generate a short-story writing prompt set in the New Tomorrowland 1994 world.
4. The generated prompt is saved to the `WeeklyPrompt` table.
5. (Optional) Send the owner an email notification with the new prompt.

**Claude System Prompt for Prompt Generation (use as the system message):**

```
You are a creative writing prompt generator for a personal fiction blog. Your job is to craft one short-story writing prompt set in the world of New Tomorrowland 1994 — a retro-futuristic spaceport city that serves as the headquarters of the League of Planets, imagined through the aesthetic of 1920s–1930s pulp science fiction: art deco architecture, chrome and copper, exposed gears, bioluminescent signs, and a sense of wonder about a future that never quite arrived.

The city's key locations and characters include:
- The League of Planets headquarters
- Space Mountain (the city's spaceport and intergalactic FedEx shipping hub)
- X-S Tech (a powerful, morally ambiguous megacorporation)
- The Timekeeper (a time-traveling scientist/automaton at the Science Center)
- The Tomorrowland Metro-Retro Historical Society
- The Tomorrowland Transit Authority (elevated PeopleMover rail)
- The Astro Orbiter (spinning rocket tower landmark)
- A Robot Newsboy who hawks galactic headlines
- A public Alien Communications Phone
- Avenue of the Planets (the main boulevard)

Vary the tone across weeks: sometimes adventurous, sometimes noir, sometimes quietly melancholic, sometimes comedic. Always anchor the prompt in a specific character, place, or situation from this world. The prompt should be 2–4 sentences long and end with an open-ended situation or question that invites the writer to take it anywhere they choose. Do not write the story — only the prompt.

Output only the prompt text. No preamble, no labels, no explanation.
```

---

## Design Notes

The blog is named **Tomorrowland Light & Power Co.** — a nod to the Tomorrowland Power Plant (the city's energy hub) from the 1994 redesign. The name should appear prominently in the site header/logo on all pages, styled to evoke an art deco utility company insignia or neon sign. Think retro corporate branding: the kind of logo you'd see on the side of a gleaming copper generator or embossed on a brass placard.

The public-facing blog should feel distinctive — not just a generic blog template. Lean into the "tomorrow that never was" aesthetic without being costumey:
- Use a color palette inspired by the land: deep space navy, warm copper/amber accents, cream/ivory for text backgrounds, occasional bright turquoise or magenta for highlight states.
- Typography: a clean geometric sans-serif for body text (e.g., Inter or DM Sans), with an art-deco-influenced display font for post titles (e.g., Josefin Sans or Poiret One from Google Fonts).
- Subtle decorative elements: thin geometric border rules, gear or rivet motifs as dividers, star-field or circuit-board textures used sparingly.
- The "Prompted Story" badge should feel different from the "Free Post" badge — something that evokes a transmission or broadcast.
- Keep the admin interface clean and functional — the retro theming is for the public side.

---

## Environment Variables Required

```
DATABASE_URL=              # PostgreSQL or SQLite connection string
NEXTAUTH_SECRET=           # Random string for session signing
NEXTAUTH_URL=              # e.g., http://localhost:3000
ADMIN_USERNAME=            # The single admin username
ADMIN_PASSWORD_HASH=       # bcrypt hash of the admin password
ANTHROPIC_API_KEY=         # For weekly prompt generation
CRON_SECRET=               # Secret header for securing cron endpoint
# Optional:
CLOUDINARY_URL=            # If using Cloudinary for image uploads
SMTP_HOST=                 # If email notifications are desired
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
NOTIFY_EMAIL=
```

---

## Project Structure (Suggested)

```
/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                  # Post list with filters
│   │   └── post/[slug]/page.tsx      # Single post view
│   ├── (admin)/
│   │   ├── admin/page.tsx            # Dashboard
│   │   ├── admin/posts/page.tsx      # All posts list
│   │   ├── admin/post/new/page.tsx   # New post editor
│   │   └── admin/post/[id]/edit/page.tsx  # Edit post
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── posts/route.ts
│   │   ├── posts/[id]/route.ts
│   │   ├── upload/route.ts           # Image upload handler
│   │   └── cron/generate-prompt/route.ts
│   └── login/page.tsx
├── components/
│   ├── Editor/                       # Tiptap editor components
│   ├── PostCard.tsx
│   ├── PostFilters.tsx
│   ├── PromptPanel.tsx
│   └── ui/                           # Shared UI primitives
├── lib/
│   ├── auth.ts                       # NextAuth config
│   ├── db.ts                         # Prisma client
│   ├── claude.ts                     # Anthropic API helper
│   └── slugify.ts
├── prisma/
│   └── schema.prisma
└── .env.local
```

---

## Getting Started Instructions for Claude Code

1. Scaffold the Next.js project with TypeScript and Tailwind CSS.
2. Set up Prisma with the schema above. Run `prisma migrate dev` to create the database.
3. Configure NextAuth with the credentials provider using `ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH`.
4. Build the Tiptap rich text editor component with all required toolbar options.
5. Build the public post list and single post pages.
6. Build the admin dashboard, post editor, and posts list pages.
7. Implement the cron endpoint for weekly prompt generation using the Anthropic SDK.
8. Set up image upload handling.
9. Apply the retro-futuristic design system to the public-facing pages.
10. Write a `README.md` with setup instructions, how to generate the initial admin password hash, and how to configure the cron job.
