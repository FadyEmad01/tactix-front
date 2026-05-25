# Tactix

AI-powered football match analysis platform. Tactical board editor, video analysis, and event tagging for football coaches and analysts.

## Tech Stack

- **Framework**: Next.js 15.5 (App Router) + React 19 + TypeScript 5
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix primitives)
- **Auth**: JWT in httpOnly cookies (custom middleware)
- **State**: Zustand (tactical board), React context (intro animation)
- **Animation**: Motion (Framer Motion successor), GSAP, Lenis
- **Backend**: External REST API at `tactix-graduation-project-backend.vercel.app`

## Features

- **Match Dashboard** — CRUD for football matches with team logos, results, search
- **Tactical Board Editor** — SVG-based football field with drawing tools, player placement, formations (4-3-3, 4-4-2, 3-5-2), multi-scene management, undo/redo
- **Video Analysis Editor** — Video playback with time-based event tagging, panel system, linked tactical boards
- **Panel/Tag System** — Customizable event categories with color-coded tags
- **Board Linking** — Link tactical boards to specific video tags
- **Auth Flow** — Email/password with OTP verification, password reset
- **Profile & Settings** — Avatar upload with cropping, dark/light mode

## Getting Started

```bash
npm install
npm run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `API_URL` | Backend API base URL |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (e.g. `http://localhost:3000`) |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/        # Protected dashboard routes
│   ├── auth/               # Login, signup, password reset
│   └── api/auth/           # Login/logout API routes
├── components/
│   ├── TacticalBoard/      # Full tactical board editor
│   ├── video-editor/       # Video analysis editor
│   ├── board/              # Board listing dashboard
│   ├── projects/           # Match dashboard
│   ├── tags/               # Panel/tag management
│   ├── landing/            # Landing page (intro animation, hero)
│   └── ui/                 # shadcn/ui primitives
├── lib/                    # Server actions, auth helpers, utilities
├── stores/                 # Zustand store (tactical board state)
├── types/                  # TypeScript type definitions
├── validation/             # Zod schemas
├── hooks/                  # Custom React hooks
├── constant/               # App constants (events, leagues, nav)
└── middleware.ts           # Auth guard middleware
```

## Architecture

- **Auth**: Middleware checks `token` cookie on protected routes. Server components use `fetchUserProfile()` to get user data.
- **State**: Complex editor state (tactical board) in Zustand. Coordination state (intro animation) in React context.
- **Data**: Server actions for all CRUD operations. IndexedDB for offline video storage. localStorage for board-to-tag links.
- **Styling**: Tailwind CSS v4 with `cn()` utility (clsx + tailwind-merge). Dark mode via `next-themes`.
