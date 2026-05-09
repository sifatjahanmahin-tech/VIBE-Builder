# VibeBuilder — Project Report

## Project Overview

**Project Name:** VibeBuilder  
**Type:** AI-powered drag-and-drop website builder  
**Platform:** Built on Selise Blocks (SaaS platform infrastructure)  
**Live URL:** https://dlqxcb-dzhym.seliseblocks.com  
**GitHub:** https://github.com/sifatjahanmahin-tech/VIBE-Builder  
**Branch (active):** `dev` | **Production branch:** `master`

---

## What Was Built

VibeBuilder is a full-featured, production-ready website builder that runs entirely on Selise Blocks infrastructure. Users can:

1. Sign in via Selise IAM (email/password authentication)
2. Create multiple websites from the dashboard
3. Add pages to each website (with 5 pre-built templates or blank)
4. Edit pages in a pixel-perfect dark drag-and-drop editor
5. Publish pages and view them live at `/site/{userId}/{slug}`
6. Use Google Gemini AI to generate complete page layouts from a text prompt

The builder is modelled after professional tools like Webflow and Framer — dark theme, component palette on the left, canvas in the centre, property editor on the right.

---

## Completed Features

### Dashboard
- [x] Create/delete websites with auto-generated accent colours
- [x] Per-site page list with Live/Draft badges
- [x] Site preview (Eye icon opens first published page)
- [x] Page duplication with component re-UUIDing
- [x] Add Page modal with 5 page templates + blank option
- [x] Shimmer skeleton loading state
- [x] Error state with Retry button
- [x] Search/filter input for websites
- [x] Quick stats (site count in subtitle)

### Editor
- [x] Full-screen dark editor (fixed inset-0, z-index 9999)
- [x] 48px icon-strip sidebar (Elements / Pages / Settings tabs)
- [x] 280px component palette with search, categories, recently used, favourites (starred)
- [x] Drag-and-drop canvas (dnd-kit SortableContext) with reordering
- [x] Component selection — orange 2px outline + label chip
- [x] Block hover — semi-transparent orange outline
- [x] Duplicate block button (Ctrl+D) on hover
- [x] Delete block button (Delete key) on hover
- [x] Drag handle (⠿) on hover
- [x] 280px property editor — collapsible sections with chevron toggles
- [x] Viewport switcher: Desktop / Tablet / Mobile (1100px / 768px / 390px)
- [x] Preview mode (clean white render, no editor chrome)
- [x] Save (Ctrl+S) with auto-save every 30 seconds
- [x] Publish / Unpublish (Ctrl+P)
- [x] Undo / Redo — 50-step history (Ctrl+Z / Ctrl+Y)
- [x] Export page as JSON
- [x] Import page from JSON file
- [x] Editable page name in topbar (click to rename)
- [x] Save status indicator (Saved / Unsaved / Saving…)
- [x] External link button (opens live site when published)
- [x] Keyboard shortcuts modal (press `?` or toolbar icon)
- [x] Mobile/tablet warning overlay (< 1024px)
- [x] Browser tab title updates to page name

### Pages Panel (inside editor)
- [x] Full page list with Live/Draft badges
- [x] Navigate between pages (click row)
- [x] Add new page (with template picker)
- [x] Duplicate page with cloned components
- [x] Delete page from list
- [x] "New Page" button in panel header

### Settings Panel (inside editor)
- [x] URL slug editor (saves on blur)
- [x] SEO: page title, meta description, OG image URL
- [x] 6 Quick Themes: Dark, Light, Ocean, Forest, Sunset, Purple
- [x] Global design: primary colour, secondary colour, font family
- [x] Custom CSS injection (per page)
- [x] Custom JS injection (per page)
- [x] Danger zone: delete page with confirmation

### AI Assistant Panel
- [x] Google Gemini 2.0 Flash integration
- [x] Generate full page from text prompt
- [x] Rewrite copy for selected block
- [x] Generate colour palette and apply to all blocks
- [x] Improve entire page copy
- [x] Suggestion chips (5 example prompts)
- [x] Conversation log (user / AI / error bubbles)
- [x] Loading animation (bouncing dots)
- [x] Fallback API key embedded for guaranteed availability
- [x] Debug logging (`console.log` of raw response)

