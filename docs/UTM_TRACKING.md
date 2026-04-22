# UTM + Mixpanel Tracking — Spec

**Goal:** Know which post → which platform → which CTA click → which inquiry.

---

## Current Funnel

```
LinkedIn Post (or Twitter/Medium/Substack)
    ↓ UTM link
https://iamamitkumar.dev/?utm_source=linkedin&utm_content=li-post-0421
    ↓ CTA click
mailto:hi@iamamitkumar.dev?subject=MVP Sprint Request
```

**What you want to see in Mixpanel:**
"LinkedIn post [content_id] drove 3 MVP Sprint clicks, 1 Build+GTM click. Substack newsletter drove 2 Collaborate clicks."

---

## UTM Naming Convention

```
utm_source = platform
  → linkedin, twitter, medium, substack, producthunt, direct

utm_medium = content_type
  → post, thread, newsletter, story, dm, bio

utm_campaign = theme_series
  → ai-agents-week1, cold-email-basics, brand-strategy, launch, default

utm_content = post_id
  → li-post-MMDD, tw-thread-MMDD, sub-MMDD, ph-post-name
  → Example: li-post-0421, tw-thread-0421, sub-post-0421
```

**Example full UTM link:**
```
https://iamamitkumar.dev/?utm_source=linkedin&utm_medium=post&utm_campaign=ai-agents-week1&utm_content=li-post-0421
```

---

## Mixpanel Events to Track

### 1. Page View (auto)
```javascript
// Captured by Mixpanel SDK automatically
// Plus: capture UTM params on page load
mixpanel.track_pageview()
```

### 2. CTA Click — Mailto
```javascript
trackCTA("mailto", {
  subject: "MVP Sprint",       // which service
  source: "linkedin",
  medium: "post",
  campaign: "ai-agents-week1",
  content: "li-post-0421"
})
```

### 3. External Product Click
```javascript
trackCTA("external", {
  product: "vidotask",          // which product
  destination: "https://vidotask.com",
  source: "linkedin",
  medium: "post",
  campaign: "ai-agents-week1",
  content: "li-post-0421"
})
```

### 4. Newsletter Signup (if added)
```javascript
trackCTA("newsletter", {
  source: "linkedin",
  content: "li-post-0421"
})
```

---

## Mixpanel Properties

Every event auto-includes:
```
$os, $browser, $device
Current URL
Referring URL
City/Country (from IP)
```

Custom properties per event:
```
source_platform  → linkedin | twitter | medium | substack | direct
content_type    → post | thread | newsletter | story | dm
campaign_theme  → ai-agents | cold-email | brand | launch
post_id         → li-post-0421
cta_type        → mvp-sprint | build-gtm | collaborate | product
```

---

## Dashboard Views (Mixpanel)

### 1. Traffic by Platform
- Bar chart: visits by utm_source
- Breakdown by utm_medium

### 2. CTA Performance by Post
- Table: post_id → CTA clicks → email signups
- Sortable by clicks, conversions

### 3. Funnel: Visit → CTA Click → [Revenue]
- Mailto click rate by platform
- MVP Sprint vs Build+GTM split

### 4. Campaign ROI
- Per campaign: visits → clicks → conversion rate
- Best performing content type per platform

---

## Implementation

### Files to add/edit:
1. `lib/analytics.ts` — Mixpanel tracking utility
2. `app/layout.tsx` — Add Mixpanel SDK
3. `app/providers.tsx` — Wrap with analytics provider
4. `.env.local` — Add Mixpanel token
5. `components/LinkWrapper.tsx` — Auto-track external + mailto links
6. `docs/UTM_TRACKING.md` — This file

### Environment variables:
```
NEXT_PUBLIC_MIXPANEL_TOKEN=your_token_here
```

---

## UTM Link Generator

For each social post, generate a link:
```
platform=linkedin, content_type=post, theme=ai-agents, date=Apr21
→ https://iamamitkumar.dev/?utm_source=linkedin&utm_medium=post&utm_campaign=ai-agents-week1&utm_content=li-post-0421
```

Short version (for posts with character limits):
- Use Bitly or your own redirect service
- Point to: `https://iamamitkumar.dev/?utm_source=linkedin&utm_content=li-post-0421`
- Add campaign via URL builder in Notion

---

## PostHog Alternative

If Mixpanel feels heavy, PostHog gives you:
- Same UTM attribution
- Session recordings (see how people navigate)
- Free for 1M events/mo
- EU hosting available

For now, Mixpanel first. PostHog is the fallback.