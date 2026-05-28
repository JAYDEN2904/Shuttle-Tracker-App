# Supabase Remote Setup Guide

Project: **UG Shuttle Tracker** (`dovoztlejhywnwbenrym`)  
URL: `https://dovoztlejhywnwbenrym.supabase.co`

This document covers post-migration configuration for auth and admin access. Mock mode remains enabled in the apps until you explicitly disable it.

---

## Database Status

Applied migrations:

| Migration | Description |
|-----------|-------------|
| `001_initial_schema` | 7 core tables |
| `002_rls_policies` | RLS + `get_user_role()` |
| `003_realtime` | Realtime on `shuttles`, `shuttle_locations` |
| `004_driver_login_helper` | `get_driver_email()` RPC |
| `005_auth_profile_trigger` | Auto-create student profile on signup |
| `006_revoke_trigger_function_execute` | Block direct RPC calls to trigger function |

Seed data: **2 routes**, **12 stops** (7 on Route A, 5 on Route B).

---

## Google OAuth Configuration

Required before student Google sign-in works (when mock mode is off).

### Step 1 — Google Cloud Console

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Under **Authorized redirect URIs**, add:
   ```
   https://dovoztlejhywnwbenrym.supabase.co/auth/v1/callback
   ```
4. Copy the **Client ID** and **Client Secret**

Optional: restrict to `@ug.edu.gh` in Google Workspace settings for defense in depth. The mobile app also enforces this client-side via `hd: "ug.edu.gh"`.

### Step 2 — Supabase Auth Provider

1. [Supabase Dashboard](https://supabase.com/dashboard/project/dovoztlejhywnwbenrym/auth/providers) → **Authentication → Providers → Google**
2. Enable Google
3. Paste **Client ID** and **Client Secret**
4. Save

### Step 3 — URL Configuration

Dashboard → **Authentication → URL Configuration**:

| Setting | Value |
|---------|-------|
| Site URL | `http://localhost:3001` (update for production) |
| Redirect URLs | `shuttle://` |
| | `http://localhost:3001/**` |
| | `exp://**` |

The mobile app uses `makeRedirectUri({ scheme: "shuttle" })` for OAuth callbacks.

---

## Admin Account Bootstrap (Manual)

Do this when you're ready to sign into the admin dashboard with real Supabase auth.

### Step 1 — Create auth user

Dashboard → **Authentication → Users → Add user**

- Email: your `@ug.edu.gh` admin address
- Password: strong password
- Auto Confirm User: **Yes**

The `on_auth_user_created` trigger automatically creates a `profiles` row with `role = 'student'`.

### Step 2 — Promote to admin

Run in the SQL Editor (or via MCP `execute_sql`):

```sql
UPDATE public.profiles
SET role = 'admin', name = 'Your Name'
WHERE email = 'your-admin@ug.edu.gh';
```

### Step 3 — Verify

1. Set `NEXT_PUBLIC_USE_MOCK_DATA=false` in `.env`
2. Restart the admin dev server
3. Sign in at `http://localhost:3001/login`

---

## Driver Account Creation

Drivers are **not** seeded. Create them via the admin dashboard once mock mode is off:

1. Admin signs in with real Supabase auth
2. Go to **Drivers** → **Add Driver**
3. The server action uses the service role to create the auth user + profile + optional shuttle assignment

Driver login flow (mobile):

1. App calls `get_driver_email(employee_id)` (anon RPC)
2. App signs in with returned email + 4-digit PIN

---

## Switching Off Mock Mode (Later)

When ready to connect apps to Supabase:

```env
EXPO_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_USE_MOCK_DATA=false
```

Ensure `.env` has:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (admin server actions only)

---

## Security Notes

- **`get_driver_email` is callable by anon** — intentional for driver PIN login; returns email only
- **`get_user_role` is authenticated-only** — used internally by RLS policies
- **`handle_new_user` is trigger-only** — direct RPC access revoked in migration 006
- Never commit real secrets; keep `.env` gitignored