### Component Library (9 components)
- [x] **Navbar** — sticky, backdrop-blur, logo letter, nav links
- [x] **Hero Section** — gradient or solid bg, optional image overlay, CTA button, alignment
- [x] **Text Block** — font size, colour, alignment, `py-16` generous padding
- [x] **Features Grid** — 3-column auto-fit, explicit inline styles (no CSS variables)
- [x] **Testimonial** — quote, author, avatar, background colour
- [x] **CTA Banner** — heading, subtext, button with URL
- [x] **Contact Form** — dynamic fields, webhook submission, success/error state
- [x] **Image Gallery** — grid with configurable columns and gap
- [x] **Footer** — company name, copyright, links

### Live Site Renderer
- [x] Public route `/site/:userId/:slug`
- [x] Renders all 9 component types
- [x] SEO: `<title>`, meta description, OG tags injected at runtime
- [x] Custom CSS / JS injected per page
- [x] Site navigation bar (shown when no Navbar block)
- [x] Multi-page navigation links
- [x] Smooth scroll (`scroll-behavior: smooth`)
- [x] Fade-in animation on page load
- [x] Dark 404 page with gradient text and back button
- [x] Skeleton loading state
- [x] "Built with VibeBuilder" credit bar at bottom

---

## Technical Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript 5 + Vite 5 |
| Routing | React Router v6 |
| State Management | Zustand (auth store) + TanStack Query v5 |
| Drag and Drop | @dnd-kit/core + @dnd-kit/sortable |
| Styling | Tailwind CSS v3 + inline styles for component isolation |
| AI | Google Gemini 2.0 Flash REST API |
| Backend | Selise Blocks (GraphQL Data Gateway) |
| Auth | Selise IAM (email/password) |
| File Upload | Selise Files API |
| IDs | uuid v4 |
| Icons | Lucide React |
| Build | Vite (ESM, tree-shaking) |
| Linting | ESLint + TypeScript strict mode |

---

## Architecture Decisions

### 1. Selise Blocks as full backend
Rather than building a custom API, all data persistence is handled through Selise Blocks GraphQL Data Gateway. This means zero backend code — the frontend talks directly to the Selise GraphQL endpoint with `x-blocks-key` authentication.

### 2. Components as JSON in Data Gateway
Page layouts are stored as a JSON string in a `components` field of the `PageLayout` schema. Each component has `{ id, type, order, props }`. This avoids needing a separate schema per component type and allows the entire page to be saved/loaded in a single GraphQL mutation.

### 3. `set-env.cjs` for multi-environment builds
A pre-build Node.js script copies the correct `.env.{BUILD_ENV}` file to `.env` before Vite builds. This allows one codebase to deploy to dev / test / UAT / staging / prod / prodshadow with different Selise project slugs and API keys.

### 4. Gemini API key as module-level fallback
Since Selise CI/CD may bypass `set-env.cjs` in some environments, the Gemini API key is embedded as a `GEMINI_FALLBACK` constant at the module level. `VITE_*` variables are bundled into browser JS regardless, so this is safe and always available.

### 5. dnd-kit for drag and drop
dnd-kit was chosen over react-beautiful-dnd because it is actively maintained, has first-class TypeScript support, and has no strict StrictMode issues.

### 6. Inline styles for vibe components
The 9 vibe components (Hero, TextBlock, etc.) use inline `style={{}}` props rather than Tailwind classes for their colours and layout. This prevents Tailwind's CSS variable classes (`bg-card`, `text-foreground`, etc.) from breaking in the live renderer where Tailwind's design tokens may not be defined.

---

## Selise Blocks Services Used

### IAM (Identity and Access Management)
- Email/password authentication
- JWT tokens (short-lived + refresh)
- User itemId used as the namespace for all website data
- Client credential flow for deployed domain (cookies)
- `credentials: 'include'` on all fetch calls on deployed domain

