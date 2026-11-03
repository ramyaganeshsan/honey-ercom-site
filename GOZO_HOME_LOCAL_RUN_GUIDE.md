# GOZO HOME — Full local run guide

This is the **only guide you need**. It explains, in plain writing, how to install and run all three parts of the GOZO HOME project on your own computer:

1. **API** (backend server + database)
2. **Website** (customer shop / storefront)
3. **Admin** (staff control panel)

Follow the sections in order the first time. After that, use **Section 6 (Everyday start)** only.

---

## How the system works (simple explanation)

Think of three separate programs that talk to each other:

- The **API** is the brain. It stores products, users, orders, and images in **MongoDB**. It listens on port **5000**.
- The **Website** is what customers see. It asks the API for data. It opens at http://localhost:3000
- The **Admin** is what staff use to manage products, orders, banners, and settings. It opens at http://localhost:3001

Important rule: **start MongoDB first, then the API, then Website and/or Admin.**  
If the API is not running, both Website and Admin will fail to load data or login.

You will normally keep **three terminal / command windows** open (one for API, one for Website, one for Admin). MongoDB usually runs in the background as a Windows/macOS/Linux service.

---

## Folder map (what is in the source)

After you unzip or clone the project, you should see these important folders/files:

```text
GOZO_HOME_LOCAL_RUN_GUIDE.md          ← this written guide
original_partyBox_new_api/            ← API (backend)
original_HoneyEcommerce_new_ui/       ← Website (storefront)
Honey_admin_UI/                       ← Admin panel
```

| App | Folder name | Local address | Purpose |
|-----|-------------|---------------|---------|
| API | `original_partyBox_new_api` | http://localhost:5000 | Backend JSON API + uploaded images |
| Website | `original_HoneyEcommerce_new_ui` | http://localhost:3000 | Customer shopping site |
| Admin | `Honey_admin_UI` | http://localhost:3001 | Staff management panel |

Opening http://localhost:5000 in a browser is **not** the shop. The shop is port **3000**. The admin panel is port **3001**.

---

## Section 1 — Install software on your computer (one time)

Do this once per computer before running any app.

### 1.1 Install Node.js version 22 or newer

All three apps require **Node.js 22+**.

| Software | Required version | Notes |
|----------|------------------|-------|
| Node.js | **22 LTS** (or any version 22 and above) | Do not use Node 18 or 20 |
| npm | Comes with Node (usually 10.x) | Used to install and start apps |

**Check your version** (open Terminal / Command Prompt / PowerShell):

```bash
node -v
npm -v
```

You want something like `v22.23.4` for Node. If you see `v18` or `v20`, upgrade.

**How to install:**

- Windows or macOS: download **Node.js 22 LTS** from https://nodejs.org/ and run the installer.
- macOS with Homebrew:

```bash
brew install node@22
```

- Linux (example with nvm):

```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# close and reopen terminal, then:
nvm install 22
nvm use 22
```

### 1.2 Install MongoDB Community

The API stores all data in MongoDB.

| Item | Value |
|------|--------|
| Recommended version | MongoDB Community **7.0** (6.0 or 8.0 also fine) |
| Default address | `127.0.0.1` port **27017** |
| Database name used by this project | `honey_ecommerce` (created automatically when you seed) |

**How to install:**

- Windows: download MongoDB Community from https://www.mongodb.com/try/download/community  
  During setup, keep **Install MongoDB as a Service** checked so it starts automatically.
- macOS:

```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

- Ubuntu/Linux: install MongoDB Community 7 using MongoDB’s official docs, then start it:

```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Check MongoDB is running:**

```bash
mongosh --eval "db.runCommand({ ping: 1 })"
```

If `mongosh` is not found, try:

```bash
mongo --eval "db.runCommand({ ping: 1 })"
```

A successful ping means MongoDB is ready.

Optional: install **MongoDB Compass** (a visual tool) from the same download page if you want to browse data later.

### 1.3 Redis — not required for local use

You do **not** need Redis for local development.  
When `NODE_ENV=development`, the API skips Redis automatically.

