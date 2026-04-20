# SEO Audit Report — iamamitkumar.dev

**Date:** 2026-04-20  
**Framework:** Next.js 14 (App Router)  
**Auditor:** opencode (code-level verification)

---

## Summary

The external SEO audit tool overstated several issues. After verifying against the actual codebase, the real problems are fewer but more targeted. Key findings:

- **Title tags** are properly set in root layout but overridden on the home page to a short generic string
- **Meta descriptions** exist on all pages; only blog posts risk empty descriptions
- **Schema markup** is present on every page (Person JSON-LD) and blog posts (BlogPosting JSON-LD) — the audit tool missed these
- **Multiple H1 tags** come from the navbar and a step component, not from content
- **OG/Twitter images** have a fallback gap on blog posts without cover images

---

## Verified Issues

### P0 — Critical

| # | Issue | File | Line | Fix |
|---|-------|------|------|-----|
| 1 | Home title too short (11 chars) | `app/page.tsx` | 13 | Remove `title: "Amit Kumar"` override — root default `"Amit Kumar \| Agentic Architect & Full-Stack Engineer"` (54 chars) will apply |
| 2 | Navbar uses `<h1>` — adds extra H1 to every page | `components/navbar.tsx` | 47 | Change `<h1>` → `<div>` |
| 3 | Step component uses `<h1>` — creates 8 H1s on blog posts | `components/step-large-custom.tsx` | 8 | Change `<h1>` → `<h2>` |

### P1 — High

| # | Issue | File | Line | Fix |
|---|-------|------|------|-----|
| 4 | Blog posts without cover image lose OG/Twitter image entirely | `app/blog/[slug]/page.tsx` | 41, 48 | Add fallback: `images: post.image ? [post.image] : ["/images/og-image.png"]` |
| 5 | Blog posts with empty excerpt produce empty meta description | `app/blog/[slug]/page.tsx` | 33 | Add fallback description string |
| 6 | Tweet photo alt text relies on Twitter's `ext_alt_text` which is often empty | `components/minimal-tweet-card.tsx` | 68 | Add fallback alt text like `"Tweet photo"` |

### P2 — Medium

| # | Issue | File | Line | Fix |
|---|-------|------|------|-----|
| 7 | Inspiration page images have bare-bones alt text | `app/inspiration/page.tsx` | 23, 48, 173, 199, 207 | Expand alts (e.g. `alt="james"` → `alt="James — Product taste and storytelling"`) |
| 8 | Inspiration page images missing `loading="lazy"` | `app/inspiration/page.tsx` | 23, 48, 173, 199, 207 | Add `loading="lazy"` |
| 9 | Favicon only uses profile.jpg — no ICO/PNG/SVG formats | `app/layout.tsx` | 66-69 | Generate proper favicon.ico, favicon.svg, apple-touch-icon.png; update icon config |
| 10 | Subpage titles are short (18-24 chars) | `app/blog/page.tsx`, `app/tweets/page.tsx`, `app/inspiration/page.tsx`, `app/workflow/page.tsx`, `app/sponsor/page.tsx` | — | Expand titles with keyword-rich value propositions |

### P3 — Low / Nice-to-have

| # | Issue | File | Fix |
|---|-------|------|-----|
| 11 | No WebSite schema on root | `app/layout.tsx` | Add WebSite JSON-LD alongside Person schema |
| 12 | No ItemList schema on blog index | `app/blog/page.tsx` | Add ItemList/Blog JSON-LD for blog index |
| 13 | Manifest uses profile.jpg as icon | `app/manifest.ts` | Add proper PNG icon at 192x192 and 512x512 |

---

## Audit Tool Claims vs Reality

| Audit Claim | Verdict | Explanation |
|-------------|---------|-------------|
| 7/9 pages missing meta description | **Overstated** | All pages set descriptions via Next.js `Metadata`. Only risk: blog posts with empty excerpts. |
| Title too short on 5 pages | **Confirmed** | Root default is 54 chars (great), but home page overrides to 11 chars. Other pages are 18-24 chars. |
| 8 H1s on one blog post | **Confirmed** | Navbar H1 + step-large-custom H1 (used 7 times in MDX) = 8 H1s. |
| 34/36 images missing alt text | **Confirmed** | Tweet cards use empty alt strings; inspiration images have minimal alts. |
| 5/9 pages missing schema | **False** | Person JSON-LD renders on every page via root layout. Blog posts have BlogPosting JSON-LD. The tool likely missed `<script>` tags using `dangerouslySetInnerHTML`. |
| Missing og:image on 3 pages | **Confirmed** | Blog posts without `post.image` override the root OG config and produce no image. |
| Content too short on 3 pages | **Overstated** | `/blog`, `/tweets`, `/inspiration` are index/collection pages — short content is normal and expected. |
| Missing PNG/SVG favicon | **Confirmed** | Only `profile.jpg` is used for all icon types. |

---

## Implementation Checklist

- [x] P0-1: Fix home page title
- [x] P0-2: Fix navbar H1
- [x] P0-3: Fix step-large-custom H1
- [x] P1-4: Fix blog post OG/Twitter image fallback
- [x] P1-5: Fix blog post empty description fallback
- [x] P1-6: Fix tweet card alt text fallback
- [x] P2-7: Improve inspiration page alt text
- [x] P2-8: Add lazy loading to inspiration images
- [x] P2-9: Add proper favicon formats
- [x] P2-10: Expand subpage titles
- [ ] P3-11: Add WebSite schema
- [ ] P3-12: Add ItemList schema on blog index
- [ ] P3-13: Fix manifest icons
