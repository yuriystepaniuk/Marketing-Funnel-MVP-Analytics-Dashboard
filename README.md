# Marketing Funnel MVP

End-to-end marketing funnel with analytics dashboard built on **Next.js 16 + Supabase**.

Two independently deployable apps in a monorepo:

| App | Path | Description |
|-----|------|-------------|
| **Quiz** | `apps/quiz/` | Marketing funnel — quiz, email capture, paywall |
| **Dashboard** | `apps/dashboard/` | Analytics dashboard — funnel metrics, attribution |

## Live Links

| Service | URL |
|---------|-----|
| Funnel | _TBD after deploy_ |
| Dashboard | _TBD after deploy_ |

---

## Local Setup

### 1. Clone the repo

```bash
git clone git@github.com:yuriystepaniuk/Marketing-Funnel-MVP-Analytics-Dashboard.git
cd Marketing-Funnel-MVP-Analytics-Dashboard
```

### 2. Create Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Run the SQL from `supabase/schema.sql` in the **SQL Editor**
3. Copy **Project URL** and **Publishable key** from Settings → API

### 3. Configure environment for each app

```bash
# Quiz app
cp apps/quiz/.env.example apps/quiz/.env.local

# Dashboard app
cp apps/dashboard/.env.example apps/dashboard/.env.local
```

**`apps/quiz/.env.local`**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

**`apps/dashboard/.env.local`**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
DASHBOARD_SECRET=<random-secret>
DASHBOARD_ADMIN_USER=<your-username>
DASHBOARD_ADMIN_PASSWORD=<strong-password>
```

### 4. Run locally

```bash
# Quiz (http://localhost:3000)
cd apps/quiz && npm install && npm run dev

