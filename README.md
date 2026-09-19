# Qatar Indian Management Association (QIMA)

Full-stack website with a database-driven content management panel.

- **Frontend** — React 18 (Vite), React Router v6, Tailwind CSS v4, lucide-react
- **Backend** — Node.js + Express (ESM), JWT auth, bcrypt
- **Database** — MySQL 8 (`mysql2`), also verified on MariaDB 10.11

Everything on the public site — hero banners, the entire About Us page, the
management team, events, gallery, Google Form links and contact details — is
stored in MySQL and edited from `/admin`. No redeploy is needed to change copy.

```
qima/
├── server/                  Express REST API
│   ├── db/
│   │   ├── schema.sql       full schema + seed data (the deliverable script)
│   │   ├── setup.js         runs schema.sql, then seeds the admin account
│   │   └── pool.js          shared mysql2 connection pool
│   ├── middleware/          JWT auth guard, async error wrapper
│   ├── routes/              auth · about · banners · team · events · gallery · settings · contact
│   ├── index.js             app bootstrap, CORS, error handling
│   └── .env.example
└── client/                  React app
    ├── src/
    │   ├── api/client.js    fetch wrapper + typed api/adminApi surfaces
    │   ├── components/      Navbar, Footer, HeroBanner, TeamCard, EventCard, ui.jsx
    │   ├── context/         SettingsContext (loads the settings table once)
    │   ├── hooks/useApi.js  useFetch with AbortController
    │   ├── pages/           Home, About, Team, Membership, Events, Gallery, Contact, NotFound
    │   ├── admin/           AdminDashboard, AdminLogin, AuthContext, tabs/
    │   ├── index.css        Tailwind v4 theme tokens + component classes
    │   └── App.jsx          routes
    └── .env.example
```

---

## Step 1 — Database

Requires MySQL 8.0+ (or MariaDB 10.5+) running locally.

```bash
cd server
cp .env.example .env
```

Edit `.env` and set at minimum:

```ini
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=qima_db

JWT_SECRET=<paste a long random string>
SEED_ADMIN_EMAIL=admin@qima.qa
SEED_ADMIN_PASSWORD=<pick a strong password>
```

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Then create the database:

```bash
npm install
npm run db:setup
```

That runs `db/schema.sql` (creates `qima_db`, all eight tables and the seed
rows) and creates the admin account from the `SEED_ADMIN_*` values.

Prefer raw SQL? `mysql -u root -p < db/schema.sql` does the schema and seed
data; you then still need `npm run db:setup` once to create the admin user,
because the password must be bcrypt-hashed.

**Re-running is safe.** Content rows are only inserted when a table is empty,
and `about_content` re-runs never overwrite the `content` column — so a
re-run can't destroy copy your admin has edited.

---

## Step 2 — Backend

```bash
cd server
npm run dev        # node --watch index.js  →  http://localhost:5000
```

Check it: `curl http://localhost:5000/api/health` →
`{"status":"ok","db":"connected", ...}`

---

## Step 3 — Frontend

```bash
cd client
npm install
npm run dev        # → http://localhost:5173
```

In development the Vite dev server proxies `/api/*` to `localhost:5000`
(see `vite.config.js`), so no CORS setup or `.env` file is needed locally.

Open <http://localhost:5173> for the site and <http://localhost:5173/admin>
for the panel, signing in with your `SEED_ADMIN_*` credentials.

---

## API reference

Public endpoints need no authentication. Admin endpoints require
`Authorization: Bearer <token>` from `POST /api/auth/login`.

| Method | Route | Auth | Purpose |
| --- | --- | :-: | --- |
| GET | `/api/health` | — | Service + DB status |
| POST | `/api/auth/login` | — | Email + password → JWT (rate limited: 10 / 10 min) |
| GET | `/api/auth/me` | ✓ | Validate a stored token |
| POST | `/api/auth/change-password` | ✓ | Rotate the signed-in admin's password |
| **GET** | **`/api/about`** | — | **All About Us sections — `{ sections, list }`** |
| GET | `/api/about/:key` | — | One section |
| **PUT** | **`/api/about/:key`** | ✓ | **Upsert one section (creates unknown keys)** |
| **PUT** | **`/api/about`** | ✓ | **Bulk save the whole page (transactional)** |
| DELETE | `/api/about/:key` | ✓ | Remove a section |
| GET | `/api/banners` | — | Active slides, ordered |
| GET | `/api/banners?all=true` | — | Including hidden, for the dashboard |
| POST / PUT / DELETE | `/api/banners[/:id]` | ✓ | Manage slides |
| PATCH | `/api/banners/:id/toggle` | ✓ | Flip `is_active` |
| GET | `/api/team` | — | `{ grouped, list, categories }` |
| POST / PUT / DELETE | `/api/team[/:id]` | ✓ | Manage members |
| GET | `/api/events?scope=upcoming\|past\|all&limit=n` | — | Filtered list |
| GET | `/api/events/grouped` | — | `{ upcoming, past }` |
| POST / PUT / DELETE | `/api/events[/:id]` | ✓ | Manage events (incl. `google_form_url`) |
| GET | `/api/gallery?type=photo\|video` | — | Gallery items |
| POST / PUT / DELETE | `/api/gallery[/:id]` | ✓ | Manage items |
| GET | `/api/settings` | — | Flat `{ key: value }` map |
| PUT | `/api/settings/:key` | ✓ | Upsert one setting |
| PUT | `/api/settings` | ✓ | Bulk save (transactional) |
| POST | `/api/contact` | — | Submit the contact form (rate limited, honeypot) |
| GET | `/api/contact` | ✓ | Admin inbox |
| PATCH | `/api/contact/:id/read` | ✓ | Mark read |
| DELETE | `/api/contact/:id` | ✓ | Delete a message |

