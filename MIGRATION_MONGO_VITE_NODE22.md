# MongoDB + Vite + Node 22 migration

## What changed

| Layer | Before | After |
|-------|--------|-------|
| Database | MySQL 8 + Sequelize | MongoDB + Mongoose |
| Public IDs | numeric AUTO_INCREMENT | same numeric IDs via `counters` collection |
| API runtime | Node (various) | Node **>= 22** |
| Storefront | CRA (`react-scripts`) | **Vite 6** (exact same UI/CSS/assets) |
| Passwords | MD5 only | MD5 + `originalPassword` (plain) |
| OTP | hashed `otp` | hashed `otp` + plain `original_otp` |

## Design parity

The Vite conversion keeps the existing React components, CSS, jQuery/Owl carousels, EN/AR i18n, and public assets. No visual redesign.

## Local setup

### API (`original_partyBox_new_api`)

```bash
cp envformat.txt .env   # if needed
npm install
# start MongoDB locally, then:
npm run seed:demo
npm run dev             # port 5000
```

`.env` essentials:

```
MONGODB_URI=mongodb://127.0.0.1:27017/honey_ecommerce
API_URL=http://localhost:5000/
DASHBOARD_URL=http://localhost:5000/
JWT_SECRECT=local-dev-jwt-secret
NODE_ENV=development
```

`API_URL` must **not** end with `/public`.

Demo user after seed: `demo@thunayanhoney.com` / `Demo@123`

### UI (`original_HoneyEcommerce_new_ui`)

```bash
npm install
npm run dev             # Vite on port 3000
```

`.env`:

```
VITE_BASE_URL=http://localhost:5000/api
VITE_ASSETS_URL=http://localhost:5000/public
VITE_FRONT_END_BASE_URL=http://localhost:3000
VITE_SECRECT_KEY=local-dev-secret
```

## Notes

- Redis is optional; the API starts without it.
- Sequelize models remain under `src/v1/models/` for reference; runtime uses `src/v1/mongo/`.
- `checkout` and `checkoutTest` both remain.
- **All ~73 collections** are registered as Mongoose models. `npm run seed:demo` creates every collection in MongoDB (so Compass shows them). Demo documents are loaded for catalog/auth/geo/cms; other collections stay empty until the app writes to them (cart, orders, OTP, etc.).
- UI `VITE_BASE_URL` must be `http://localhost:5000/api` (include `/api`). Wrong value causes `http://localhost:5000//home/` 404.
