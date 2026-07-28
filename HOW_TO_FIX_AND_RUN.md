# How to fix and run the Honey Ecommerce site (dummy data)

> **Priority:** Get the site running first. ESLint warnings do **not** stop the app (webpack already compiled). The real blockers are the backend DB column error and missing assets.

---

## Why the site shows "Something went wrong" (Error 500)

Two things are happening together:

1. **Backend crash (root cause)**  
   API on `:5000` queries `settings` for column `minimumProductQuantityToNotify`, but that column does **not** exist in MySQL → settings API fails → frontend error page.

2. **Broken 500 image**  
   Error page tries to load `http://localhost:5000/public/images/img-500.png` → 404 / ORB. That is a symptom, not the root cause.

---

## STEP 0 — Put the real code in this repo

This GitHub repo currently only has **empty git submodule stubs**:

- `original_HoneyEcommerce_new_ui` (frontend, CRA on `:3000`)
- `original_partyBox_new_api` (backend on `:5000`)

There is no `.gitmodules` and the submodule remotes are not available here.  
Until you push/copy the real UI + API source into those folders (or fix submodule URLs), agents cannot apply code patches.

**What you should do locally:**

```bash
# Option A: copy your local projects into the repo folders
cp -R /path/to/HoneyEcommerce_new_ui/* original_HoneyEcommerce_new_ui/
cp -R /path/to/partyBox_new_api/* original_partyBox_new_api/

# Option B: add proper submodules (replace URLs with your real remotes)
git submodule add <UI_REPO_URL> original_HoneyEcommerce_new_ui
git submodule add <API_REPO_URL> original_partyBox_new_api
git submodule update --init --recursive
```

Then commit and push so cloud agents can fix code in-repo.

---

## STEP 1 — Fix the backend DB error (do this first)

### Error

```text
Unknown column 'minimumProductQuantityToNotify' in 'field list'
```

Query selects from `settings`:

- `tax_percentage`
- `minimumProductQuantityToNotify`
- `adminEmailAddress`
- `sendOutOfStockNotification`

### Fix options (pick one)

#### Option A — Add the missing column (recommended for real DB)

```sql
ALTER TABLE settings
  ADD COLUMN minimumProductQuantityToNotify INT NOT NULL DEFAULT 5;

-- Optional related columns if also missing:
ALTER TABLE settings
  ADD COLUMN adminEmailAddress VARCHAR(255) NULL,
  ADD COLUMN sendOutOfStockNotification TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN tax_percentage DECIMAL(5,2) NOT NULL DEFAULT 0;
```

Then restart the API.

#### Option B — Soften the query so missing columns don’t crash

In the API settings model/service (wherever that SELECT is built), either:

- remove `minimumProductQuantityToNotify` from the field list temporarily, or
- use a fallback / try-catch and return dummy settings JSON.

Dummy settings example:

```json
{
  "tax_percentage": 15,
  "minimumProductQuantityToNotify": 5,
  "adminEmailAddress": "admin@example.com",
  "sendOutOfStockNotification": false
}
```

#### Option C — Recreate / migrate DB

If the project has migrations/seed SQL, run them so schema matches the code:

```bash
# examples — use whatever this API uses
npm run migrate
# or
npx sequelize-cli db:migrate
# or import schema.sql / dump.sql
```

---

## STEP 2 — Add the missing 500 image (and other static images)

Create the file the error page expects:

```text
original_partyBox_new_api/public/images/img-500.png
```

Or change the frontend error component to load a local image from the React `public/` folder instead of `:5000`:

```jsx
// instead of http://localhost:5000/public/images/img-500.png
<img src="/images/img-500.png" alt="Error" />
```

and put the file in:

```text
original_HoneyEcommerce_new_ui/public/images/img-500.png
```

For product thumbnails, put placeholder images under the API public images folder (or CDN path your app already uses), e.g.:

```text
public/images/products/dummy-1.jpg
public/images/products/dummy-2.jpg
public/images/products/dummy-3.jpg
```

---

## STEP 3 — Seed dummy data so the shop has content

Insert at least:

1. **settings** (one row)
2. **categories**
3. **products** (+ images / variants if required)
4. optional **banners / home sections**

Example seed (adjust table/column names to your schema):

```sql
INSERT INTO settings (tax_percentage, minimumProductQuantityToNotify, adminEmailAddress, sendOutOfStockNotification)
VALUES (15, 5, 'admin@example.com', 0)
ON DUPLICATE KEY UPDATE tax_percentage = VALUES(tax_percentage);

INSERT INTO categories (name, slug, isActive) VALUES
('Honey', 'honey', 1),
('Gifts', 'gifts', 1);

INSERT INTO products (name, slug, price, quantity, categoryId, image, isActive) VALUES
('Wildflower Honey 500g', 'wildflower-honey-500g', 49.00, 100, 1, '/public/images/products/dummy-1.jpg', 1),
('Acacia Honey 250g', 'acacia-honey-250g', 35.00, 80, 1, '/public/images/products/dummy-2.jpg', 1),
('Gift Box', 'gift-box', 99.00, 40, 2, '/public/images/products/dummy-3.jpg', 1);
```

