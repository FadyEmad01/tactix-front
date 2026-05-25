# Tactix — Agent Context

## Build & Dev

```bash
npm run dev       # Development server
npm run build     # Production build
npm run start     # Start production server
```

## Project Map

```
src/
├── app/
│   ├── layout.tsx              # Root layout (Geist font, ThemeProvider, ToastProvider)
│   ├── page.tsx                # Landing page (unauthenticated) or redirect to /projects
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Dashboard layout (AppSidebar, BreadcrumbNav)
│   │   ├── projects/page.tsx   # Match dashboard (CRUD)
│   │   ├── board/page.tsx      # Tactical board listing
│   │   ├── board/[id]/page.tsx # Tactical board editor
│   │   ├── tags/page.tsx       # Panel/tag management
│   │   ├── video-editor/[matchId]/page.tsx  # Video analysis
│   │   ├── profile/page.tsx    # User profile
│   │   └── settings/           # Settings + appearance
│   ├── auth/                   # Login, signup, password reset, OTP
│   └── api/auth/               # Login (sets JWT cookie), logout (clears cookie)
├── middleware.ts               # Auth guard — checks token cookie
├── components/
│   ├── TacticalBoard/          # Full editor: Canvas, Toolbar, SceneManager, Player, Ball, ArrowLayer, DrawingLayer, FieldBackground, PropertiesPanel, TeamSettings, ExportModal, LinkBoardModal
│   ├── video-editor/           # MatchVideoEditor (2118 lines), LinkedBoardsSection
│   ├── board/                  # BoardsDashboard, BoardPreview, CreateBoardModal
│   ├── projects/               # MatchesDashboard, SearchableSelect
│   ├── tags/                   # TagDashboard, tag-input
│   ├── landing/                # IntroAnimation, LogoAnimation, Hero, Services, header, footer, Lenis provider
│   ├── auth/                   # login-form, signup-form, ForgetPassword, OTPVerification, ResetPassword, LogoutButton
│   ├── layout/                 # Container
│   ├── settings/               # ImageCropperForm, ResponsiveSettingsNav, sidebar-nav
│   ├── theme/                  # DarkLightMode, ModeToggle
│   └── ui/                     # 42 shadcn/ui components (button, card, dialog, input, select, sidebar, etc.)
├── lib/
│   ├── auth/                   # login.ts, signup.ts, profile.ts (client-side API calls)
│   ├── board-link/             # localStorage-based board-to-tag linking
│   ├── match/                  # Server actions (match CRUD, tag CRUD), video-db.ts (IndexedDB)
│   ├── panel/                  # Panel CRUD server actions
│   ├── fetchUserProfile.ts     # Reads token cookie, calls backend /api/profile
│   ├── updateProfile.ts        # Profile update server action
│   └── utils.ts                # cn() utility
├── stores/tacticalStore.ts     # Zustand store (981 lines) — board state, tools, scenes, undo/redo
├── types/                      # tactical-board.ts, match.ts, video-editor.ts, board-link.ts, project.ts, sidebar.ts
├── validation/authSchemas.ts   # Zod schemas for auth forms
├── hooks/                      # use-mobile, use-file-upload, useKeyboardShortcutsTacticalBoard
├── constant/                   # EVENTS.ts (video tags), leagues.ts (La Liga), SETTINGS.ts, SIDEBAR_NAVIGATION_DATA.ts
└── styles/globals.css          # Tailwind v4 + custom CSS (preloader, intro animation)
```

## Key Architecture Decisions

1. **Server Actions** for data mutations — board, match, tag, panel CRUD
2. **JWT in httpOnly cookie** — set via Next.js API route proxy to backend
3. **Zustand** for complex client state — tactical board (tools, scenes, history)
4. **Radix UI + shadcn/ui pattern** — accessible primitives with Tailwind styling
5. **Tailwind CSS v4** with CSS-based dark mode via `next-themes`
6. **Intro animation** — GSAP + React context for timing coordination (see `IntroContext`, `LandingWrapper`)
7. **Board linking** — localStorage-based (client-only linking metadata)
8. **Video storage** — IndexedDB for offline video caching

## Important Patterns

- **Auth**: Middleware + `fetchUserProfile()` server-side. Protected routes use dashboard layout.
- **Error boundaries**: Wrap `react-resizable-panels` in `TacticalBoard` index.tsx
- **Path aliases**: `@/` maps to `./src/`
- **CSS**: Use `cn()` from `@/lib/utils` for className merging
- **Server components**: Default; add `'use client'` for interactivity
