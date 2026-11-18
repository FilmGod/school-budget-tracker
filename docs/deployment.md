# Deployment checklist (Vercel / server)

## 1. Environment variables

Copy every key from `.env.example` into **Project Settings → Environment Variables**
(or into `.env.local` when running on a school server).

| Key | Needed | Note |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase anon/publishable key |
| `GOOGLE_SHEETS_WEBAPP_URL` | optional | Apps Script endpoint for sheet sync |
| `NEXT_PUBLIC_GOOGLE_SHEETS_WEBAPP_URL` | optional | same URL, exposed to the browser |
| `APP_PASSWORD` | yes | shared login password (teacher) |
| `ADMIN_PASSWORD` | optional | separate password for the admin account; falls back to `APP_PASSWORD` |
| `AUTH_SECRET` | **yes in production** | signs the session cookie; without it a built-in fallback secret is used |

Generate a secret with:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Changing `AUTH_SECRET` or `APP_PASSWORD` logs everybody out on next refresh — that is intended.

## 2. Storage

* Supabase is the primary store (`/api/data` reads it first).
* `src/data/db.json` is only a local fallback; serverless filesystems are read-only,
  so a failed write there is expected and harmless.
* `SET_FULL_DB` writes to both stores to keep them in sync.

## 3. Auth model

* Login posts to `/api/auth/login`, which returns an HMAC-signed cookie
  (`bwr_auth_token`, httpOnly, 12 h TTL).
* 5 wrong passwords from the same IP + username lock that key for 15 minutes.
* Middleware protects every page and API route; API routes also check the role:
  teachers may save reports and expenses, everything else needs `admin`.
* The limiter is in-memory. On a multi-instance deployment (several serverless
  workers) use a shared store (Upstash/Redis) for real protection.

## 4. After deploy

1. Open the site, log in with `admin` + `APP_PASSWORD`.
2. Check the dashboard totals match the plan.
3. `/projects` → "ซิงค์กับ Google Sheet" once to confirm the Apps Script URL works.
4. Open a report, press "ดูตัวอย่าง / พิมพ์ PDF" and confirm the A4 preview is white.
