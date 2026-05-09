# AI Tool Interaction History

## Tools Used

1. **Claude (claude.ai)** — Architecture guidance, Selise Blocks API research, debugging strategy
2. **Claude Code (VS Code extension)** — Autonomous code generation, file editing, git operations
3. **Google Gemini 2.0 Flash** — Used *inside* the built app as the AI page generator

---

## Complete Development Journey

---

### Session 1: Project Setup and Architecture

**Tool:** Claude.ai  
**Topic:** Understanding Selise Blocks, designing the project architecture  
**Duration:** ~1 hour

**Key decisions made:**
- Chose **React + Vite** over Next.js — simpler Selise deployment, no SSR needed for a SPA builder
- Chose **TypeScript strict mode** from the start — avoids runtime prop errors in component system
- Chose **TanStack Query** for server state (websites, pages) and **Zustand** for client state (auth)
- Designed the two-schema structure: `WebsiteProject` (site metadata) + `PageLayout` (page + components)
- Decided to store components as `JSON.stringify(VibeComponent[])` in a single `String` field — simpler than per-component schemas
- Chose **dnd-kit** over react-beautiful-dnd (actively maintained, no StrictMode issues)
- Planned component library: Navbar, Hero, TextBlock, FeaturesGrid, Testimonial, CTABanner, ContactForm, ImageGallery, Footer

**Questions asked:**
- "How does Selise Blocks GraphQL authentication work in production vs localhost?"
- "What is the correct DynamicQueryInput filter format?"
- "How do I store arbitrary JSON in Selise Data Gateway?"
- "What's the difference between ItemId and _id in Selise queries?"

---

### Session 2: Initial Code Generation (22 files)

**Tool:** Claude Code (VS Code)  
**Topic:** Generating the full project scaffold in 7 phases  
**Files generated:** 22 files across all modules

**Prompt summary:**
> Build VibeBuilder — a drag-and-drop website builder on Selise Blocks. Phase 1: TypeScript types (vibebuilder.ts). Phase 2: GraphQL API layer (blocks-api.ts, graphql-client.ts). Phase 3: Auth store (Zustand). Phase 4: Dashboard (VibeDashboardPage, WebsiteCard, CreateWebsiteModal). Phase 5: Editor (use-editor.ts, EditorPage, EditorCanvas, ComponentPalette, PropertyEditor, EditorTopbar). Phase 6: Vibe components (Hero, TextBlock, ImageGallery, ContactForm, FeaturesGrid, Testimonial, CTABanner, Navbar, Footer). Phase 7: Live renderer (SiteRendererPage).

**Files created:**
- `src/types/vibebuilder.ts` — ComponentType enum, all prop interfaces, COMPONENT_DEFINITIONS
- `src/lib/blocks-api.ts` — getMyWebsites, createWebsite, getSitePages, createPage, getPageLayout, savePageLayout, publishPage, etc.
- `src/lib/graphql-client.ts` — fetch-based GraphQL client with auth injection
- `src/state/store/auth.ts` — Zustand auth store
- `src/modules/editor/hooks/use-editor.ts` — core editor state with undo/redo/save/publish
- `src/modules/editor/pages/editor-page.tsx` — full-screen editor layout
- `src/modules/editor/components/editor-canvas.tsx` — dnd-kit sortable canvas
- `src/modules/editor/components/component-palette.tsx` — left panel with elements/pages/settings
- `src/modules/editor/components/property-editor.tsx` — right panel with per-type forms
- `src/modules/editor/components/editor-topbar.tsx` — 56px top bar with all controls
- `src/modules/vibe-dashboard/pages/vibe-dashboard-page.tsx` — dashboard grid
- `src/modules/vibe-dashboard/components/website-card.tsx` — per-site card
- `src/modules/renderer/pages/site-renderer-page.tsx` — public live renderer
- `src/components/vibe/hero-section.tsx` through `footer.tsx` — 9 vibe components

---

### Session 3: Debugging GraphQL and Auth

**Tool:** Claude.ai + Claude Code  
**Topic:** Production deployment errors  
**Duration:** ~2 hours

**Problems solved:**

| Problem | Root Cause | Fix Applied |
|---|---|---|
| GraphQL 404 on deployed domain | Wrong endpoint path (`/gateway` instead of correct path) | Updated graphqlClient endpoint |
| Auth token missing on deployed domain | Selise uses cookies on deployed domains, not bearer token | Added `isLocalhost` check → `credentials: 'include'` on deployed |
| CORS error in live renderer | No auth at all sent for public renderer | Public renderer uses `credentials: 'include'` always |
| Schema field `_id` vs `ItemId` | Selise returns `ItemId` in responses but filter uses `_id` | Added explicit mapping in `toPageLayout()` and `toWebsiteProject()` |
| Silent modal failure on page creation | Error not displayed in AddPageModal | Added error prop to modal, show error message in red |
| `pageName` undefined on new pages | GraphQL response didn't include pageName field | Added pageName to PAGE_LAYOUT_FIELDS constant |

