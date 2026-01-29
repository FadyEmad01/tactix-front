# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

This is a Next.js App Router project (see `package.json`). Only a few core scripts are defined:

- **Start dev server**: `npm run dev`
- **Build for production**: `npm run build`
- **Start production server** (after building): `npm start`

There are currently no explicit linting or test scripts defined in `package.json`.

## High-level architecture

### Framework and entrypoints

- The app uses **Next.js App Router** with TypeScript and Tailwind CSS.
- Main entrypoints:
  - `src/app/layout.tsx`: Root layout that wires up global fonts, the `ThemeProvider` (from `src/provider/theme-provider.tsx`), toast provider, global styles (`src/styles/globals.css`), and Vercel Analytics.
  - `src/app/page.tsx`: Root page that conditionally renders the signed-in dashboard entry card or an unauthenticated landing card based on `fetchUserProfile`.
- Static assets like fonts are handled via `next/font/google` (Geist).
- Image optimization is configured in `next.config.ts` to allow Cloudinary (`res.cloudinary.com`) images.

### Routing structure

- `src/app/` follows App Router conventions, with route groups for dashboard features:
  - `src/app/(dashboard)/dashboard/settings/*`: Settings area, including `ProfileSettingsForm` and appearance settings.
  - `src/app/(dashboard)/profile/*`: User profile page; server component that passes user data down to `ProfileContent`.
  - `src/app/(dashboard)/projects/page.tsx`: Client-side “Match Analysis projects” grid, persisted in `localStorage` rather than the backend.
  - `src/app/(dashboard)/video-editor/page.tsx`: Client-side page that hosts the `VideoEditor` component.
- Auth routes live under `src/app/auth/*` (login, sign-up, OTP, email verification states, password reset, etc.). These wire into shared auth components in `src/components/auth/*`.
- API routes used by the frontend live under `src/app/api/`:
  - `src/app/api/auth/login/route.ts`: Forwards login credentials to the external backend (`NEXT_PUBLIC_API_URL`), then sets an HTTP-only `token` cookie on success.
  - `src/app/api/auth/logout/route.ts`: Clears `token` and `user` cookies.

### Auth, session, and middleware flow

Core auth/session flow involves **cookies**, **middleware**, and **server utilities**:

- `src/middleware.ts` inspects the `token` cookie for every request matching:
  - `/dashboard/:path*`, `/profile/:path*`, `/auth/:path*`.
  - If **no token** and path is not under `/auth`, it redirects to `/auth/login`.
  - If **token exists** and path is an auth page (except email-verification), it redirects to `/`.
- Login flow:
  - Client forms in `src/components/auth/login-form.tsx` call `src/lib/auth/login.ts`.
  - `src/lib/auth/login.ts` calls the internal `/api/auth/login` route, which then calls the external backend and sets the `token` cookie. The client keeps a `user` object in `sessionStorage` for UI convenience.
- Sign-up and profile APIs:
  - `src/lib/auth/signup.ts` posts a multipart `FormData` directly to `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`.
  - `src/lib/auth/profile.ts` provides browser-side helpers `getProfile` and `updateProfile` that talk to `/api/profile` (an external or separate route) using `credentials: 'include'`.
- Server-side user fetching:
  - `src/lib/fetchUserProfile.ts` is a **server utility** that reads the `token` cookie via `next/headers`, calls `${API_URL}/api/profile` with `Authorization: Bearer <token>`, and normalizes the response (supports `{ data: user }`, `{ user }`, or raw user objects).
  - This utility is used in server components such as `src/app/page.tsx`, `src/app/(dashboard)/profile/page.tsx`, and `src/app/(dashboard)/dashboard/settings/page.tsx` to hydrate initial user state.
- Profile updates from server components:
  - `src/lib/updateProfile.ts` is a **server action** (`"use server"`) that reads the `token` cookie, conditionally sends either JSON (no file) or `FormData` (with file) to `${API_URL}/api/profile` using `Authorization: Bearer <token>`.

### Video analysis and match data

There are two related but distinct concepts: **local projects** and **backend matches**.

#### Local projects (front-end only)

- `src/app/(dashboard)/projects/page.tsx` implements a rich client-only experience for managing “match analysis projects”:
  - Persists an array of `Project` objects in `localStorage` under the key `video_projects`.
  - Supports creation, editing, deletion, bulk selection/deletion, searching, and sorting.
  - For new projects, it can capture a thumbnail from an uploaded video using an off-DOM `<video>` + `<canvas>` pipeline, storing the thumbnail and video URL as blob URLs in the project.
