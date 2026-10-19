# Plan: Fix 404s for root-level marketing/legal pages

## Goal
Eliminate the `?_rsc` 404s on `docstools-frontend.vercel.app` for `/about`, `/blog`, `/contact`, `/docs`, `/faq`, `/terms`, `/privacy` by providing root-level `app/<route>/page.js` pages.

## Root cause
The page **content** already exists at `app/legal-support/<route>/page.js`, but every consumer addresses these routes at **root level**:
- `client/components/Footer/Footer.js` — `NAV_LINKS` (`/about`, `/blog`, `/contact`) + `LEGAL_LINKS` (`/privacy`, `/terms`, `/faq`, `/docs`) use `<Link href>` to root paths.
- `client/app/sitemap.xml/route.js` declares `/about`, `/docs`, `/blog`, `/contact`, `/privacy`, `/terms` as canonical static routes (in `STATIC_PAGES`).
- `client/app/legal-support/contact/page.js:27` has an internal `<a href="/faq">`.
- `next.config.mjs` only rewrites `/api/*` to the backend; nothing covers these routes.

The `?_rsc=` 404s are Next.js App Router RSC preloads from client-side `<Link>` navigation — confirming a missing `page.js` at the linked path.

## Findings (verified via grep)
- `legal-support` appears **nowhere** as a URL/path in any source file. Nothing links to `/legal-support/<route>`, so relocating content to root and removing the folder is safe.
- The only internal absolute link among the content pages is `contact/page.js:27` → `/faq`; it currently 404s too and will resolve once the root `/faq` page exists.
- `/faq` is in the Footer `LEGAL_LINKS` but **commented out** in `sitemap.xml` STATIC_PAGES (line 12, inside the "Commented out: Premium pricing and FAQ pages" block). Reconcile: add an active `/faq` entry to the sitemap.
- `/pricing` is a **null stub** (`app/legal-support/pricing/page.js` returns `null`, marked commented-out premium feature). It is **not** in the 404 set. Remove the empty `legal-support/pricing` folder; leave `/pricing` commented out everywhere.

## Design decision (recommended, pending confirmation)
**Contradiction with original framing:** the user asked "which pages I needed to *add*", but the content already exists at `app/legal-support/<route>/page.js`. There are no *missing* pages — only a path mismatch. Resolve by picking a relocation strategy:

- **Option A (recommended) — Move content to root, delete `legal-support/`:** sitemap + Footer both treat root URLs (`/about`, `/blog`, …) as canonical and `legal-support/` is referenced nowhere, so root is the intended location. Single source of truth, no duplicate content, no redirect chains, clean URLs.
- **Option B — Add root-level redirect pages, keep `legal-support/`:** new `app/<route>/page.js` calls `redirect("/legal-support/<route>")`. Keeps content in one place, but the address bar ends up at the ugly `/legal-support/<route>` URL and the sitemap canonicalization (`/about`) mismatches the live URL.

> Decision needed before implementation: **A or B?** If the user simply wants the 404s gone with minimal risk, A is cleaner; if `legal-support/` paths must be preserved for external reasons, choose B and the `/faq` internal link in `contact/page.js` must be repointed to `/legal-support/faq` (it currently points to `/faq`).

Regardless of A/B, the canonical sitemap URLs remain root-level, which only Option A fully honors.

## Affected boundaries
- **New root pages** (moved from `legal-support/`): `about`, `blog`, `contact`, `docs`, `faq`, `terms`, `privacy`.
- **Removed**: entire `app/legal-support/` directory (and its `pricing` null stub).
- **Sitemap**: uncomment/add `/faq` entry. `/about`, `/docs`, `/blog`, `/contact`, `/privacy`, `/terms` already listed — just become backed by real pages.
- **Footer**: no change needed (already links root URLs).
- **Navbar**: no change (uses `STATIC_CATEGORIES` = img/pdf/dev/text tool categories, not these routes).
- **Route discovery** (`lib/pages.js` `getPages()`/`collect()`): will now also discover `/about`, `/blog`, etc. Verify no unintended side effects (see step 4).
- **ContentPage** import depth shifts from `../../../components/...` to `../../components/...` in each moved file.

## Ordered task list
1. Move each file from `app/legal-support/<route>/page.js` → `app/<route>/page.js`:
   - `about`, `blog`, `contact`, `docs`, `faq`, `terms`, `privacy`.
2. In each moved file, update the ContentPage import: `../../../components/ContentPage/ContentPage` → `../../components/ContentPage/ContentPage`.
   - Verify: `app/about/` → `../../` reaches `client/` → `client/components/ContentPage/ContentPage`. ✓ (file exists)
3. Confirm each moved page keeps its existing `export const metadata` (used for SEO; fine at root).
4. Verify `getPages()` consumers don't surface these new pages unexpectedly:
   - `app/layout.js:43` calls `getPages()` → passes `pages` to `<Navbar pages={pages} />` (Navbar ignores `pages`, uses `STATIC_CATEGORIES`).
   - `lib/pages.js` `getCategories(pages)` is used by `Footer` and home `ToolsCarousel` — both consume **categories** (img/pdf/dev/text), not content pages. The new root pages will appear in `getPages()` but are not added to any category via `buildCategories` (only `CATEGORY_ROUTES` routes are). So no stray nav entries. **No change needed.**
5. Delete the now-empty `app/legal-support/` directory (`about`, `blog`, `contact`, `docs`, `faq`, `terms`, `privacy`, `pricing`).
6. Reconcile sitemap (`app/sitemap.xml/route.js`): add an active `/faq` entry (it is linked in the Footer and now a live page). Keep `/pricing` commented out.
7. Lint the 7 moved files.
8. Build the site; confirm all 7 new root routes prerender with no 404s.

## Validation
- `npm run lint` — 0 errors on the 7 moved pages + sitemap.
- `npm run build` (Next.js 16 / App Router) — all routes statically prerendered, including `/about`, `/blog`, `/contact`, `/docs`, `/faq`, `/privacy`, `/terms`. No "page not found" at build, no `?_rsc` 404 at runtime.
- Manual: open deployed preview, click each Footer link (About, Blog, Contact, Privacy, Terms, FAQ, Docs) → no 404 in Network; `/faq` link inside the Contact page → resolves.
- `GET /sitemap.xml` contains `/about`, `/blog`, `/contact`, `/docs`, `/faq`, `/privacy`, `/terms` (live, non-commented).

## Risks & rollback
- **Inbound links to `/legal-support/<route>`**: verified none exist in source. If any external bookmarks existed, they'd break — acceptable given zero internal references. If a graceful transition is later required, a catch-all `app/legal-support/[...slug]/page.js` redirect can be added (not in scope now).
- **`/faq` duplicate in sitemap**: was previously commented out; adding it is additive and safe.
- **Rollback**: `git checkout` the 7 files + sitemap + directory. Since this is a move (not a copy), root-level files must be deleted and `legal-support/` restored from git.
- **No DB / backend changes** — these are static content pages only; zero backend impact.

## Out of scope
- `/pricing` (intentional null stub / premium feature).
- `PricingModal` → `/pricing` link (commented-out premium code).
- Replacing real page content (content is already written; only relocation + import fix).

## Post-completion workflow
Per `Rule.md`, update `Status.md` and `Phase.md` once the implementation task completes (this plan does not edit those non-plan docs).