---

## Admin panel (`/admin`)

| Tab | What it edits |
| --- | --- |
| **About Us Content** | Every block on `/about` — president's message, history, mission, vision, core values, objectives, leadership pillars. Add your own sections too; unknown `section_key`s render automatically in an "Additional information" block. |
| **Hero Banners** | Home page slides: image or video background, headline, subtitle, CTA text + link, display order, show/hide toggle. |
| **Management Team** | Board, Office Bearers, Executive Committee, Advisory Council — photo, name, designation, bio, email, LinkedIn, order. |
| **Events** | Title, date, time, location, description, cover image, and a per-event Google Form URL. |
| **Gallery** | Photos (direct URL) and videos (YouTube `/embed/` URL). |
| **Settings & Forms** | `membership_google_form_url`, contact details, map embed, home page statistics, social links. Add arbitrary new keys. |
| **Contact Messages** | Inbox for the public contact form, with read state and reply-by-email. |

### Content formatting conventions

The About Us textareas are plain text, split on newlines by the front end:

- `history`, `president_message` — **one paragraph per line**
- `objectives` — **one objective per line** → renders as a ticked list
- `values`, `leadership_pillars` — **one item per line**, formatted
  `Integrity — short description`. The em dash splits the bold heading from
  the body text. A line without a dash renders as body text alone.

### Google Forms

- **Membership** — one global link, `settings.membership_google_form_url`.
  `/membership` embeds it in an iframe (appending `embedded=true`) and also
  offers an "open in a new tab" fallback. While the value still contains
  `REPLACE_WITH`, the page shows a "not live yet" notice instead.
- **Events** — each row's `events.google_form_url`. The **Register Now**
  button only appears on upcoming events that have one set.

---

## Production deployment

**Build the front end:**

```bash
cd client
echo "VITE_API_URL=https://api.qima.qa" > .env.production
npm run build          # → client/dist
```

Serve `client/dist` as static files. Because the app uses HTML5 routing,
the web server must fall back to `index.html` for unknown paths:

```nginx
server {
    server_name qima.qa;
    root /var/www/qima/client/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Run the API under PM2:**

```bash
cd server
pm2 start index.js --name qima-api
pm2 save
```

Set in the server's `.env`:

```ini
NODE_ENV=production
CLIENT_ORIGIN=https://qima.qa,https://www.qima.qa
JWT_SECRET=<long random string>
```

If you proxy `/api` through the same nginx host as the front end (as above),
the browser never makes a cross-origin request and `CLIENT_ORIGIN` only
matters for other clients.

---

## Security notes

- Passwords are bcrypt-hashed (cost 12); the API never returns a hash.
- All write routes are behind `requireAuth`; JWTs expire after `JWT_EXPIRES_IN`
  (default 8h) and the dashboard signs the admin out on a 401.
- Login is rate limited to 10 attempts per 10 minutes, contact submissions to
  5 per 15 minutes; `app.set('trust proxy', 1)` makes those see real client IPs
  behind nginx.
- The contact form has a hidden honeypot field — submissions that fill it are
  accepted with a 201 and silently discarded.
- Every query uses parameterised placeholders. `multipleStatements` is enabled
  **only** in `db/setup.js`, never in the running API.
- Change `SEED_ADMIN_PASSWORD` before going live, or use
  `POST /api/auth/change-password`.

---

## Known customisation points

- **Theme** — `client/src/index.css`, the `@theme` block. `--color-navy-*`
  (deep slate/navy), `--color-accent-*` (red/burgundy) and `--color-sand-*`
  drive every utility (`bg-navy-900`, `text-accent-600`, …).
- **Fonts** — Fraunces for display, Inter for body, loaded in `index.html`.
- **Media** — the schema stores URLs, not files. Point them at your CDN, an
  `/uploads` folder served by nginx, or anywhere public. If you want in-app
  uploads later, add a `multer` route on the API and have the admin forms post
  to it, then store the returned path in the same `*_url` columns.
- **Tailwind version** — this project uses Tailwind v4 via `@tailwindcss/vite`,
  so the theme lives in CSS (`@theme`) rather than `tailwind.config.js`.