### 1.4 Optional tools

- **Git** — only if you clone from GitHub instead of using a zip.
- **VS Code / Cursor** — nice for editing, not required just to run.

---

## Section 2 — API setup and run (`original_partyBox_new_api`)

This is the backend. Website and Admin both depend on it.

### What this app uses

| Piece | Version / note |
|-------|----------------|
| Node.js | 22 or newer |
| Express | 4.x |
| Mongoose (MongoDB driver) | 8.x |
| Default port | **5000** |
| Database | MongoDB `honey_ecommerce` |

### Step 2.1 — Create the API environment file

Open a terminal and go into the API folder:

```bash
cd original_partyBox_new_api
cp .env.example .env
```

Open the new `.env` file and make sure it contains at least:

```env
PORT=5000
JWT_SECRECT=local-dev-jwt-secret
MONGODB_URI=mongodb://127.0.0.1:27017/honey_ecommerce
DATABASE_NAME=honey_ecommerce
LOG_BACKUP=15d
NODE_ENV=development
DASHBOARD_URL=http://localhost:5000/
API_URL=http://localhost:5000/
APP_SECRECT_KEY=local-dev-secret
TOKEN=
```

**Read these rules carefully:**

1. `API_URL` and `DASHBOARD_URL` must point to the **API** (`http://localhost:5000/`), not to Admin or Website.
2. Do not put `/public` at the end of `API_URL`.
3. `APP_SECRECT_KEY` must be the **same string** as the Website’s `VITE_SECRECT_KEY`.
4. `JWT_SECRECT` must be set. If it is missing, login may look successful but return **no token**, and Admin/Website login will fail.

### Step 2.2 — Install API packages

Still inside `original_partyBox_new_api`:

```bash
npm install
```

Wait until it finishes without errors.

### Step 2.3 — Load demo data (first time only)

MongoDB must already be running.

```bash
npm run seed:demo
```

What this does:

- Creates categories, products, banners, settings, and related demo data
- Creates the admin user and a demo customer
- Copies sample product/banner images into `cloud/uploads`

Useful extra commands:

```bash
npm run seed:admin      # recreate/fix admin login only
npm run seed:images     # restore placeholder images only (does not wipe database)
```

### Demo logins created by seed

| Where to use | Email | Password |
|--------------|-------|----------|
| Admin panel | `admin@gozohome.com` | `Admin@123` |
| Website (customer) | `demo@gozohome.com` | `Demo@123` |

### Step 2.4 — Start the API

```bash
npm run dev
```

(`npm run dev` restarts automatically when code changes. You can also use `npm start`.)

Leave this terminal window open. The API should now listen on port **5000**.

You should see a message that the server started / is listening. If it crashes, check:

- MongoDB is running
- `.env` exists and `MONGODB_URI` is correct
- Port 5000 is not already used by another program

### API commands cheat sheet

| Command | Meaning |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Start API in development mode (port 5000) |
| `npm start` | Start API normally |
| `npm run seed:demo` | Full demo catalog + users + sample images |
| `npm run seed:admin` | Create/update admin user only |
| `npm run seed:images` | Put placeholder images back into `cloud/uploads` |

---

## Section 3 — Website setup and run (`original_HoneyEcommerce_new_ui`)

This is the customer-facing shop.

### What this app uses

| Piece | Version / note |
|-------|----------------|
| Node.js | 22 or newer |
| React | 18.x |
| Vite | 6.x |
| Default port | **3000** |

### Step 3.1 — Create the Website environment file

Open a **new** terminal (keep the API terminal running):

```bash
cd original_HoneyEcommerce_new_ui
cp .env.example .env
```

Make sure `.env` contains:

```env
VITE_BASE_URL=http://localhost:5000/api
VITE_ASSETS_URL=http://localhost:5000/public
VITE_SITE_NAME=GOZO HOME
VITE_SECRECT_KEY=local-dev-secret
VITE_GOOGLE_CLIENT_ID=
VITE_GOOGLE_REDIRECTURL=http://localhost:3000
VITE_FACEBOOK_APP_ID=
VITE_FACEBOOK_REDIRECTURL=http://localhost:3000
VITE_FRONT_END_BASE_URL=http://localhost:3000
```

