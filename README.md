# Vastrika

Fashion portfolio and admin panel. Anything published in the admin appears on the site the next time a page loads.

| Part | Where | Service |
|---|---|---|
| Portfolio site | repository root | Cloudflare Pages |
| Admin panel | `admin/` | Cloudflare Pages |
| Database, login, image signing | `supabase/` | Supabase |
| Images | | Cloudinary |

## Setup

### 1. Database

If you have not already done so, run `supabase/schema.sql` in the Supabase SQL Editor. Create your user under **Authentication > Users**, add its User ID to the admin list, and turn off new sign-ups:

```sql
insert into public.admins (user_id) values ('YOUR_USER_ID');
```

### 2. Local keys

Copy `.env.example` to `.env.local` and `admin/.env.example` to `admin/.env.local`, then fill in your Supabase URL and publishable key. Never use a secret or `service_role` key in these files.

### 3. Image uploads

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase secrets set CLOUDINARY_CLOUD_NAME=xxx CLOUDINARY_API_KEY=xxx CLOUDINARY_API_SECRET=xxx ADMIN_ORIGIN=http://localhost:5174
npx supabase functions deploy cloudinary-sign --no-verify-jwt
```

`ADMIN_ORIGIN` lists the addresses allowed to upload. When the admin is live, separate them with commas, for example `http://localhost:5174,https://admin.yourdomain.com`.

### 4. Run locally

```bash
npm install && npm run dev               # portfolio: http://localhost:5173
cd admin && npm install && npm run dev   # admin: http://localhost:5174
```

### 5. Deploy on Cloudflare Pages

Create two Pages projects from this repository. Both use build command `npm run build` and output folder `dist`.

| Project | Root directory | Variables |
|---|---|---|
| Portfolio | `/` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` |
| Admin | `admin` | The same two, plus `VITE_SITE_URL` |

## Editing the site

- Designs, collections, categories and posts: the admin panel
- Designer name, contact email, location, about text, craft words and services: `src/data.js`
- Portfolio styles: `src/index.css`

Until Supabase keys are set, the portfolio shows sample content from `src/data.js`.

## GitHub Pages

Pushes to `main` deploy both apps:

- Portfolio: https://vastrikabangalore.github.io/vastrika/
- Admin: https://vastrikabangalore.github.io/vastrika/admin/

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` under **Settings > Secrets and variables > Actions > Variables**. Add `https://vastrikabangalore.github.io` to the `ADMIN_ORIGIN` secret in Supabase so uploads work from the live admin.