If your API expects image URLs from a remote CDN, point them at local `/public/images/...` paths for local demo.

---

## STEP 4 — Run API + UI locally

```bash
# Terminal 1 — API
cd original_partyBox_new_api
cp .env.example .env   # set DB host/user/pass/name
npm install
npm run start          # usually :5000

# Terminal 2 — UI
cd original_HoneyEcommerce_new_ui
cp .env.example .env   # REACT_APP_API_URL=http://localhost:5000
npm install
npm start              # :3000
```

Verify:

- `http://localhost:5000/.../settings` (or your settings route) returns 200 JSON  
- `http://localhost:3000` loads home/products instead of Error 500  

---

## STEP 5 — Clear ESLint warnings (optional for “just run”)

Webpack already compiles with warnings. Fix these to silence the console / CI.

### Pattern A — unused import / variable

Delete unused names, or prefix intentionally kept values with `_`.

| File | Fix |
|------|-----|
| `src/App.js` | Remove unused `FB`, `Router` |
| `src/forms/signin.js` | Remove `FB`, `useLocation`, unused `facebookSignIn` |
| `src/forms/signinWithGuestOption.js` | Remove unused `facebookSignIn` |
| `src/pages/common/signin.js` | Remove unused `facebookSignIn` |
| `src/pages/common/twitterSignInLoading.js` | Remove unused `Spinner` |
| `src/pages/common/productDetails.js` | Remove unused `removeSessionID` |
| `src/pages/common/products.js` | Remove unused `removeSessionID`, `navigate` |
| `src/routes/index.js` | Remove unused `BrowserRouter` |
| `src/components/utils/productCard.js` | Remove unused `toggleShareOptions` |
| `src/pages/user/cart.js` | Remove unused `useRef` |
| `src/pages/user/checkout.js` / `checkoutTest.js` | Remove unused `useRegisterTabbywebhookMutation`, `axios` |
| `src/pages/user/myOrders.js` | Remove unused `otherProducts`, `loadingAddToCart`, `isDetailsLoading` |
| `src/pages/user/wishlist.js` | Remove unused `userInfo` |
| `src/pages/payment/tabby*.js` / `tamara*.js` | Remove unused `React`, `useCapturePaymentMutation`, `urlStatus` |

### Pattern B — duplicate object keys

`src/lang/english.js` and `src/lang/arabic.js` — duplicate `shop_now` around line 207.  
Keep **one** `shop_now` key (merge/rename the second).

`checkout.js` / `checkoutTest.js` — duplicate `total_amount` (~line 740 / 735). Keep one.

### Pattern C — `==` → `===`

In `checkout.js` / `checkoutTest.js`, change `==` to `===` at the reported lines (or `== null` → `=== null` / `== null` checks intentionally kept as `== null` only if you disable the rule for that line).

### Pattern D — self-assign

```js
// bad
data.email = data.email;

// fix: delete the line, or assign from the real source
data.email = form.email; // example
```

### Pattern E — redundant alt text

`account_blocked.js`:

```jsx
// bad
alt="Error image"

// good
alt="Account blocked"
```

### Pattern F — React Hook dependency warnings

Safer demo approach (avoid behavior changes):

```js
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [/* existing deps */]);
```

Better long-term:

- add missing deps (`navigate`, `searchParams`, etc.), or
- wrap handlers in `useCallback`, or
- extract `searchParams.get('x')` into a variable and depend on that variable.

For `productDetails.js` “complex expression in dependency array”:

```js
const productId = searchParams.get('id');
useEffect(() => { /* ... */ }, [productId]);
```

For `cart.js` `handleCalculationChange`: wrap that function in `useCallback` before other callbacks depend on it.

---

## Suggested fix order (one by one)

1. **DB column** `minimumProductQuantityToNotify` → site stops showing Error 500  
2. **Dummy settings + products + images** → shop pages have content  
3. **img-500.png** (or local alt path) → error page assets stop 404ing  
4. **Lang duplicate `shop_now`** → clean compile  
5. **Remove unused imports/vars** file by file  
6. **eqeqeq / self-assign / dupe keys** in checkout  
7. **Hook dependency warnings** last (highest risk of behavior change)

---

## Quick checklist

- [ ] Real UI + API code present in repo folders  
- [ ] MySQL has `settings.minimumProductQuantityToNotify` (or query softened)  
- [ ] API `:5000` starts without that SQL error  
- [ ] Settings endpoint returns JSON  
- [ ] Dummy products + images exist  
- [ ] UI `.env` points to `http://localhost:5000`  
- [ ] `localhost:3000` loads home/products  
- [ ] (Optional) ESLint warnings cleared  

---

## Note for Cursor Cloud agents

`honey-ercom-site` currently contains only submodule gitlinks without source. Push the actual `HoneyEcommerce_new_ui` and `partyBox_new_api` code (or fix submodule remotes) before asking an agent to apply patches automatically.