**Rules:**

1. `VITE_BASE_URL` must end with `/api` exactly: `http://localhost:5000/api`
2. `VITE_SECRECT_KEY` must match API `APP_SECRECT_KEY` (both `local-dev-secret` for local)
3. Product/banner images come from the API. Theme icons/CSS come from the Website `public` folder.

### Step 3.2 — Install and start the Website

```bash
npm install
npm run dev
```

Then open your browser to:

**http://localhost:3000**

Customer demo login:

- Email: `demo@gozohome.com`
- Password: `Demo@123`

### Website commands cheat sheet

| Command | Meaning |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` or `npm start` | Start Website on port 3000 |
| `npm run build` | Build production files into `build/` |
| `npm run preview` | Preview the production build |

---

## Section 4 — Admin setup and run (`Honey_admin_UI`)

This is the staff panel for products, orders, banners, settings, etc.

### What this app uses

| Piece | Version / note |
|-------|----------------|
| Node.js | 22 or newer |
| React | 19.x |
| Vite | 8.x |
| Default port | **3001** |

### Step 4.1 — Create the Admin environment file

Open another **new** terminal:

```bash
cd Honey_admin_UI
cp .env.example .env
```

Make sure `.env` contains:

```env
VITE_API_BASE=http://localhost:5000/api/admin
VITE_SECRECT_KEY=local-dev-secret
```

Optional line (usually not needed locally):

```env
VITE_DASHBOARD_URL=http://localhost:5000/
```

**Rules:**

1. `VITE_API_BASE` must end with `/api/admin`
2. The API must already be running on port 5000 before you try to log in
3. If you change env values and later use `npm run build`, rebuild after changing env (Vite bakes values at build time)

### Step 4.2 — Install and start Admin

```bash
npm install
npm run dev
```

Open your browser to:

**http://localhost:3001**

Admin login:

- Email: `admin@gozohome.com`
- Password: `Admin@123`

If login says **Invalid admin credentials**, go to the API folder and run:

```bash
cd original_partyBox_new_api
npm run seed:admin
```

Then try logging in again.

### What you can manage in Admin

After login you can use modules such as: Dashboard, Users, Categories, Products (including Excel bulk upload), Orders, Transactions, Promocodes, CMS, Banners, Reviews, Settings, Shipping, Contact, Reports.

### Admin commands cheat sheet

| Command | Meaning |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Start Admin on port 3001 |
| `npm run build` | Build production files |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run Oxlint checks |

---

## Section 5 — First-time checklist (do once)

Use this checklist the first time you set up a machine:

1. Install Node.js **22+** and confirm with `node -v`
2. Install MongoDB and confirm it is running
3. In API folder: copy `.env`, run `npm install`, run `npm run seed:demo`, run `npm run dev`
4. In Website folder: copy `.env`, run `npm install`, run `npm run dev`, open http://localhost:3000
5. In Admin folder: copy `.env`, run `npm install`, run `npm run dev`, open http://localhost:3001
6. Log into Admin with `admin@gozohome.com` / `Admin@123`
7. Log into Website with `demo@gozohome.com` / `Demo@123`

If all of that works, setup is complete.

---

## Section 6 — Everyday start (after first setup)

Every later day, start in this order:

**1. Make sure MongoDB is running** (service should already be on).

**2. Terminal A — API**

```bash
cd original_partyBox_new_api
npm run dev
```

**3. Terminal B — Website**

```bash
cd original_HoneyEcommerce_new_ui
npm run dev
```

**4. Terminal C — Admin**

```bash
cd Honey_admin_UI
npm run dev
```

**5. Open in browser**

| App | URL |
|-----|-----|
| Website | http://localhost:3000 |
| Admin | http://localhost:3001 |
| API (backend only) | http://localhost:5000 |

To stop an app: click that terminal and press `Ctrl+C`.

You do **not** need to run `seed:demo` again every day unless you wiped the database.

---

## Section 7 — Version summary for IT / developers

| Software | Required version | Used by |
|----------|------------------|---------|
| Node.js | 22 or newer (22 LTS recommended) | API, Website, Admin |
| npm | 10.x (comes with Node 22) | All three |
| MongoDB | 7.x recommended (6 or 8 OK) | API only |
| Redis | Not required locally | Skipped in development |
| Express | 4.x | API |
| Mongoose | 8.x | API |
| React | 18.x on Website, 19.x on Admin | Frontends |
| Vite | 6.x on Website, 8.x on Admin | Frontends |

---

## Section 8 — Troubleshooting (written fixes)

### Shop is empty / Admin cannot log in / “network error”

Check in this order:

1. Is MongoDB running? (`mongosh` ping)
2. Is the API running in a terminal on port 5000?
3. Did you run `npm run seed:demo` at least once?
4. Website `.env` has `VITE_BASE_URL=http://localhost:5000/api`
5. Admin `.env` has `VITE_API_BASE=http://localhost:5000/api/admin`