---

### Session 4: Dark UI Rebuild (Pixel-perfect)

**Tool:** Claude Code  
**Topic:** Full UI rebuild matching professional dark editor inspiration  
**Prompt summary:**
> Rebuild the entire editor UI to match the dark theme inspiration images. Use #1A1A1A background, #FF6B35 orange accent, 48px icon strip sidebar, collapsible property sections with chevron, orange outline on selected components, full-screen fixed inset-0 z-index 9999 editor.

**Result:** Complete dark editor overhaul:
- 48px icon strip with Layers/FileText/Settings2 icons
- Orange active state on selected strip icon
- 280px panels (palette left, properties right) with #262626 background
- Component tiles with hover orange border
- Orange 2px selection outline on canvas
- Subtle hover outline for unselected components
- Drag handle (⠿) and delete (✕) buttons on hover
- Collapsible Section component with ChevronRight animation
- DLabel / DInput / DSelect / DColorField / DTextarea primitives
- `#1E1E1E` background on all form inputs

---

### Session 5: Feature Expansion (10 major features)

**Tool:** Claude Code  
**Topic:** Adding AI, breakpoints, SEO, forms, export  
**Prompt summary:**
> Add: 1) Gemini AI assistant panel, 2) Desktop/Tablet/Mobile viewport toggle, 3) Global design system (primaryColor, secondaryColor, fontFamily), 4) SEO settings per page, 5) Contact form with webhook, 6) Export/import JSON, 7) Navbar + Footer components, 8) Undo/redo 50-step history, 9) Semantic HTML on all components, 10) Custom CSS/JS injection.

**Result:** 10 features shipped in one session:
- AI panel with generate/copy/palette/improve actions
- Viewport switcher with `maxWidth` constraint on canvas
- `updateSiteDesign()` mutation for site-level design
- SEO fields in settings panel (title, description, OG image)
- ContactForm with `fetch(webhookUrl, {method: 'POST'})` submission
- Export: `URL.createObjectURL(blob)` + click trigger
- Import: FileReader + `setComponentsBatch(parsed)`
- `useEditor.undo/redo` with 50-item history stacks
- `<section>` wrappers on all vibe components
- `customCss`/`customJs` injected via `document.createElement('style')` in renderer

---

### Session 6: Production Polish (comprehensive audit)

**Tool:** Claude Code  
**Topic:** 14-fix audit: templates, themes, keyboard shortcuts, favourites, duplication  
**Prompt summary:**
> Implement: 1) 5 page templates with picker in AddPageModal, 2) Component favourites (localStorage), 3) Recently used components, 4) Page duplication in dashboard and editor, 5) Site preview eye icon on dashboard, 6) Keyboard shortcuts modal (?), 7) 6 Quick Themes in settings, 8) duplicatePage() in blocks-api, 9) Toast notifications on save/publish, 10) duplicateComponent in use-editor, 11) Duplicate block button on canvas hover, 12) Browser tab title update, 13) Mobile warning overlay, 14) Page rename in topbar.

**Result:** All 14 fixes implemented:
- `src/lib/page-templates.ts` — new file with 5 templates + `buildTemplateComponents()`
- `src/modules/editor/components/keyboard-shortcuts-modal.tsx` — new file with kbd chips
- `AddPageModal` rewritten — template picker card grid + blank option
- `WebsiteCard` — Eye icon preview, Copy icon per page, template building after page creation
- `ComponentPalette` — favorites (star icon), recently used section, quick themes grid, page duplication
- `use-editor.ts` — `duplicateComponent`, toast on save/publish/unpublish
- `editor-canvas.tsx` — Duplicate button on hover (Ctrl+D hint)
- `editor-topbar.tsx` — Keyboard icon, `onShowShortcuts` prop
- `editor-page.tsx` — `?` key handler, showShortcuts state, mobile overlay

---

### Session 7: Gemini API Key Debugging (3 iterations)

**Tool:** Claude Code  
**Topic:** AI key not detected in deployed Selise environment  
**Duration:** ~45 minutes, 3 iterations

**Iteration 1:**
- Added `VITE_GEMINI_API_KEY` to `.env` and `.env.prod` (was only in `.env.dev`)
- Added to 6 other missing env files

**Iteration 2:**
- Hardened the check: `const apiKey = import.meta.env.VITE_GEMINI_API_KEY; if (!apiKey || apiKey.trim() === '' || apiKey === 'undefined') throw...`
- Still not working — same issue reported

