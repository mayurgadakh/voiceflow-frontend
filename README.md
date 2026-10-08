# Voiceflow web app

The frontend for Voiceflow, an app where customers record a short voice note and admins review what they said. Customers record, track their submissions and read the transcript. Admins get an overview, a filterable feedback list, and a detail page with audio, transcripts and sentiment.

It is a single-page app built with React, Vite and TypeScript. It talks to the API in `../Backend`.

- App: https://voiceflow.mayurgadakh.dev
- API: https://api.voiceflow.mayurgadakh.dev
- Architecture, diagrams and design decisions: [../Backend/docs/ARCHITECTURE.md](../Backend/docs/ARCHITECTURE.md)

## Contents

- [Stack](#stack)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Routes](#routes)
- [Project structure](#project-structure)
- [Design system](#design-system)
- [How things work](#how-things-work)
- [Deployment](#deployment)
- [Conventions](#conventions)
- [Known limitations](#known-limitations)

## Stack

| Area | Choice |
| --- | --- |
| Framework | React 19, TypeScript |
| Build tool | Vite |
| Routing | React Router 7 |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (Radix primitives) with the Supabase theme from tweakcn |
| Font | Outfit (variable), self-hosted through Fontsource |
| Auth | Better Auth React client |
| Charts | Recharts, through shadcn's chart component |
| Dates | date-fns and react-day-picker |
| Icons | lucide-react |
| Theme switching | next-themes |
| Toasts | sonner |
| Linting | oxlint |

## Getting started

### Requirements

- Node.js 22 or newer
- The API from `../Backend` running on port 3000

### Setup

```bash
npm install
cp .env.example .env     # optional in development, see below
npm run dev              # http://localhost:5173
```

In development Vite proxies `/api` to `http://localhost:3000`, so the browser only ever talks to one origin and session cookies work without extra configuration. The proxy is set in `vite.config.ts`.

### Environment variables

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Public origin of the API. Leave empty in development. Set it in production |

Vite exposes only variables that start with `VITE_` to the browser. Never put secrets here.

### Recording needs a secure context

Browsers allow microphone access only on HTTPS or on `localhost`. If you open the dev server from another device over your network, recording will be blocked.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run oxlint |

Two lint warnings about fast refresh in `components/ui/badge.tsx` and `button.tsx` come from shadcn's generated code and can be ignored.

## Routes

| Path | Who | Page |
| --- | --- | --- |
| `/login`, `/signup` | Logged-out visitors | Authentication |
| `/forgot-password`, `/reset-password` | Anyone | Password reset |
| `/` | Customers | My feedback: a table of your submissions |
| `/record` | Customers | Record, preview and submit feedback |
| `/feedback/:id` | Customers | One submission, updates itself while processing |
| `/admin` | Admins | Overview: figures, sentiment, volume, topics, languages |
| `/admin/feedback` | Admins | All feedback with filters |
| `/admin/feedback/:id` | Admins | Audio, transcripts, analysis, reprocess |
| `*` | Anyone | Not found |

Route guards live in `components/RouteGuards.tsx`. They are a convenience for navigation: the API enforces access on every request. Logged-in admins are redirected away from the customer pages, because admins review feedback and do not submit it.

## Project structure

```text
src/
  main.tsx                 Entry: theme provider, error boundary, router, toaster
  App.tsx                  Route table. Admin pages are lazy-loaded
  index.css                Tailwind, the Supabase theme tokens, sentiment colours
  types.ts                 Types shared by pages and hooks
  pages/                   One file per screen
    admin/                 Overview, FeedbackList, FeedbackDetail
  components/
    ui/                    shadcn components (generated, edit with care)
    AppLayout.tsx          Top bar, navigation, account menu, theme switch
    RouteGuards.tsx        ProtectedRoute, GuestRoute, CustomerRoute, AdminRoute
    AuthLayout.tsx         Centred card used by the auth screens
    AudioPlayer.tsx        Play/pause, seek bar and time
    LevelMeter.tsx         Live waveform drawn from the microphone level
    DateRangePicker.tsx    Calendar in a popover
    PasswordInput.tsx      Password field with a show/hide button
    Badges.tsx             Status and sentiment badges
    ...                    Logo, PageHeader, BackLink, loaders, error boundary
  hooks/
    useApi.ts              useApi, usePolledItem, useCursorList
    useRecorder.ts         MediaRecorder, timer and live level
  lib/
    api.ts                 fetch wrapper for the API
    authClient.ts          Better Auth client
    format.ts              Dates, durations, error messages
    languages.ts           Language names and codes
    sentiment.ts           Sentiment labels and colours
    utils.ts               cn() class merging
```

## Design system

The look comes from the Supabase theme on [tweakcn](https://tweakcn.com), installed with:

```bash
npx shadcn@latest add https://tweakcn.com/r/themes/supabase.json
```

That writes the design tokens (colours, radius, shadows) into `src/index.css` as CSS variables for light and dark mode. To change the look, edit those variables, not individual components.

Changes made on top of the theme:

- The theme names the Outfit font but does not load it. `@fontsource-variable/outfit` is imported in `index.css`.
- The theme's global letter-spacing of `0.025em` made Outfit too loose, so `--tracking-normal` is `0` and headings use a small negative tracking.
- The light-mode `--input` border was almost invisible against the page, so it is darker for the 3:1 contrast that form controls need.
- Sentiment and status colours are extra tokens (`--sentiment-positive`, `-neutral`, `-mixed`, `-negative`), used as small dots and chart fills. Badges show a coloured dot with neutral text, not tinted pills.

Dark mode follows the system setting by default, and users can pick Light, Dark or System from the account menu.

### Adding a component

```bash
npx shadcn@latest add <component>
```

Files land in `src/components/ui`. The generated components import `cn` from the small `cn` package that shadcn maintains. Import with the `@/` alias, for example `@/components/ui/button`.

### Writing style

Sentence case everywhere, no all-caps labels. Buttons name the action ("Submit feedback", "Reprocess"). Errors say what happened and what to do next. Every text input has a placeholder that is an example or an instruction, never a copy of its label.

## How things work

### Session and loading

`authClient.useSession()` sets `isPending` back to `true` on every refetch, including when you return to the tab. Treating that as a first load made the whole app flash a loading screen. The route guards instead wait for the first lookup only, then keep rendering while later refetches happen in the background (see `useSessionGate` in `RouteGuards.tsx`).

### Talking to the API

`lib/api.ts` is a thin `fetch` wrapper. It sends cookies, prefixes `/api`, and throws an `Error` with the API's message when a request fails. The API always answers errors as `{ "error": { "code", "message" } }`.

Three hooks in `hooks/useApi.ts` cover every screen:

| Hook | Use |
| --- | --- |
| `useApi(path)` | Fetch once, refetch when the path changes |
| `usePolledItem(path, finalStatuses)` | Refetch every 3 seconds until the item reaches a final status. Used while a recording is processing |
| `useCursorList(path)` | Cursor-paged list with "Load more", restarts when filters change |

### Recording

`useRecorder` picks WebM/Opus where the browser supports it (Chrome, Firefox) and MP4/AAC otherwise (Safari). Recording stops at 30 seconds and clips under 1 second are rejected. The live waveform reads the microphone level through an `AnalyserNode` and draws it on a canvas.

Submitting does three things, in `pages/Record.tsx`:

1. `POST /api/feedback` registers the recording and returns a signed upload URL.
2. The browser `PUT`s the audio straight to storage. It never goes through the API.
3. `POST /api/feedback/:id/complete` confirms the upload, then the app opens `/feedback/:id`, which polls until processing is done.

The player takes the recording length from the data we already have, because browser-made WebM files report no duration until fully played.

### Admin filters

The filters on `/admin/feedback` live in the URL (`?sentiment=NEGATIVE&from=2026-09-30`). Going back from a detail page keeps them, and a filtered view can be shared.

### Languages

`lib/languages.ts` holds Sarvam's 23 supported language codes and their names. The backend validates the same list in `SPEECH_LANGUAGES`. Keep them in sync.

## Deployment

The app builds to static files in `dist/` and is deployed on Vercel. `vercel.json` rewrites every path to `index.html`, so deep links like `/admin/feedback/...` work on refresh.

1. Set `VITE_API_URL` to the public origin of the API and rebuild. It is baked in at build time.
2. Serve the app and the API from the same site. The live setup is `voiceflow.mayurgadakh.dev` and `api.voiceflow.mayurgadakh.dev`, which share `mayurgadakh.dev`, so session cookies work. They do not work across unrelated domains such as two different `*.vercel.app` projects.
3. Make sure the API's `CLIENT_URL` is this app's origin, so CORS and trusted origins match.

Admin pages and the charting library are split into separate chunks, so customers do not download them.

## Conventions

- Pages fetch data with the hooks above, not with `fetch` directly.
- Shared constants and helpers live in `lib/`, not in component files. Files that export components should export only components.
- Use shadcn components and theme tokens (`bg-muted`, `text-muted-foreground`) instead of raw colours.
- Check new screens at phone width and in dark mode.
- The generated `components/ui` files can be edited, but re-running `shadcn add` with `--overwrite` will replace your changes.

## Known limitations

- There are no automated tests yet.
- Recording and upload were verified in Chrome and Safari before the redesign. The new live waveform has not yet been checked with a real microphone, and mobile browsers need a manual check before release.
- The audio player relies on the storage server supporting HTTP range requests for seeking. Supabase, S3 and R2 do.
- Only English has been tested end to end through the speech pipeline.
- Admin pages show the current state when opened. They poll only while one item is processing, not for new feedback arriving.