### Port already in use

Something else is using 5000, 3000, or 3001.

Linux/macOS:

```bash
lsof -i :5000
lsof -i :3000
lsof -i :3001
```

Windows: use Task Manager, or `netstat -ano` in Command Prompt, then end the old process.

### Product or banner images show broken / 404

Image files live in `original_partyBox_new_api/cloud/uploads/` and are **not** stored in git.

Fix:

```bash
cd original_partyBox_new_api
npm run seed:images
```

Also confirm API `.env` has:

```env
DASHBOARD_URL=http://localhost:5000/
```

Then restart the API.

### Login succeeds but no token / Admin says no token returned

In API `.env`, set:

```env
JWT_SECRECT=local-dev-jwt-secret
```

Restart the API and try again.

### Browser console shows CORS errors

With the default localhost ports this should not happen. If you changed hosts or ports, add this to API `.env` and restart API:

```env
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Wrong Node version errors during install/start

```bash
node -v
```

Must be v22 or higher. After upgrading Node:

1. Delete the `node_modules` folder in that app
2. Run `npm install` again
3. Start the app again

### Admin password stopped working

```bash
cd original_partyBox_new_api
npm run seed:admin
```

Then login again with `admin@gozohome.com` / `Admin@123`.

---

## Section 9 — Staging demo URLs (already online)

If you only need to view the hosted demo (no local install):

| App | URL |
|-----|-----|
| Website | https://ecdemo.indiprotechnologies.com/ |
| Admin | https://ecadmin.indiprotechnologies.com/ |
| API | https://ecdemoapi.indiprotechnologies.com/ |

Server env templates (for deployment teams, not needed for local laptop setup):

- API: `original_partyBox_new_api/.env.staging.example`
- Admin: `Honey_admin_UI/.env.staging.example`
- Website: `original_HoneyEcommerce_new_ui/.env.staging.example`

---

## Section 10 — Make a clean source zip (for developers)

From the project root:

```bash
bash scripts/make-client-source-zip.sh
```

This creates `dist/gozo-home-source.zip` with:

- this written guide
- the three app folders

It excludes:

- `node_modules`
- real `.env` secret files
- `cloud/uploads`
- build output folders

Recipient instructions: unzip the package, open **`GOZO_HOME_LOCAL_RUN_GUIDE.md`**, and follow Sections 1 to 6.

---

## Quick reference card

| Need | Answer |
|------|--------|
| Node version | 22+ |
| MongoDB | Running on port 27017 |
| Start order | MongoDB → API → Website/Admin |
| API folder / port | `original_partyBox_new_api` / 5000 |
| Website folder / port | `original_HoneyEcommerce_new_ui` / 3000 |
| Admin folder / port | `Honey_admin_UI` / 3001 |
| First-time seed | `npm run seed:demo` inside API folder |
| Admin login | `admin@gozohome.com` / `Admin@123` |
| Website login | `demo@gozohome.com` / `Demo@123` |
| Stop an app | `Ctrl+C` in that terminal |