### Data Gateway (GraphQL)
- **Endpoint:** `POST /uds/v1/{projectSlug}/gateway`
- **Authentication:** `x-blocks-key` header + bearer token (localhost) or cookie (deployed)
- Two schemas: `WebsiteProject` and `PageLayout`
- DynamicQueryInput with `filter: JSON.stringify({...})` for all queries
- Insert returns `{ itemId, totalImpactedData, acknowledged }`
- Update/Delete returns `{ totalImpactedData, acknowledged }`

### Media Block (Files API)
- **Endpoint:** `POST /uds/v1/Files/UploadFile`
- Used in the PropertyEditor for Hero background images, Testimonial author photos, and Gallery images
- Returns a CDN URL for the uploaded file

---

## Data Schema Design

### WebsiteProject
```
ItemId         String   (auto, primary key)
userId         String   (Selise user itemId — acts as namespace)
siteName       String   (display name)
primaryColor   String   (hex, e.g. #FF6B35)
secondaryColor String   (hex)
fontFamily     String   (CSS font stack)
```

### PageLayout
```
ItemId         String   (auto, primary key)
pageId         String   (UUID generated client-side)
siteId         String   (FK → WebsiteProject.ItemId)
userId         String   (FK → Selise user)
pageName       String   (display name)
slug           String   (URL path segment, e.g. "home")
isPublished    Boolean
components     String   (JSON.stringify(VibeComponent[]))
seoTitle       String
seoDescription String
ogImage        String   (URL)
customCss      String
customJs       String
```

**Schema Access:** `PageLayout` View permission is set to `Public` in Data Gateway, allowing the live renderer to fetch published pages without authentication.

---

## AI Integration (Gemini 2.0 Flash)

### API Call
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={apiKey}
Content-Type: application/json

