# Honey Admin Panel

Shared storefront API on **port 5000**; admin UI on **port 3001**.

## Folders
- `Honey_admin_UI` — Vite React admin
- Admin API routes live in `original_partyBox_new_api/src/v1/admin/` → `/api/admin/*`

## Setup

```bash
# API (same as storefront)
cd original_partyBox_new_api
npm install
npm run seed:demo      # catalog + demo customer + admin user
npm run seed:admin     # upsert admin@thunayanhoney.com / Admin@123
npm run dev            # :5000

# Admin UI
cd Honey_admin_UI
npm install
npm run dev            # :3001
```

Open http://localhost:3001  
Login: `admin@thunayanhoney.com` / `Admin@123`

> If login says **Invalid admin credentials**, your DB likely lost the admin user
> (e.g. after an older `seed:demo` wipe). Run `npm run seed:admin` and retry.
> Current `seed:demo` also recreates the admin user automatically.

## Modules
Dashboard, Users, Categories, Products, Orders, Transactions, Promocodes, CMS, Banners, Reviews, Settings, Shipping (country/state/city), Contact, Reports.

## Auth
- Admin `user_type` = `1` (or `2`)
- Storefront customers remain `user_type` = `4`
- Header: `token: Bearer <jwt>`

## Staging URLs
| App | URL |
|-----|-----|
| Storefront | https://ecdemo.indiprotechnologies.com/ |
| Admin | https://ecadmin.indiprotechnologies.com/ |
| API | https://ecdemoapi.indiprotechnologies.com/ |

Env templates (copy to `.env` on each server, then rebuild/restart):
- API: `original_partyBox_new_api/.env.staging.example`
- Admin: `Honey_admin_UI/.env.staging.example`
- Storefront: `original_HoneyEcommerce_new_ui/.env.staging.example`

Critical:
- API `API_URL` + `DASHBOARD_URL` = API host (not admin)
- Admin `VITE_API_BASE` must end with `/api/admin`
- Storefront `VITE_BASE_URL` must end with `/api`
- Set the same `APP_SECRECT_KEY` / `VITE_SECRECT_KEY` on API + storefront
- After changing Vite env, rebuild (`npm run build`) — env is baked at build time
- `cloud/uploads` is **not** in git. On staging, if images 404, run on the API server:
  `npm run seed:images` (safe — does not wipe DB). Or upload via Admin.
