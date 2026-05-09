# Installation Guide

## Prerequisites

- Node.js 20+
- npm 10+
- Git
- Selise Blocks account (blocks.selise.ch) — or use the provided demo credentials
- Google account (for Gemini AI key) — or use the demo key already embedded

---

## Step 1 — Clone repository

```bash
git clone https://github.com/sifatjahanmahin-tech/VIBE-Builder.git
cd VIBE-Builder
git checkout dev
```

---

## Step 2 — Install dependencies

```bash
npm install
```

---

## Step 3 — Environment setup

Create a `.env` file in the project root:

```env
VITE_BLOCKS_API_URL=https://api.seliseblocks.com
VITE_API_BASE_URL=https://api.seliseblocks.com
VITE_X_BLOCKS_KEY=D9aab23f617c843d9a6806cc57af9f335
VITE_PROJECT_SLUG=dlqxcb
VITE_GEMINI_API_KEY=your_gemini_key_here
VITE_CAPTCHA_SITE_KEY=
VITE_CAPTCHA_TYPE=
```

> **Note:** A fallback Gemini API key is already embedded in the code, so AI features will work even if `VITE_GEMINI_API_KEY` is left empty. The Selise `VITE_X_BLOCKS_KEY` must match the project you're connecting to.

---

## Step 4 — Set up Selise Blocks schemas

```bash
node setup-schemas.js
```

This script creates the `WebsiteProject` and `PageLayout` schemas in Selise Data Gateway. It must be run once per Selise project (or after a schema reset).

What it does:
- Creates `WebsiteProject` schema with fields: `userId`, `siteName`, `primaryColor`, `secondaryColor`, `fontFamily`
- Creates `PageLayout` schema with fields: `pageId`, `siteId`, `userId`, `pageName`, `slug`, `isPublished`, `components`, `seoTitle`, `seoDescription`, `ogImage`, `customCss`, `customJs`
- Publishes both schemas so they are queryable

---

## Step 5 — Get a free Gemini API key

1. Go to **https://aistudio.google.com**
2. Sign in with your Google account
3. Click **Get API Key** in the left sidebar
4. Click **Create API key**
5. Copy the key (starts with `AIzaSy...`)
6. Paste it as `VITE_GEMINI_API_KEY` in your `.env` file

> The free tier gives 15 requests per minute and 1 million tokens per day — more than enough for development.

---

## Step 6 — Run locally

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

**Demo login credentials:**
- Email: `demo.construct@seliseblocks.com`
- Password: `H%FE*FYi5oTQ!VyT6TkEy`

---

## Step 7 — Deploy to Selise

```bash
git add .
git commit -m "deploy"
git push origin dev
```

Then in the Selise portal:

1. Go to your project → **Deployment**
2. Click **Deploy Now**
3. Select **Git-based deployment**
4. Choose branch: `dev` (or `master` for production)
5. Wait for the build to complete (~2-3 minutes)

The app will be live at: `https://{projectSlug}-{hash}.seliseblocks.com`

---

## Step 8 — Configure Selise portal

### Identity (IAM)

1. Go to **Identity → Authentication**
2. Enable **Email/Password** login
3. Enable **Client Credential** (for machine-to-machine if needed)
4. Go to **Identity → Access Manager**
5. Create a user, set a password, assign the **Admin** role

### Data Gateway

1. Go to **Data → Data Gateway**
2. Verify `WebsiteProject` and `PageLayout` schemas exist
3. Click **Publish** on both schemas (required for queries to work)
4. Click on `PageLayout` → **Schema Access**
5. Set **View** permission to **Public** (required for the live site renderer to work without auth)

---

## Live Application

| | URL |
|---|---|
| **Live app** | https://dlqxcb-dzhym.seliseblocks.com |
| **GitHub repo** | https://github.com/sifatjahanmahin-tech/VIBE-Builder |
| **Active branch** | `dev` |
| **Production branch** | `master` |

---

## Multi-environment builds

The project supports multiple Selise environments via `set-env.cjs`:

```bash
# Development
BUILD_ENV=dev npm run build

# Staging
BUILD_ENV=stg npm run build

# Production
BUILD_ENV=prod npm run build
```

Available env files: `.env.dev`, `.env.test`, `.env.uat`, `.env.stg`, `.env.prodshadow`, `.env.iat`, `.env.preprod`, `.env.prod`

Each file has its own `VITE_X_BLOCKS_KEY` and `VITE_PROJECT_SLUG` for the corresponding Selise project.

---

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| **GraphQL 404 error** | Wrong `x-blocks-key` or project slug | Check `VITE_X_BLOCKS_KEY` and `VITE_PROJECT_SLUG` in `.env` |
| **Login fails** | User not activated | Go to Selise IAM portal → Resend activation email |
| **Login fails on deployed domain** | Cookie auth not working | Ensure `credentials: 'include'` is set (already done in code) |
| **AI panel shows no response** | Gemini API key missing | Add `VITE_GEMINI_API_KEY` to `.env` — or use the embedded fallback |
| **Live site shows 404** | PageLayout View not public | Go to Data Gateway → PageLayout → Schema Access → set View to Public |
| **Live site shows white screen** | Components use CSS variables | Already fixed — all vibe components use explicit inline styles |
| **White screen in editor** | Bundle error | Run `npm run build` to see errors; check browser console |
| **Schemas missing** | setup-schemas.js not run | Run `node setup-schemas.js` and check the Selise Data Gateway |
| **"Cannot find module" error** | Missing `node_modules` | Run `npm install` |
| **Typescript errors** | Type mismatch | Run `npx tsc --noEmit` to see all errors |
| **ESLint errors** | Code style violations | Run `npm run lint` to see all warnings |

---

## Architecture overview

```
src/
├── components/vibe/          # 9 page components (Hero, TextBlock, etc.)
├── lib/
│   ├── blocks-api.ts         # All Selise GraphQL queries and mutations
│   ├── graphql-client.ts     # HTTP client with auth header injection
│   └── page-templates.ts     # 5 page templates with default components
├── modules/
│   ├── editor/               # Full-screen drag-and-drop editor
│   │   ├── components/       # Canvas, Palette, PropertyEditor, AIPanel, Topbar
│   │   ├── hooks/            # use-editor.ts (state, undo, save, publish)
│   │   └── pages/            # editor-page.tsx (keyboard shortcuts, routing)
│   ├── vibe-dashboard/       # Dashboard (website cards, add/delete)
│   └── renderer/             # Live site renderer (public, no auth)
├── state/store/auth.ts       # Zustand auth store (token, user)
└── types/vibebuilder.ts      # All TypeScript types and COMPONENT_DEFINITIONS
```