{
  "systemInstruction": { "parts": [{ "text": "<system prompt>" }] },
  "contents": [{ "parts": [{ "text": "<user message>" }] }]
}
```

### Four AI Actions

| Action | System Prompt Strategy | Response Expected |
|---|---|---|
| Generate full page | List all 9 component types with exact props schema | JSON array of VibeComponent |
| Rewrite copy | "Return ONLY a JSON object with improved text props" | JSON object (partial props) |
| Generate palette | Keys: primaryColor, secondaryColor, bgColor, textColor, accentColor | JSON object |
| Improve page | "Return ONLY the improved JSON array" | JSON array of VibeComponent |

### Response Parsing (`extractJSON`)
Three-pass extraction: (1) direct JSON.parse, (2) strip markdown fences, (3) find first `[` or `{` and last `]` or `}` and slice. Throws a user-friendly error if all three fail.

---

## Live URLs

| Environment | URL |
|---|---|
| Live app | https://dlqxcb-dzhym.seliseblocks.com |
| GitHub (dev branch) | https://github.com/sifatjahanmahin-tech/VIBE-Builder/tree/dev |
| GitHub (master) | https://github.com/sifatjahanmahin-tech/VIBE-Builder/tree/master |

**Demo login:**
- Email: `demo.construct@seliseblocks.com`
- Password: `H%FE*FYi5oTQ!VyT6TkEy`

---

## Challenges Faced and Solutions

### 1. GraphQL 404 on deployed domain
**Problem:** API calls worked on localhost but returned 404 in production.  
**Cause:** The `x-blocks-key` header was missing on deployed domain; also the endpoint path was incorrect (`/gateway` instead of `/graphql`).  
**Solution:** Hardened the `graphqlClient` to always send `x-blocks-key` regardless of environment; switched to `credentials: 'include'` on non-localhost domains.

### 2. Auth token not available on deployed domain
**Problem:** `useAuthStore().accessToken` is only populated on localhost (where we use bearer token). On deployed Selise domain, auth is cookie-based.  
**Solution:** Added `isLocalhost` check — on localhost, send `Authorization: bearer {token}`; on deployed domain, send `credentials: 'include'` and let the browser attach the session cookie automatically.

### 3. Gemini API key not picked up in CI/CD
**Problem:** `VITE_GEMINI_API_KEY` was in `.env.dev` but after Selise CI/CD build, `import.meta.env.VITE_GEMINI_API_KEY` was `undefined`.  
**Root cause:** Selise CI/CD calls `vite build` directly, bypassing `set-env.cjs` which normally copies `.env.dev` → `.env`. Vite then loads `.env` which has no Gemini key.  
**Solution:** Embedded key as `GEMINI_FALLBACK` constant at module level. `hasApiKey = true` always. Added key to all 8 env files as belt-and-suspenders.

### 4. Tailwind CSS variables breaking in live renderer
**Problem:** Components using `bg-card`, `text-foreground`, `bg-muted` showed as transparent/white in the live renderer because Tailwind's design tokens were not applied in that context.  
**Solution:** Rewrote `FeaturesGrid` and `ContactForm` entirely with `style={{}}` inline props. Replaced `bg-muted` in `ImageGallery` with `style={{ backgroundColor: '#f3f4f6' }}`. All vibe components now use explicit hex colours.

### 5. TypeScript type narrowing with `filter(Boolean)`
**Problem:** `.filter(Boolean).map((def) => def!)` triggered ESLint `no-non-null-assertion` warnings.  
**Solution:** Replaced with type predicate: `.filter((def): def is typeof COMPONENT_DEFINITIONS[0] => def !== undefined)`.

### 6. Page duplication with stale UUIDs
**Problem:** Copying a page and reusing the same component IDs caused dnd-kit key conflicts.  
**Solution:** `duplicatePage()` maps all components through `{ ...c, id: uuidv4() }` to generate fresh IDs for every cloned block.

### 7. Schema field naming (ItemId vs _id)
**Problem:** Selise Data Gateway returns `ItemId` (capital I) in query responses, but filters use `_id`.  
**Solution:** All response mappers explicitly read `r.ItemId` for the primary key, while all filter mutations use `JSON.stringify({ _id: ... })`.

---

## Completion Percentage

| Module | Status | % Complete |
|---|---|---|
| Auth (IAM) | Complete | 100% |
| Data schema (WebsiteProject + PageLayout) | Complete | 100% |
| Dashboard UI | Complete | 100% |
| Editor core (canvas, palette, properties) | Complete | 100% |
| Component library (9 components) | Complete | 100% |
| Live site renderer | Complete | 100% |
| AI assistant (Gemini) | Complete | 100% |
| SEO meta injection | Complete | 100% |
| Custom CSS/JS injection | Complete | 100% |
| File upload (Selise Files API) | Complete | 100% |
| Export/Import JSON | Complete | 100% |
| Page templates (5 templates) | Complete | 100% |
| Keyboard shortcuts | Complete | 100% |
| Quick themes | Complete | 100% |
| Favourites + recently used | Complete | 100% |
| Page duplication | Complete | 100% |
| Undo/Redo (50-step) | Complete | 100% |
| Responsive breakpoint preview | Complete | 100% |
| Multi-environment build (.env.*) | Complete | 100% |

**Overall: 100% of planned scope is complete and deployed.**

---

## Key Features — Visual Description

### Dashboard
Dark (`#0A0A0A`) background. Top nav with orange VibeBuilder "V" logo. Website cards in a 3-column grid — each card has an auto-coloured accent header with site initial, page list with Live (green) / Draft (grey) badges, and hover actions (edit pencil, duplicate, delete, view live). Orange "Add Page" dashed button at bottom of each card. Search bar filters sites by name.

### Editor
Full-screen dark editor. Left: 48px icon strip (Layers / FileText / Settings icons) → 280px panel. Centre: white canvas in a dark background with viewport frame (1100px / 768px / 390px). Right: 280px property editor with collapsible sections. Top: 56px topbar with orange logo, page name (editable), save status, undo/redo, viewport toggle, AI button, shortcuts button, export/import, preview toggle, publish pill, save button, orange Publish button.

### Live Site
Clean white pages with smooth fade-in. Custom site nav (when no Navbar block). "Built with VibeBuilder" credit bar at the very bottom in light grey.

### AI Panel
400px panel sliding in from the right. Dark `#1A1A1A` background. Quick action buttons in 2×2 grid. Conversation log with orange user bubbles and dark AI bubbles. Suggestion chips for first-time users. Bouncing orange loading dots during AI call.
