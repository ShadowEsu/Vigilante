# Backlink playbook — high-authority domains

Legitimate link building for Vigilante. Domain Rating rises from **editorial backlinks on trusted sites**, not spam directories.

## Already live (high DA)

| Source | DA | Action |
|--------|-----|--------|
| **GitHub repo** | ~96 | README links to live site — keep repo public, star-worthy |
| **GitHub Pages** | ~96 | Internal links between `/`, `/press`, `/resources/*` |

## Submit this week (free, high authority)

Use copy from [`/press`](../src/app/press/page.tsx) boilerplate.

### 1. Product Hunt
- URL: https://www.producthunt.com/posts/new
- Link to: `https://shadowesu.github.io/Vigilante/`
- Tagline: *3 AI agents monitor competitors — pricing, filings, hiring — from $10/mo*

### 2. Hacker News — Show HN
- Title: *Show HN: Vigilante – AI agents that diff competitor pages and write briefs*
- URL: live site + link to comparison page

### 3. AlternativeTo
- URL: https://alternativeto.net
- List as alternative to Klue, Crayon, Kompyte
- Category: Competitive Intelligence

### 4. SaaSHub
- URL: https://www.saashub.com/submit
- Category: Business Intelligence / Competitive Intelligence

### 5. BetaList
- URL: https://betalist.com/submit
- Early-access angle + waitlist

### 6. Slant.co / StackShare
- Add Vigilante under competitive intelligence / market research tools

### 7. Google Search Console
- Property: `https://shadowesu.github.io/Vigilante/`
- Submit sitemap: `.../sitemap.xml`

### 8. Bing Webmaster Tools
- Same sitemap submission

## Linkable assets (share these URLs)

| Page | Why people link |
|------|-----------------|
| `/resources/competitive-intelligence-tools` | Comparison list — journalists & bloggers cite these |
| `/competitive-intelligence` | Educational guide |
| `/press` | Media kit + embed badge |
| GitHub README | Open-source credibility |

## Embed badge (partners link back)

```html
<a href="https://shadowesu.github.io/Vigilante/" title="Vigilante">
  <img src="https://shadowesu.github.io/Vigilante/badge.svg" alt="Vigilante competitive intelligence" width="240" height="48" />
</a>
```

## Outreach templates

**Blog / newsletter:**
> We built [Vigilante](https://shadowesu.github.io/Vigilante/) — 3 AI agents that snapshot competitor pages and write sourced briefs ($10/mo). Comparison vs Klue/Crayon: [link to /resources/competitive-intelligence-tools]

**Podcast / interview:**
> Use short boilerplate from /press

## Avoid (hurts domain rating)

- Paid link farms, Fiverr "1000 backlinks"
- Irrelevant directory spam
- Exact-match anchor over-optimization
- Private blog networks (PBNs)

## Custom domain (biggest upgrade)

Move from `github.io/Vigilante` to `vigilant.app` — root domains accumulate authority faster than subpaths.

## DR strategy mapped to Vigilante (2026)

What actually moves Domain Rating — and what we already shipped on-site:

| DR tactic | Vigilante implementation |
|-----------|---------------------------|
| **Quality backlinks from authority sites** | Manual: Product Hunt, HN, AlternativeTo (see above). On-site: `/press` embed badge + cite-friendly boilerplate |
| **Link relevancy & diversity** | CI niche content only — guide, tools comparison, checklist. Mix editorial pages + GitHub README |
| **Internal linking / topic clusters** | Pillar `/competitive-intelligence` → hub `/resources` → cluster pages. `TopicClusterNav` + breadcrumb JSON-LD on every resource page |
| **Link-worthy content** | Checklist (citable framework), 2026 tools comparison, educational guide |
| **Technical SEO** | Sitemap, robots, schema (FAQ, Article, Breadcrumb), Core Web Vitals via static export, HTTPS via GitHub Pages |
| **Toxic link cleanup** | N/A for new domain — monitor GSC once indexed |

### Anchor text to use in outreach

- "competitive intelligence software" → `/competitive-intelligence`
- "best competitive intelligence tools" → `/resources/competitive-intelligence-tools`
- "competitor monitoring checklist" → `/resources/competitor-monitoring-checklist`
- "Vigilante" / brand → homepage

### DR expectations

- DR 0–30: A handful of links from DR 50+ sites (PH, GitHub stars, one blog mention) can move the needle quickly
- DR 30–50: Steady editorial links from SaaS/CI blogs; guest posts on niche sites
- DR 50+: Requires sustained PR, partnerships, and custom domain — not achievable from GitHub Pages subpath alone