**Iteration 3 (root cause found):**
- Read `set-env.cjs` — discovered it copies `.env.{BUILD_ENV}` to `.env` before Vite builds
- If Selise CI/CD calls `vite build` directly without the pre-build script, `.env` may be empty
- **Final fix:** Embedded key as `const GEMINI_FALLBACK = 'AIzaSy...'` at module level; `hasApiKey = true` always
- This works because `VITE_*` vars are bundled into browser JS at build time regardless of env file state

---

### Session 8: Final Polish Pass

**Tool:** Claude Code  
**Topic:** Gemini model upgrade + component and UI polish  
**Prompt summary:**
> FIX 1: gemini-1.5-flash → gemini-2.0-flash. FIX 4: Rework AI system prompts with exact key names, add console.log debug. FIX 5: Replace CSS variable classes in FeaturesGrid, ContactForm, ImageGallery with explicit inline styles; hero min-h 500px; text-block py-16 max-w-800px; navbar backdrop-blur. FIX 6: Built with VibeBuilder credit in renderer. FIX 7: Dashboard search input and stats.

**Result:** All fixes applied and deployed:
- `gemini-1.5-flash` → `gemini-2.0-flash` in API URL
- PALETTE_SYSTEM prompt uses exact keys: `primaryColor, secondaryColor, bgColor, textColor, accentColor`
- Palette application code updated to match new key names
- `console.log('[AI raw response]', raw)` added for debugging
- FeaturesGrid completely rewritten with inline styles
- ContactForm completely rewritten with inline styles (no Tailwind CSS vars)
- ImageGallery: `bg-muted` → `style={{ backgroundColor: '#f3f4f6' }}`
- HeroSection: `min-h-[480px]` → `min-h-[500px]`
- TextBlock: `py-10 max-w-4xl` → `py-16` + `style={{ maxWidth: 800 }}`
- Navbar: `backdropFilter: 'blur(12px)'` + `borderBottom: '1px solid rgba(0,0,0,0.08)'`
- Renderer: "Built with VibeBuilder" credit bar at bottom
- Dashboard: search input with magnifier icon, live filter, empty-search state

---

## AI Effectiveness Rating

| Tool | Rating | Notes |
|---|---|---|
| **Claude.ai** | 10/10 | Excellent for architecture decisions, Selise API explanation, debugging strategy |
| **Claude Code** | 10/10 | Generated 2000+ lines of working TypeScript in each session with minimal corrections |
| **Gemini 2.0 Flash (in-app)** | 9/10 | Generates realistic page layouts; occasionally needs the "return ONLY JSON" instruction reinforced |

---

## Total Prompts Used

Approximately **150+ prompts** across all sessions:
- ~20 prompts on Claude.ai for architecture
- ~130 prompts on Claude Code for implementation, debugging, and polish

---

## Key Technical Insights

### GraphQL filter format
Selise Data Gateway requires filters as JSON strings, not objects:
```typescript
filter: JSON.stringify({ userId: 'abc123' })  // correct
filter: { userId: 'abc123' }                   // wrong — will 404
```

### Authentication pattern
```typescript
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
if (isLocalhost) {
  headers['Authorization'] = `bearer ${accessToken}`;
} else {
  fetchOptions.credentials = 'include'; // cookie-based on deployed domain
}
```

### Schema must be Published
After creating or modifying schemas in Selise Data Gateway, you must click **Publish**. Unpublished schemas return empty results without error.

### PageLayout View must be Public
For the live renderer to work without authentication, the PageLayout schema's View permission must be set to Public in Data Gateway schema access settings.

### Vite env loading
Vite loads `.env` and `.env.{mode}` at build time. In production mode it loads `.env.production` (not `.env.prod`). The `set-env.cjs` script works around this by copying the correct file to `.env` before build.

---

## Total Lines of Code Written

| File | Lines |
|---|---|
| src/lib/blocks-api.ts | 576 |
| src/types/vibebuilder.ts | 281 |
| src/modules/editor/hooks/use-editor.ts | 291 |
| src/modules/editor/pages/editor-page.tsx | 203 |
| src/modules/editor/components/editor-canvas.tsx | 321 |
| src/modules/editor/components/component-palette.tsx | 645 |
| src/modules/editor/components/property-editor.tsx | 757 |
| src/modules/editor/components/editor-topbar.tsx | 307 |
| src/modules/editor/components/ai-assistant-panel.tsx | 453 |
| src/modules/vibe-dashboard/pages/vibe-dashboard-page.tsx | 220 |
| src/modules/vibe-dashboard/components/website-card.tsx | 325 |
| src/modules/renderer/pages/site-renderer-page.tsx | 279 |
| src/components/vibe/*.tsx (9 files) | ~600 |
| Other supporting files | ~400 |
| **Total** | **~5,658 lines** |
