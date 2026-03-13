# Supabase Setup Guide

This portfolio uses [Supabase](https://supabase.com) for authentication, database, and image storage.
The public site works with static data even without Supabase. You only need Supabase to use the admin dashboard.

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose a name, database password, and region

---

## 2. Configure local credentials

```bash
cp config.example.js config.js
```

Open `config.js` and fill in your project URL and anon key:

```js
window.SUPABASE_URL      = 'https://YOUR_PROJECT_REF.supabase.co';
window.SUPABASE_ANON_KEY = 'your-anon-public-key-here';
```

You can find both values in **Project Settings → API**.

> `config.js` is listed in `.gitignore` — never commit it with real values.

---

## 3. Run the SQL schema

In the Supabase dashboard, go to **SQL Editor** → **New query**, paste the full contents of `supabase-schema.sql`, and click **Run**.

This creates the `profiles`, `projects`, and `articles` tables with all triggers, indexes, and Row Level Security policies.

---

## 4. Create your admin user

1. In Supabase dashboard → **Authentication → Users** → **Invite user** (or Add user)
2. Enter your email and set a password
3. In **SQL Editor**, run:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

---

## 5. Create the storage bucket

1. In Supabase dashboard → **Storage** → **New bucket**
2. Name: `portfolio-images`
3. Make it **public**

The RLS policies already in `supabase-schema.sql` handle admin-only write access.

---

## 6. Deploy to GitHub Pages

Push your code to GitHub. Make sure `config.js` is **not** committed (it is gitignored).

**For GitHub Pages:** Because `config.js` is gitignored, you need to either:
- **Option A (recommended):** Set up a GitHub Actions workflow that injects `config.js` from repository secrets before deploying
- **Option B (simpler):** Use a private repository and commit `config.js` only on the deploy branch

The simplest "just works" approach: keep your repo private, add `config.js` to git, and push.
The anon key is safe to expose — all security is enforced via Supabase RLS on the server.

---

## 7. Access the admin dashboard

Navigate to `/login.html` → log in with your admin email/password → you'll be redirected to `/admin-dashboard.html`.

---

## Security checklist

- [x] Anon key is the only key used in the browser (never `service_role`)
- [x] Row Level Security is enabled on all tables (`profiles`, `projects`, `articles`)
- [x] Public reads limited to `published = true` rows only
- [x] Admin writes require `role = 'admin'` in `profiles` (server-side check via RLS)
- [x] Storage bucket: public read, admin-only write (via storage RLS policies)
- [x] Auth guard hides admin pages before session is verified (no flash of unauthorized content)
- [x] `config.js` is gitignored — never commit real credentials to a public repo
- [x] Login redirect validates `?next=` to prevent open redirect attacks
- [x] All user-supplied content escaped with `escHtml()` before DOM insertion
