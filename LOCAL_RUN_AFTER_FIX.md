# Local run — after this PR

## What I fixed in code (you do not need to redo these)

1. **Backend settings crash** — `getSiteInfo` no longer dies when
   `minimumProductQuantityToNotify` / `adminEmailAddress` /
   `sendOutOfStockNotification` are missing from MySQL. It retries without
   those columns and applies safe defaults.
2. **Sequelize model** — those three fields were added to `settings.js`.
3. **Placeholder images** under `original_partyBox_new_api/assets/images/`
   (`img-500.png`, `login-image.png`, `poster.png`, `no_image_available.png`,
   dummy products, etc.) and UI copies under
   `original_HoneyEcommerce_new_ui/public/images/`.
4. **Error page image fallback** — if API assets URL fails, UI loads
   `/images/img-500.png` from the React public folder.

## What you still run once on your machine (DB only)

Your MySQL lives on your PC/server, not in this cloud agent. Run:

```bash
mysql -u YOUR_USER -p YOUR_DATABASE < original_partyBox_new_api/sql/fix_settings_columns.sql
```

Then restart the API. Clear Redis key `site_settings` if settings were cached:

```bash
redis-cli DEL site_settings
```

## Restart locally

```bash
# API
cd original_partyBox_new_api
# ensure .env has DATABASE_* , API_URL=http://localhost:5000/ , PORT=5000
npm install
npm start

# UI
cd original_HoneyEcommerce_new_ui
# ensure .env has:
# REACT_APP_BASE_URL=http://localhost:5000/api/
# REACT_APP_ASSETS_URL=http://localhost:5000/public
npm install
npm start
```

Open `http://localhost:3000` — home should load instead of Error 500.

## If Header crashes with `Cannot read properties of undefined (reading 'Category')`

Pull latest `main`. That crash was empty `categories` in Header; it is guarded now.

## If images fail with `ERR_CERT_COMMON_NAME_INVALID` for api.thunyanhoneyuae.com

Your UI/API `.env` is still pointing at production. Set local URLs:

```bash
# UI .env
REACT_APP_BASE_URL=http://localhost:5000/api/
REACT_APP_ASSETS_URL=http://localhost:5000/public

# API .env
API_URL=http://localhost:5000/
NODE_ENV=development
```

Restart both servers after changing `.env`.
