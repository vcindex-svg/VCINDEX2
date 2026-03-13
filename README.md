# VibeMarket

A marketplace for vibe-coded tools — fully independent of Base44.
Built with **React 18 + Vite + Supabase + Tailwind CSS**.

---

## Quick Start

### 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. In your project dashboard open **SQL Editor → New query**
3. Paste the entire contents of `supabase/schema.sql` and click **Run**
4. The `tool-images` storage bucket is created automatically by the SQL

### 2 — Add environment variables

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Find both values at **Supabase Dashboard → Project Settings → API**.

### 3 — Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Make yourself an Admin

After creating your account in the app, run this in **Supabase SQL Editor** (replace the email):

```sql
update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'
where email = 'your@email.com';
```

Then log out and back in — you will see the Admin Dashboard link.

---

## Deploy

### Vercel (recommended)
```bash
npm i -g vercel
vercel --prod
```
Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Environment Variables in the Vercel dashboard.

### Netlify
```bash
npm run build
# drag-and-drop the dist/ folder at app.netlify.com/drop
```

### Any static host / VPS
```bash
npm run build
npx serve dist     # or copy dist/ to your web root
```

---

## Project Structure

```
src/
├── api/
│   └── base44Client.js    # Supabase compatibility shim
├── lib/
│   ├── supabase.js        # Supabase client singleton
│   ├── AuthContext.jsx    # Auth state provider (Supabase Auth)
│   └── PageNotFound.jsx
├── pages/
│   ├── Home.jsx
│   ├── Marketplace.jsx
│   ├── CreatorDashboard.jsx
│   ├── CreatorProfile.jsx
│   ├── CreatorSignup.jsx
│   ├── AdminDashboard.jsx
│   ├── MyLibrary.jsx
│   ├── Login.jsx          ← new
│   └── Signup.jsx         ← new
├── components/
│   ├── marketplace/
│   └── landing/
├── utils.js               # createPageUrl helper
supabase/
└── schema.sql             # 8 tables + RLS + Storage policies
```

---

## What changed from Base44

| Before | After |
|--------|-------|
| `@base44/sdk` | `@supabase/supabase-js` |
| `@base44/vite-plugin` | Removed (plain Vite) |
| `globalThis.__B44_DB__` shim in every file | `import db from '@/api/base44Client'` |
| Base44 hosted auth | Supabase Auth (email + password) |
| Base44 entity storage | Supabase Postgres |
| Base44 file upload | Supabase Storage bucket `tool-images` |
| `VITE_BASE44_*` env vars | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` |
| `UserNotRegisteredError` component | Removed (not needed) |