# Dashboard (http://localhost:3001)
cd apps/dashboard && npm install && npm run dev -- --port 3001
```

---

## Funnel Steps

| Step | Event | When fired |
|------|-------|------------|
| 1 | `quiz_start` | On load of `/` — once per new browser session (refresh-safe) |
| 2 | `email_view` | On load of `/email` — user reached the email form |
| 3 | `paywall_view` | On load of `/paywall` — user reached the paywall step |
| 4 | `buy_click` | On click of **Buy Now** on `/paywall` |

---

## Testing the Funnel

### New user
```
http://localhost:3000/?utm_source=google&utm_campaign=test1
```
1. Land on the page → `quiz_start` tracked automatically (new session)
2. Click **Start Quiz** → go to `/email`
3. Enter a **new** email → user created, first touch recorded → redirected to `/paywall`
4. Click **Buy Now** → `buy_click` tracked

### Returning user (remarketing test)
```
http://localhost:3000/?utm_source=facebook&utm_campaign=retarget
```
1. Land on the page → `quiz_start` tracked (new session, last touch updated to `facebook`)
2. Click **Start Quiz** → go to `/email`
3. Enter the **same** email → user identified, last touch updated
   - **Hasn't purchased** → goes to `/paywall` again (no duplicate user created)
   - **Already purchased** → bypasses paywall → redirected to `/product`

### Resume flow
If a user previously reached `/email` or `/paywall`, they see **"Continue where you left off"** on the homepage. Choosing "Start over" resets progress and starts a new session.

### Funnel completion
After `buy_click`, local state is cleared (`funnel_progress` removed from `localStorage`, `funnel_user_id` / `funnel_user_email` remain in `sessionStorage` for the current tab). The user can start a new funnel pass at any time — each new pass gets a new `session_id` and is counted independently in the analytics.

### Check analytics
```
http://localhost:3001
```
Sign in with `DASHBOARD_ADMIN_USER` / `DASHBOARD_ADMIN_PASSWORD` → view funnel, conversions, attribution.

---

## Deploy to Vercel

Deploy each app as a separate Vercel project. In each project set **Root Directory**:

| Project | Root Directory |
|---------|---------------|
| Quiz | `apps/quiz` |
| Dashboard | `apps/dashboard` |

Set environment variables per app (see section above).

---

## Architecture & Key Decisions

| Decision | Rationale |
|----------|-----------|
| **Monorepo, two apps** | Quiz and dashboard deploy independently; separate scaling, separate secrets |
| **Next.js App Router** | API routes co-located with UI — no separate backend needed |
| **Supabase** | Managed Postgres with free tier; no infra to maintain for MVP |
| **sessionStorage for UTM** | UTM params survive navigation within a tab; lost on new session (correct behaviour for attribution) |
| **session_id** | Random UUID per tab session — tracks anonymous users before email capture |
| **Publishable key server-side** | Anon key used in API routes; RLS disabled on MVP tables — acceptable trade-off |
| **Username + password → Bearer token** | Credentials validated server-side; token stored in sessionStorage for subsequent requests |
| **First touch stored on user** | Written once at registration; never overwritten — correct first-touch attribution |
| **Last touch from latest event** | Queried dynamically — always reflects the most recent session's source |

### Trade-offs

#### Auth & Security
- **No real auth** — dashboard uses a single username/password checked server-side; token stored in `sessionStorage`. Sufficient for one-person MVP, not multi-user production.
- **No email verification** — any string that passes format validation is accepted as identity. Anyone entering another user's email gets redirected to `/product`. Acceptable for MVP; fix with magic-link (e.g. Resend) before going public.
- **RLS disabled** — Supabase anon key is used in API routes with `allow_all` policies. Any client with the key can read/write all rows. Add proper RLS policies before going public.
- **Client-side guards** — `/email` and `/paywall` guards read `sessionStorage` in the browser. Can be bypassed by manually setting values in DevTools. Not a real security issue since there's no actual payment processing.
- **Email page = lightweight user identification** — returning users who have saved progress (`funnel_progress` in `localStorage`) are sent back to `/email`, not directly to `/paywall`. The email step acts as an identification gate: the user re-enters their email so the system knows who they are before reaching the payment screen. It does not prove ownership of the inbox — a production alternative would use a magic-link (e.g. Resend) for real verification. For this MVP, re-entry of email is sufficient to associate a session with an existing user record.
- **Edge case: user reached `/email`, left, came back without paying** — on return they see the resume flow ("Continue where you left off") and are sent back to `/email` to re-verify. This is required: `/paywall` has a `funnel_user_id` guard — without re-entering email there is no user identity in `sessionStorage`, so jumping directly to paywall is impossible. Once re-verified, the user lands on `/paywall?resumed=true` which shows a "You're one step away" banner.

#### Funnel Tracking
- **`quiz_start` fires once per session, not per click** — tracked on homepage load only for new browser sessions (i.e. no `session_id` in `sessionStorage`). Page refreshes do not create a new event. A new `session_id` is generated on "Start over", so every deliberate pass through the funnel counts as a new session.
- **`email_view` fires on page view** — represents "user reached the email step", not "user submitted email". This is the standard top-of-form metric (analogous to GA4's page_view for that step).
- **Every funnel pass counts independently** — the assignment explicitly states "every new pass from start to finish is a separate pass, regardless of whether the email is new or existing." For this reason, returning users from the same browser are not deduplicated at the funnel level: each time a user clicks "Start Quiz" a new `session_id` is issued and a new pass is tracked. A possible alternative would be to cache the user's identity in `localStorage` and skip re-tracking known users — but that would contradict the stated requirement and would make remarketing attribution harder to measure.
- **Step-to-step conversion rates** — each rate is calculated relative to the previous step (Email→Paywall divides by Email count, Paywall→Buy divides by Paywall count), not relative to Quiz View.
- **First-touch attribution per session** — source breakdown attributes each session to its first UTM source only. Prevents one session from inflating multiple source rows if UTM params change mid-session.
- **Funnel chart labels** — when a block is too narrow to fit text inside (below ~55px height), labels render above the block in the matching colour.

#### Storage & State
- **`anonymous_id` in localStorage** — survives browser restarts and links anonymous events to the eventual user. Lost on incognito mode or another device; not a concern for MVP-level attribution accuracy.
- **`user_id` in sessionStorage** — ties paywall events to a user within a tab. Lost on tab close; not restored automatically. On resume, user identity is re-established by re-entering email on the `/email` page, which sets `funnel_user_id` in sessionStorage again. Direct navigation to `/paywall` in a new tab (without going through `/email`) redirects to `/`.
- **UTM in sessionStorage** — survives page reloads within a tab but lost if the user opens a new tab. Correct behaviour for last-touch attribution; first touch is persisted to the DB on signup.
- **Funnel resume in localStorage** — progress (`email` / `paywall` step) saved to localStorage so returning users can continue. Lost on incognito or clearing browser data. Resume is opt-in: user sees "Continue" and "Start over" buttons.

#### Infrastructure & Scale
- **No real payment processing** — the Buy button tracks a `buy_click` event only. No Stripe or payment gateway integration. Suitable for measuring purchase intent; add a real payment provider before charging users.
- **In-memory rate limiting** — resets per serverless cold start. Fine for low-traffic MVP; replace with Redis/Upstash for production.
- **Live aggregate queries** — dashboard counts are computed from raw events on every request. Fine up to ~50k events; add materialised views or a caching layer (Redis) beyond that.
- **Supabase free tier limits** — capped at ~60 DB connections and 500 MB storage. Handles up to ~5–10k users without changes. At scale: enable Supabase Pooler, upgrade to Pro ($25/mo).
