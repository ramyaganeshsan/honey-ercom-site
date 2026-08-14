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