- This module is completely client-side (`"use client"`), and does **not** hit the backend; it is useful for local-only exploratory work or as a UX prototype.

#### Backend-backed matches and tagging

- `src/lib/matches.ts` is the primary integration point with the backend match API, implemented as **server actions** (`"use server"`):
  - Defines shared types: `Project` (backend representation of a match) and `BackendTag`/`TagPayload` for event tags.
  - Uses `cookies()` and `revalidatePath` from Next to attach `Authorization: Bearer <token>` on each request and trigger cache invalidation.
  - `fetchMatches()` requests `${API_URL}/api/match`, handles several possible response shapes (`[]`, `{ data: { matches: [] } }`, `{ data: [] }`, `{ matches: [] }`), and normalizes the result into `Project` objects.
  - `fetchMatchById(matchId)` fetches `${API_URL}/api/match/${matchId}` and returns the raw `data`/object; this is useful when you need the exact backend schema.
  - `createMatch(data)` posts a normalized payload to `${API_URL}/api/match` and revalidates `/` on success.
  - `createTag(matchId, data)` and `deleteTag(matchId, tagId)` talk to `${API_URL}/api/tag/...` to manage event tags on the backend.
  - `deleteMatch(matchId)` deletes a match at `${API_URL}/api/match/${matchId}` and revalidates `/`.
- These server utilities are intended to be used from server components or server actions in the dashboard routes when you want match data to be persisted on the backend rather than only in the browser.

#### Client-side video tagging UI

- `src/components/video-editor/VideoEditor.tsx` is a standalone, client-only video tagging tool.
  - Manages its own `<video>` element, playback controls, playback speed, and a list of `EventTag`s in React state.
  - Provides hard-coded `EVENT_CATEGORIES` (“Build Up”, “Defensive Block”, “Transitions”, etc.) and uses color-coding to render event buttons.
  - Allows the user to:
    - Upload a local video file (no backend upload here; uses `URL.createObjectURL`).
    - Tag time-based events during playback; tags are sorted by timestamp and displayed in a timeline.
    - Jump to tagged timestamps by clicking timeline items.
  - Time formatting is implemented inline in the component; `src/lib/video-utils.ts` contains a similar `formatTime(seconds)` helper for reuse in other components.

### Shared UI, theming, and constants

- `src/components/ui/*` contains reusable UI primitives built on top of Radix UI and Tailwind (buttons, inputs, dialogs, dropdowns, calendar, checkbox, table, etc.). These are the building blocks for most pages.
- `src/components/theme/*` provides theme toggles (e.g., dark/light mode switch) built on top of `next-themes` via `src/provider/theme-provider.tsx`.
- `src/constant/SETTINGS.ts` defines the settings navigation items used in the dashboard settings layout.
- `src/constant/EVENTS.ts` defines categorized event names for match/video tagging (common, attacking, defensive, transition events).
- `src/lib/utils.ts` currently exposes `cn(...)`, a standard Tailwind/clsx className helper.

### Validation and forms

- Validation is handled with **Zod** under `src/validation/`:
  - `authSchemas.ts` defines reusable password rules and email domain restrictions, plus schemas and TypeScript types for login, sign-up, forgot-password, and reset-password flows.
  - `profileSchemas.ts` defines `profileSchema` and its type for updating the profile (name and optional image field).
- These schemas are paired with React Hook Form in the auth/profile components to provide typed, client-side validation that matches backend expectations.

### Environment and configuration

- The app relies on **`NEXT_PUBLIC_API_URL`** to reach the backend for auth, profile, and match APIs. If unset, some helpers default to `http://localhost:3000`, which assumes the backend is running on the same origin.
- When adding new server actions or backend calls, prefer the existing patterns:
  - Use `cookies()` to read the `token` and attach it as `Authorization: Bearer ...`.
  - Use `revalidatePath` after mutating operations to keep server-rendered lists up-to-date.

### How to extend this codebase safely

When adding new features, consider:

- **Routing**: Put new dashboard-related pages under `src/app/(dashboard)/...` so they inherit middleware protection.
- **Backend integration**: Reuse `src/lib/matches.ts`/`fetchUserProfile`/`updateProfile` patterns for new endpoints, especially around cookies, env-based API URLs, and response-shape normalization.
- **UI and forms**: Prefer existing `src/components/ui/*` primitives and `src/validation/*` schemas to keep UX and validation consistent.
