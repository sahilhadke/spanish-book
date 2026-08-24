# Lectura — Resume Notes

Written 2026-08-24 overnight. Read this first when picking the session back up.

## Where things stand

**Phase 1 (core reading experience) is built, working, and committed to git** (first commit on `main`, local-only, no remote). This covers everything from the approved plan except the AI/BYOK tier, which was deliberately deferred (see below).

Working end to end and verified against a real commercial EPUB (the user's own "Harry Potter e a Pedra Filosofal" — Portuguese, uploaded mid-session):

- Upload → parse → library card (title/author/cover all extracted correctly)
- Reader: two-column pagination, drop caps, embedded fonts/images, TOC navigation, light/sepia/dark themes, font-size control, reading-position persistence across reloads
- Tap/select → popup: coordinate mapping across the chapter iframe works correctly (including in a two-column layout); conjugation reverse-lookup (bundled dataset, fully offline) and Wiktionary dictionary lookup (cached in IndexedDB after first fetch) both work; graceful "no definition found" fallback for non-Spanish text
- Save to vocabulary, with sentence-context extraction (`Intl.Segmenter`)
- Installable PWA: manifest correctly linked, service worker precaches the app shell, **offline navigation confirmed working** (including deep links like `/vocabulary`) using a GitHub-Pages-accurate static server, not just `vite preview`

## Where to pick up

```
cd C:\Users\sahil\Desktop\Projects\spanish-book
npm run dev -- --port 5186
```

Port 5186 specifically has the user's Harry Potter test book in its IndexedDB — use that port to keep testing against it, or any port for a fresh library.

Other useful scripts:
- `npm run gen:conjugations` — regenerate `static/data/conjugations.json` (only needed if `scripts/verb-list.mjs` changes)
- `npm run gen:icons` — regenerate placeholder app icons (real icons still needed eventually — see below)
- `npm run gen:fixture` — regenerate the synthetic test EPUB at `scripts/fixtures/sample-es.epub`
- `npm run build && node scripts/gh-pages-sim-server.mjs [port]` — the only way tested so far to accurately verify offline/SPA-fallback behavior; **`vite preview` does NOT work for this** (see bugs below)

## Real bugs found and fixed this session (worth knowing about)

1. **Svelte 5 `$state` objects can't go straight into IndexedDB.** `db.settings.put({ value: readerStyle })` was silently failing (structured-clone rejects the reactive proxy) — theme/font settings never actually persisted. Fixed with `$state.snapshot(readerStyle)` before writing. **If you add more settings that get written to IndexedDB from a Svelte component, snapshot them first.**

2. **`vite preview` is not a faithful test of PWA/offline behavior for this app.** It routes literal paths like `/200.html` through SvelteKit's own router (giving a SvelteKit 404 page, not the static file), which broke the service worker's install step (the precache fetch for the fallback page 404'd, so the worker went straight to `redundant` and never activated). Wrote `scripts/gh-pages-sim-server.mjs` — a ~40-line Node static server that replicates GitHub Pages' actual behavior (real files served as-is; anything else gets `404.html`'s content at a 404 status) — to test this properly. Use that, not `vite preview`, for any future PWA/offline verification.

3. **Adapter fallback filename fixed to `404.html`, not `200.html`.** `200.html` is the right convention for hosts that let you configure a custom 200-status rewrite (Netlify, Vercel); GitHub Pages specifically only auto-serves your fallback file's *content* for unmatched paths via its own 404 mechanism, so the file needs to be named `404.html` for the well-known GitHub Pages SPA trick to work. Set in `vite.config.ts` (`adapter({ fallback: '404.html' })` and the matching `SvelteKitPWA({ kit: { adapterFallback: '404.html', spa: true } })`).

4. **`@vite-pwa/sveltekit`'s `kit` options must be nested under a `kit: {}` key**, not passed flat alongside the regular VitePWA options — passing `adapterFallback` at the top level is silently ignored (no error, just doesn't do anything), which was the root cause of bug #3 above initially not taking effect.

5. **`vite-plugin-pwa` alone doesn't inject `<link rel="manifest">` into SvelteKit's `app.html`.** Switched to `@vite-pwa/sveltekit` (`SvelteKitPWA` instead of `VitePWA`) for the SvelteKit-aware build integration, but the manifest link, theme-color meta, and apple-touch-icon still had to be added to `src/app.html` by hand — there's no automatic HTML injection for SvelteKit's own `app.html` template.

## Known minor issues, not fixed (low priority)

- **Cosmetic**: on a chapter short enough not to fill the viewport (only seen with the synthetic test fixture, not the real book), there's a faint horizontal color band near the bottom of the page in dark/sepia themes — looked like it might be a foliate-js column-background-replication edge case. Not investigated further since it doesn't show on real, full-length chapters. Worth a look if it turns out to matter.
- Gender detection for Spanish nouns isn't implemented — Wiktionary's REST definition endpoint doesn't reliably expose it in a structured way; noted as a real gap in the original research too, not a regression.
- No spaced-repetition/review flow for vocabulary yet (was always V2 scope).

## Deliberately not started: the AI/BYOK tier

Per the plan, this needs the user's own Anthropic API key to build against meaningfully (nothing to test without one), so it was scoped out of this pass. Next up when resumed:
- Settings page: paste/store an Anthropic key (IndexedDB), masked display, clear/delete control, explicit "here's what gets sent" privacy notice
- "Explain further" — expands the Tier-1 popup, sends the selected phrase + its already-captured sentence context to Claude via `anthropic-dangerous-direct-browser-access`, streams the response, caches it in the existing `translationCache` table
- Graceful no-key state (nudge to add a key, never a dead button)

## Not yet done (known, deferred, not urgent)

- No GitHub repo/remote — this is all local-only per an earlier decision (repo name wasn't picked yet). `vite.config.ts` has a comment marking exactly where `paths: { base: '/<repo-name>' }` needs to go once that's decided.
- No GitHub Actions deploy workflow yet (depends on the above).
- Real device QA (iOS Safari / Android Chrome tap-hold) hasn't happened — everything selection-related has only been verified via programmatic selection in automated Chrome. This was always flagged as something only a real device can confirm.
- Icons are placeholder (a teal square with "L"), generated by `scripts/generate-icons.mjs` — fine for continued dev, will want real artwork before any real deployment.
- Playwright was scaffolded (`npm run test:e2e`) but no actual tests were written yet for this app's flows.
