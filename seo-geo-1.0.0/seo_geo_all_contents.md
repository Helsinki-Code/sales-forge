# SEO Geo Workspace Contents

This document contains the complete contents of all files in the `seo-geo-1.0.0` folder.

---

## File: `SKILL.md`

````markdown
---
name: seo-geo
description: |
  SEO & GEO (Generative Engine Optimization) for websites.
  Analyze keywords, generate schema markup, optimize for AI search engines
  (ChatGPT, Perplexity, Gemini, Copilot, Claude) and traditional search (Google, Bing).
  Use when user wants to improve search visibility.
triggers:
  - SEO
  - GEO
  - search optimization
  - schema markup
  - JSON-LD
  - meta tags
  - keyword research
  - search ranking
  - AI visibility
  - ChatGPT ranking
  - Perplexity
  - Google AI Overview
  - indexing
metadata:
  mcpmarket-version: 1.0.0
---
# SEO/GEO Optimization Skill

Comprehensive SEO and GEO (Generative Engine Optimization) for websites. Optimize for both traditional search engines (Google, Bing) and AI search engines (ChatGPT, Perplexity, Gemini, Copilot, Claude).

## Quick Reference

**GEO = Generative Engine Optimization** - Optimizing content to be cited by AI search engines.

**Key Insight:** AI search engines don't rank pages - they **cite sources**. Being cited is the new "ranking #1".

## Workflow

### Step 1: Website Audit

Get the target URL and analyze current SEO/GEO status.

**Basic SEO Audit (Free):**
```bash
python3 scripts/seo_audit.py "https://example.com"
```
**Use this for**: Quick technical SEO check (title, meta, H1, robots, sitemap, load time). No API needed.

---

**Check Meta Tags:**
```bash
curl -sL "https://example.com" | grep -E "<title>|<meta name=\"description\"|<meta property=\"og:|application/ld\+json" | head -20
```

**Use this for**: Quick check of essential meta tags and schema markup on any webpage.

---

**Check robots.txt:**
```bash
curl -s "https://example.com/robots.txt"
```

**Use this for**: Verify which bots are allowed/blocked. Critical for ensuring AI search engines can crawl your site.

---

**Check sitemap:**
```bash
curl -s "https://example.com/sitemap.xml" | head -50
```

**Use this for**: Verify sitemap structure and ensure all important pages are included for search engine discovery.

**Verify AI Bot Access:**
```
# These bots should be allowed in robots.txt:
- Googlebot (Google)
- Bingbot (Bing/Copilot)
- PerplexityBot (Perplexity)
- ChatGPT-User (ChatGPT with browsing)
- ClaudeBot / anthropic-ai (Claude)
- GPTBot (OpenAI)
```

### Step 2: Keyword Research

Use **WebSearch** to research target keywords:

```
WebSearch: "{keyword} keyword difficulty site:ahrefs.com OR site:semrush.com"
WebSearch: "{keyword} search volume 2026"
WebSearch: "site:{competitor.com} {keyword}"
```

**Analyze:**
- Search volume and difficulty
- Competitor keyword strategies
- Long-tail keyword opportunities
- International keyword conflicts (e.g., "OPC" = industrial automation in English markets)

### Step 3: GEO Optimization (AI Search Engines)

Apply the **9 Princeton GEO Methods** (see [references/geo-research.md](./references/geo-research.md)):

| Method | Visibility Boost | How to Apply |
|--------|-----------------|--------------|
| **Cite Sources** | +40% | Add authoritative citations and references |
| **Statistics Addition** | +37% | Include specific numbers and data points |
| **Quotation Addition** | +30% | Add expert quotes with attribution |
| **Authoritative Tone** | +25% | Use confident, expert language |
| **Easy-to-understand** | +20% | Simplify complex concepts |
| **Technical Terms** | +18% | Include domain-specific terminology |
| **Unique Words** | +15% | Increase vocabulary diversity |
| **Fluency Optimization** | +15-30% | Improve readability and flow |
| ~~Keyword Stuffing~~ | **-10%** | **AVOID - hurts visibility** |

**Best Combination:** Fluency + Statistics = Maximum boost

**Generate FAQPage Schema** (+40% AI visibility):
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What is [topic]?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "According to [source], [answer with statistics]."
    }
  }]
}
```

**Optimize Content Structure:**
- Use "answer-first" format (direct answer at top)
- Clear H1 > H2 > H3 hierarchy
- Bullet points and numbered lists
- Tables for comparison data
- Short paragraphs (2-3 sentences max)

### Step 4: Traditional SEO Optimization

**Meta Tags Template:**
```html
<title>{Primary Keyword} - {Brand} | {Secondary Keyword}</title>
<meta name="description" content="{Compelling description with keyword, 150-160 chars}">
<meta name="keywords" content="{keyword1}, {keyword2}, {keyword3}">

<!-- Open Graph -->
<meta property="og:title" content="{Title}">
<meta property="og:description" content="{Description}">
<meta property="og:image" content="{Image URL 1200x630}">
<meta property="og:url" content="{Canonical URL}">
<meta property="og:type" content="website">

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{Title}">
<meta name="twitter:description" content="{Description}">
<meta name="twitter:image" content="{Image URL}">
```

**JSON-LD Schema** (see [references/schema-templates.md](./references/schema-templates.md)):
- WebPage / Article for content pages
- FAQPage for FAQ sections
- Product for product pages
- Organization for about pages
- SoftwareApplication for tools/apps

**Check Content:**
- [ ] H1 contains primary keyword
- [ ] Images have descriptive alt text
- [ ] Internal links to related content
- [ ] External links have `rel="noopener noreferrer"`
- [ ] Content is mobile-friendly
- [ ] Page loads in < 3 seconds

### Step 5: Validate & Monitor

**Schema Validation:**
```bash
# Open Google Rich Results Test
open "https://search.google.com/test/rich-results?url={encoded_url}"

# Open Schema.org Validator
open "https://validator.schema.org/?url={encoded_url}"
```

**Check Indexing Status:**
```bash
# Google (use Search Console API or manual check)
open "https://www.google.com/search?q=site:{domain}"

# Bing
open "https://www.bing.com/search?q=site:{domain}"
```

**Generate Report:**
```markdown
## SEO/GEO Optimization Report

### Current Status
- Meta Tags: ✅/❌
- Schema Markup: ✅/❌
- AI Bot Access: ✅/❌
- Mobile Friendly: ✅/❌
- Page Speed: X seconds

### Recommendations
1. [Priority 1 action]
2. [Priority 2 action]
3. [Priority 3 action]

### GEO Optimizations Applied
- [ ] FAQPage schema added
- [ ] Statistics included
- [ ] Citations added
- [ ] Answer-first structure
```

## Platform-Specific Optimization

See [references/platform-algorithms.md](./references/platform-algorithms.md) for detailed ranking factors.

### ChatGPT
- Focus on **branded domain authority** (cited 11% more than third-party)
- Update content within **30 days** (3.2x more citations)
- Build **backlinks** (>350K referring domains = 8.4 avg citations)
- Match content style to ChatGPT's response format

### Perplexity
- Allow **PerplexityBot** in robots.txt
- Use **FAQ Schema** (higher citation rate)
- Host **PDF documents** (prioritized for citation)
- Focus on **semantic relevance** over keywords

### Google AI Overview (SGE)
- Optimize for **E-E-A-T** (Experience, Expertise, Authority, Trust)
- Use **structured data** (Schema markup)
- Build **topical authority** (content clusters + internal linking)
- Include **authoritative citations** (+132% visibility)

### Microsoft Copilot / Bing
- Ensure **Bing indexing** (required for citation)
- Optimize for **Microsoft ecosystem** (LinkedIn, GitHub mentions help)
- Page speed **< 2 seconds**
- Clear **entity definitions**

### Claude AI
- Ensure **Brave Search indexing** (Claude uses Brave, not Google)
- High **factual density** (data-rich content preferred)
- Clear **structural clarity** (easy to extract)

## Skill Dependencies

This skill works best with:
- **twitter skill** - Search SEO experts for latest tips
- **reddit skill** - Search r/SEO, r/bigseo for discussions
- **WebSearch** - Keyword research and competitor analysis

## References

- [references/platform-algorithms.md](./references/platform-algorithms.md) - Detailed ranking factors for each platform
- [references/geo-research.md](./references/geo-research.md) - Princeton GEO research (9 methods)
- [references/schema-templates.md](./references/schema-templates.md) - JSON-LD templates
- [references/seo-checklist.md](./references/seo-checklist.md) - Complete SEO audit checklist
- [references/tools-and-apis.md](./references/tools-and-apis.md) - Tools and API reference
- [examples/opc-skills-case-study.md](./examples/opc-skills-case-study.md) - Real-world optimization example

````

---

## File: `examples/opc-skills-case-study.md`

````markdown
# Case Study: OPC Skills Website SEO/GEO Optimization

Real-world example of applying SEO and GEO optimization to opc.dev.

---

## Background

**Website:** opc.dev  
**Product:** AI Agent Skills for Solopreneurs  
**Platforms:** Claude Code, Cursor, Codex, Factory Droid, OpenCode  
**Date:** January 2026

### Initial Status

| Metric | Status |
|--------|--------|
| Google Indexed | ❌ No |
| Bing Indexed | ❌ No |
| Schema Markup | ❌ None |
| FAQ Section | ❌ None |
| Meta Tags | ⚠️ Basic |
| AI Bot Access | ⚠️ Not configured |

---

## Problem Analysis

### 1. Keyword Conflict

The term "OPC" has different meanings in different markets:

| Market | "OPC" Meaning |
|--------|--------------|
| English (Industrial) | OPC UA - Industrial automation protocol |
| Chinese | 一人公司 (One Person Company) |
| Solopreneur | One Person Company (intended meaning) |

**Decision:** Focus on long-tail keywords for English market:
- "AI agent skills for solopreneurs"
- "Claude Code skills"
- "indie hacker tools"

### 2. Missing Schema Markup

No structured data meant:
- No rich results in Google
- Poor AI visibility
- No FAQ display

### 3. No GEO Optimization

Content lacked:
- Statistics and data points
- Expert citations
- FAQ format
- Answer-first structure

---

## Implementation

### Phase 1: Meta Tags Optimization

**Before:**
```html
<title>OPC Skills</title>
<meta name="description" content="Skills for one person companies">
```

**After:**
```html
<title>OPC Skills - AI Agent Skills for Solopreneurs & Indie Hackers | Claude Code, Cursor, Codex</title>
<meta name="description" content="10+ AI agent skills for solopreneurs. Domain hunting, social media research, logo creation. Works with Claude Code, Cursor, Codex, Factory Droid. One-click install, 100% open source.">
```

**Keywords targeted:**
- solopreneur (high intent, low competition)
- indie hacker (community term)
- Claude Code skills (specific platform)
- AI agent skills (emerging category)

### Phase 2: Schema Markup Implementation

Added comprehensive JSON-LD:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "name": "OPC Skills - AI Agent Skills for Solopreneurs",
      "description": "10+ agent skills for Claude Code, Cursor, Codex...",
      "dateModified": "2026-01-20",
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": ["h1", ".hero-description", ".faq-answer"]
      }
    },
    {
      "@type": "SoftwareApplication",
      "name": "OPC Skills",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Cross-platform",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is OPC Skills?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "OPC Skills is a collection of 10+ AI agent skills..."
          }
        }
        // 12 total FAQ items
      ]
    }
  ]
}
```

### Phase 3: GEO Optimization (Princeton Methods)

#### Statistics Addition (+37%)

**Before:**
```
"Skills for one person companies"
```

**After:**
```
"10+ Skills | 5 Platforms | One-Click Install | 100% Open Source"
```

#### FAQ Section (+40% AI Visibility)

Added 12 FAQ questions targeting high-search queries:

1. What is OPC Skills?
2. What platforms does OPC Skills support?
3. How do I install OPC Skills?
4. Is OPC Skills free?
5. What skills are included in OPC Skills?
6. How does the domain-hunter skill work?
7. Can I use OPC Skills with Claude Code?
8. What is the twitter skill used for?
9. How do I create a logo with OPC Skills?
10. Is OPC Skills open source?
11. How do I contribute to OPC Skills?
12. What is a solopreneur?

#### Authoritative Tone (+25%)

**Before:**
```
"Some tools for solo workers"
```

**After:**
```
"AI Agent Skills for Solopreneurs - The definitive skill library for 
one-person companies. Trusted by indie hackers worldwide."
```

#### Citations (+40%)

Added references to:
- Anthropic (Claude Code official documentation)
- Industry statistics on solopreneur growth
- Sam Altman's "billion-dollar one-person company" prediction

### Phase 4: AI Bot Configuration

Updated robots.txt considerations:

```
# Allow AI bots for GEO visibility
User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /
```

### Phase 5: Hero Section Rewrite

**Before:**
```
OPC Skills
Skills for OPCs
```

**After:**
```
AI Agent Skills for Solopreneurs

The skill library for one-person companies. 
Install once, use everywhere.

10+ Skills | 5 Platforms | One-Click Install | 100% Open Source
```

---

## Results

### Technical Improvements

| Metric | Before | After |
|--------|--------|-------|
| Meta Title | "OPC Skills" | Full keyword-rich title |
| Meta Description | 20 chars | 155 chars |
| Schema Types | 0 | 4 (WebPage, Software, FAQ, Org) |
| FAQ Items | 0 | 12 |
| Statistics | 0 | 4 key metrics |

### SEO Improvements

| Factor | Before | After |
|--------|--------|-------|
| Title keyword match | ❌ | ✅ |
| Description keyword match | ❌ | ✅ |
| Structured data | ❌ | ✅ |
| Rich results eligible | ❌ | ✅ |

### GEO Improvements

| Princeton Method | Applied | Expected Boost |
|-----------------|---------|----------------|
| Cite Sources | ✅ | +40% |
| Statistics | ✅ | +37% |
| FAQ Schema | ✅ | +40% |
| Authoritative Tone | ✅ | +25% |
| Easy Language | ✅ | +20% |

**Estimated total GEO visibility boost: 40-60%**

---

## Lessons Learned

### 1. Keyword Research is Critical

The "OPC" keyword conflict could have hurt visibility. Long-tail keywords solved this:
- "solopreneur tools" > "OPC tools"
- "Claude Code skills" > "AI skills"

### 2. FAQPage Schema is High-Impact

Adding 12 FAQ items with proper schema:
- Enables rich results
- Provides AI-extractable content
- Targets specific search queries

### 3. Statistics Make Content Quotable

"10+ Skills | 5 Platforms | One-Click Install | 100% Open Source"

These specific numbers are:
- Easy for AI to extract
- Memorable for users
- Differentiated from competitors

### 4. Answer-First Structure

Each FAQ answer starts with a direct answer:
- "OPC Skills is a collection of..." (not "Well, it depends...")
- This matches AI response patterns

---

## Next Steps

### Short-term (1 month)

- [ ] Submit sitemap to Google Search Console
- [ ] Submit to Bing Webmaster Tools
- [ ] Monitor indexing progress
- [ ] Track FAQ rich results

### Medium-term (3 months)

- [ ] Monitor AI citation rate
- [ ] A/B test different FAQ questions
- [ ] Build backlinks from dev communities
- [ ] Create content for Reddit/HN

### Long-term (6 months)

- [ ] Establish "OPC Skills = Solopreneur tools" brand
- [ ] Rank for "Claude Code skills" in AI search
- [ ] Get cited in AI responses about solopreneur tools

---

## Replication Guide

To replicate this optimization for your own site:

1. **Audit current state** using seo-geo skill checklist
2. **Research keywords** - find long-tail opportunities
3. **Write meta tags** - include primary keyword in title/description
4. **Add Schema markup** - start with FAQPage and WebPage
5. **Apply Princeton methods** - statistics, citations, structure
6. **Configure AI bot access** - robots.txt
7. **Validate schema** - Google Rich Results Test
8. **Submit to search engines** - Search Console, Bing Webmaster
9. **Monitor and iterate** - track visibility, adjust content

---

## Files Changed

| File | Changes |
|------|---------|
| `website/worker.js` | Meta tags, Schema, Hero section, FAQ section, Stats bar |
| `README.md` | Badges, navigation links, updated tagline |
| `docs/MARKETING_SPEC.md` | Comprehensive marketing plan (new) |

````

---

## File: `references/geo-research.md`

````markdown
# GEO Research: Princeton Study & Optimization Methods

## Paper Overview

**Title:** GEO: Generative Engine Optimization  
**Authors:** Princeton University, IIT Delhi, Georgia Tech, Allen Institute for AI  
**Published:** November 2023 (arXiv:2311.09735)  
**Accepted:** KDD 2024 (30th ACM SIGKDD Conference)  
**Link:** https://arxiv.org/abs/2311.09735

---

## Key Findings

### What is GEO?

**Generative Engine Optimization (GEO)** is a novel framework to help content creators improve their visibility in **generative engine responses** (AI search engines like ChatGPT, Perplexity, Google SGE).

Unlike traditional SEO (ranking in search results), GEO focuses on **being cited** by AI systems.

### Core Results

| Metric | Result |
|--------|--------|
| **Maximum Visibility Boost** | Up to 40% |
| **Low-ranking Sites Boost** | Up to 115% with citations |
| **GEO-bench Dataset** | 10,000+ queries across domains |
| **Tested on** | Perplexity.ai (commercial GE) |

### Why GEO Matters

1. **Traditional search engines are being replaced** by generative engines
2. **Content creators have little control** over how their content appears in AI responses
3. **GEO provides systematic methods** to improve visibility
4. **Different domains need different strategies** - no one-size-fits-all

---

## The 9 Optimization Methods

### Method 1: Cite Sources (+40%)

**What:** Add authoritative citations and references to your content.

**Why it works:** AI systems prefer content that appears well-researched and credible. Citations signal authority.

**How to apply:**
```markdown
# Before
"Studies show that AI improves productivity."

# After
"According to a 2024 Stanford University study, AI tools improve developer 
productivity by 55% on average (Chen et al., 2024)."
```

**Best for:** All content types, especially academic/professional topics.

---

### Method 2: Statistics Addition (+37%)

**What:** Include specific numbers, data points, and quantitative information.

**Why it works:** AI systems prioritize factual, verifiable information. Numbers make content more quotable.

**How to apply:**
```markdown
# Before
"Many companies use AI for customer service."

# After
"67% of Fortune 500 companies now use AI chatbots for customer service, 
handling an average of 85% of routine inquiries without human intervention."
```

**Best for:** Business, finance, technology, health content.

---

### Method 3: Quotation Addition (+30%)

**What:** Add expert quotes with proper attribution.

**Why it works:** Quotes from recognized experts boost credibility and provide extractable content for AI.

**How to apply:**
```markdown
# Before
"AI will transform the workforce."

# After
"'We're likely to see the first one-person billion-dollar company in the 
next few years,' predicts Sam Altman, CEO of OpenAI. 'AI will be the 
great equalizer for small businesses.'"
```

**Best for:** Law, academic, news, thought leadership content.

---

### Method 4: Authoritative Tone (+25%)

**What:** Write with confidence and expertise.

**Why it works:** AI systems assess content quality partly through linguistic signals of authority.

**How to apply:**
```markdown
# Before
"This might help with SEO, I think."

# After
"This strategy demonstrably improves SEO performance. Based on our 
analysis of 10,000 websites, implementing structured data increases 
organic traffic by an average of 30%."
```

**Best for:** Business, professional services, technical documentation.

---

### Method 5: Easy-to-Understand (+20%)

**What:** Simplify complex concepts for broader accessibility.

**Why it works:** AI aims to provide helpful answers to users of all knowledge levels.

**How to apply:**
```markdown
# Before
"The RAG architecture utilizes vector embeddings for semantic retrieval 
in conjunction with LLM-based generation."

# After
"RAG (Retrieval-Augmented Generation) works like a research assistant: 
it first searches for relevant information, then uses AI to write a 
coherent answer based on what it found."
```

**Best for:** Health, education, general consumer content.

---

### Method 6: Technical Terms (+18%)

**What:** Include domain-specific terminology appropriately.

**Why it works:** Technical terms signal expertise and help AI match content to specialized queries.

**How to apply:**
```markdown
# Before
"The website loads slowly."

# After
"The website suffers from poor Core Web Vitals: LCP (Largest Contentful 
Paint) exceeds 4 seconds, and CLS (Cumulative Layout Shift) scores 0.3, 
indicating significant layout instability."
```

**Best for:** Technology, science, medical, legal content.

---

### Method 7: Unique Words (+15%)

**What:** Increase vocabulary diversity and use distinctive phrasing.

**Why it works:** Diverse vocabulary indicates depth of knowledge and makes content more distinguishable.

**How to apply:**
- Use synonyms and varied terminology
- Avoid repetitive phrasing
- Include industry-specific jargon where appropriate
- Add contextual variations

**Best for:** All content types.

---

### Method 8: Fluency Optimization (+15-30%)

**What:** Improve readability, flow, and grammatical quality.

**Why it works:** Well-written content is easier for AI to parse and more likely to be selected as authoritative.

**How to apply:**
- Use clear sentence structure
- Maintain logical flow between paragraphs
- Eliminate redundancy
- Use transition words
- Keep paragraphs focused (2-3 sentences)

**Best for:** All content types.

---

### Method 9: Keyword Stuffing (-10%) ⚠️

**What:** Overloading content with target keywords.

**Why it HURTS:** Unlike traditional SEO, keyword stuffing actively decreases AI visibility.

**Avoid:**
```markdown
# BAD - Keyword stuffing
"SEO optimization for SEO is the best SEO strategy. Our SEO experts 
provide SEO services for all your SEO needs. SEO is important for SEO."

# GOOD - Natural writing
"Search engine optimization is essential for online visibility. Our 
experts help businesses improve their search rankings through strategic 
content development and technical improvements."
```

---

## Best Combinations

The Princeton research found that combining methods yields better results:

| Combination | Effectiveness |
|-------------|--------------|
| **Fluency + Statistics** | Highest overall boost |
| **Citations + Authoritative Tone** | Best for professional content |
| **Easy Language + Statistics** | Best for consumer content |
| **Technical Terms + Citations** | Best for academic/scientific |

---

## Domain-Specific Recommendations

| Domain | Best Methods | Avoid |
|--------|-------------|-------|
| **Technology** | Technical Terms, Citations, Statistics | Oversimplification |
| **Business/Finance** | Statistics, Authoritative Tone, Citations | Vague claims |
| **Healthcare** | Easy Language, Statistics, Citations | Jargon overload |
| **Legal** | Citations, Quotations, Authoritative Tone | Informal language |
| **Education** | Easy Language, Examples, Structure | Complexity |
| **E-commerce** | Statistics, Social Proof, Clear Benefits | Feature dumps |

---

## GEO Metrics

The paper introduces visibility metrics for evaluating GEO effectiveness:

### Position-Adjusted Word Count

Measures how much of your content appears in AI responses, weighted by position (earlier = better).

### Subjective Impression Score

Human evaluation of how prominently your content is featured in responses.

### Word Count Share

Percentage of AI response that comes from your content vs. competitors.

---

## Implementation Checklist

### Content Optimization

- [ ] Add 2-3 authoritative citations per major section
- [ ] Include at least 5 relevant statistics with sources
- [ ] Add 1-2 expert quotes with attribution
- [ ] Use confident, authoritative language
- [ ] Ensure content is accessible to general audience
- [ ] Include appropriate technical terminology
- [ ] Vary vocabulary throughout
- [ ] Improve overall fluency and readability
- [ ] Remove any keyword stuffing

### Structure Optimization

- [ ] Use "answer-first" format (direct answer at top)
- [ ] Clear H1 > H2 > H3 hierarchy
- [ ] Bullet points for lists
- [ ] Tables for comparisons
- [ ] Short paragraphs (2-3 sentences)
- [ ] Logical flow between sections

### Schema Optimization

- [ ] Implement FAQPage schema (+40% AI visibility)
- [ ] Add Article schema with author info
- [ ] Include datePublished and dateModified
- [ ] Add SpeakableSpecification for voice search

---

## Validation on Commercial Platforms

The researchers validated GEO methods on **Perplexity.ai**, a commercial generative engine:

| Method | Visibility Increase |
|--------|-------------------|
| Cite Sources | Up to 37% |
| Statistics | Up to 35% |
| Quotations | Up to 28% |
| Combined methods | Up to 40% |

These results confirm that GEO methods work on real-world AI search engines, not just research benchmarks.

---

## Future of GEO

The paper concludes that GEO is essential for:

1. **Content creators** - Maintain visibility in AI-dominated search
2. **Businesses** - Ensure brand presence in AI responses
3. **Publishers** - Adapt to the citation economy
4. **SEO professionals** - Evolve practices for generative search

As AI search engines become more prevalent, GEO will become as important as traditional SEO.

````

---

## File: `references/google-docs-summary.md`

```markdown
# Google Official SEO Documentation Summary

Quick reference from Google Search Central.

---

## Search Three-Stage Process

| Stage | Description | Focus |
|-------|-------------|-------|
| **Crawling** | Googlebot discovers pages | robots.txt, sitemap, links |
| **Indexing** | Content analyzed and stored | Quality, canonical, noindex |
| **Serving** | Results returned | Relevance, E-E-A-T, UX |

---

## Core Web Vitals

| Metric | Good | Needs Work | Poor |
|--------|------|------------|------|
| **LCP** | < 2.5s | 2.5-4s | > 4s |
| **FID** | < 100ms | 100-300ms | > 300ms |
| **CLS** | < 0.1 | 0.1-0.25 | > 0.25 |

---

## Structured Data Types

| Type | Use Case | Rich Result |
|------|----------|-------------|
| FAQPage | FAQ content | Expandable Q&A |
| Article | Blog/news | Title + date |
| Product | E-commerce | Price + rating |
| HowTo | Tutorials | Steps |
| VideoObject | Video | Thumbnail |
| BreadcrumbList | Navigation | Breadcrumbs |

---

## Spam Policies (Avoid)

- Keyword stuffing
- Hidden text/links
- Link schemes
- Auto-generated content
- Scraped content
- Cloaking

---

## Official Tools

| Tool | URL |
|------|-----|
| Search Console | search.google.com/search-console |
| Rich Results Test | search.google.com/test/rich-results |
| PageSpeed Insights | pagespeed.web.dev |
| Mobile-Friendly Test | search.google.com/test/mobile-friendly |

---

## Reference

- https://developers.google.com/search
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide

```

---

## File: `references/platform-algorithms.md`

````markdown
# Platform Ranking Algorithms

Detailed ranking factors for AI search engines and traditional search engines (2025-2026).

---

## 1. ChatGPT Ranking Factors

### Core Ranking System

ChatGPT uses a **two-phase system**:
1. **Pre-training Knowledge** - Built from diverse datasets (Wikipedia, books, web)
2. **Real-time Retrieval** - Web browsing for current information

### Ranking Factor Weights

| Factor | Weight | Details |
|--------|--------|---------|
| **Authority & Credibility** | 40% | Branded domains preferred over third-party |
| **Content Quality & Utility** | 35% | Clear structure, comprehensive answers |
| **Platform Trust** | 25% | Wikipedia, Reddit, Forbes prioritized |

### Key Findings (SE Ranking Study - 129K domains)

| Metric | Impact |
|--------|--------|
| **Referring Domains** | Strongest predictor. >350K domains = 8.4 avg citations |
| **Domain Trust Score** | 91-96 score = 6 citations; 97-100 = 8.4 citations |
| **Content Recency** | 30-day old content gets 3.2x more citations |
| **Branded vs Third-party** | Branded domains cited 11.1 points more than third-party |

### ChatGPT Top Citation Sources

| Rank | Source | % of Citations |
|------|--------|---------------|
| 1 | Wikipedia | 7.8% |
| 2 | Reddit | 1.8% |
| 3 | Forbes | 1.1% |
| 4 | Brand Official Sites | Variable |
| 5 | Academic Sources | Variable |

### Content-Answer Fit Analysis (400K pages study)

| Factor | Relevance |
|--------|-----------|
| **Content-Answer Fit** | 55% - Most important! Match ChatGPT's response style |
| **On-Page Structure** | 14% - Clear headings, formatting |
| **Domain Authority** | 12% - Helps retrieval, not citation |
| **Query Relevance** | 12% - Match user intent |
| **Content Consensus** | 7% - Agreement among sources |

### Optimization Checklist

- [ ] Build strong backlink profile (quality > quantity)
- [ ] Update content within 30 days
- [ ] Use clear H1/H2/H3 structure
- [ ] Include verifiable statistics with citations
- [ ] Write in ChatGPT's conversational style
- [ ] Ensure domain has high trust score

---

## 2. Perplexity AI Ranking Factors

### Architecture

Perplexity uses **Retrieval-Augmented Generation (RAG)** with a **3-layer reranking system**:

1. **Layer 1 (L1)**: Basic relevance retrieval
2. **Layer 2 (L2)**: Traditional ranking factors scoring
3. **Layer 3 (L3)**: ML models for quality evaluation (can discard entire result sets)

### Core Ranking Factors

| Factor | Details |
|--------|---------|
| **Authoritative Domain Lists** | Manual lists: Amazon, GitHub, academic sites get inherent boost |
| **Freshness Signals** | Time decay algorithm; new content evaluated quickly |
| **Semantic Relevance** | Content similarity to query (not keyword matching) |
| **Topical Weighting** | Tech, AI, Science topics get visibility multipliers |
| **User Engagement** | Click rates, weekly performance metrics |
| **New Post Performance** | Early clicks significantly boost visibility |

### Perplexity Sonar Model Insights

| Signal | Impact |
|--------|--------|
| **FAQ Schema (JSON-LD)** | Pages with FAQ blocks cited more often |
| **PDF Documents** | Publicly hosted PDFs prioritized |
| **Content Velocity** | Speed of publishing matters more than keyword density |
| **Semantic Payloads** | Clear, atomic paragraphs preferred |
| **YouTube Sync** | YouTube titles matching trending queries get boost |

### Technical Requirements

```
# robots.txt - Allow PerplexityBot
User-agent: PerplexityBot
Allow: /

# Provide clean sitemap
Sitemap: https://example.com/sitemap.xml
```

### Optimization Checklist

- [ ] Allow PerplexityBot in robots.txt
- [ ] Implement FAQ Schema markup
- [ ] Create publicly accessible PDF resources
- [ ] Use Article schema with timestamps
- [ ] Focus on semantic relevance, not keywords
- [ ] Build topical authority in your niche

---

## 3. Google AI Overview (SGE) Ranking Factors

### Architecture

Google AI Overviews use multiple AI models:
- **PaLM2** - Language understanding
- **MUM** - Multimodal understanding
- **Gemini** - Advanced reasoning

### 5-Stage Source Prioritization Pipeline

1. **Retrieval** - Identify candidate sources
2. **Semantic Ranking** - Evaluate topical relevance
3. **LLM Re-ranking** - Assess contextual fit (using Gemini)
4. **E-E-A-T Evaluation** - Filter for expertise/authority/trust
5. **Data Fusion** - Synthesize from multiple sources with citations

### Key Statistics

| Metric | Value |
|--------|-------|
| AI Overviews in searches | 85%+ |
| Overlap with traditional Top 10 | Only 15% |
| Traditional factors weight | 62% |
| Novel AI signals weight | 38% |
| SGE-optimized visibility boost | 340% |

### Ranking Factors

| Factor | Details |
|--------|---------|
| **E-E-A-T** | Experience, Expertise, Authoritativeness, Trustworthiness |
| **Structured Data** | Schema markup helps AI understand content |
| **Knowledge Graph** | Being in Google's Knowledge Graph = boost |
| **Topical Authority** | Content clusters + internal linking |
| **Multimedia** | Images/videos in multi-modal responses |
| **Authoritative Citations** | +132% visibility with trusted references |
| **Authoritative Tone** | +89% visibility improvement |

### Content Requirements

```
Traditional SEO still matters:
- Quality backlinks
- Original, helpful content
- Fast page speed
- Mobile-friendly design
- Secure (HTTPS)
```

### Optimization Checklist

- [ ] Implement comprehensive Schema markup
- [ ] Build topical authority with content clusters
- [ ] Include authoritative citations and references
- [ ] Use E-E-A-T signals (author bios, credentials)
- [ ] Optimize for Google Merchant Center (e-commerce)
- [ ] Target informational "how-to" queries

---

## 4. Microsoft Copilot / Bing AI Ranking Factors

### Architecture

Copilot is integrated into:
- Microsoft Edge browser
- Windows 11
- Microsoft 365 apps
- Bing Search

Uses **Bing Index** as primary data source.

### Ranking Factors

| Factor | Details |
|--------|---------|
| **Bing Index** | Must be indexed by Bing to be cited |
| **Microsoft Ecosystem** | LinkedIn, GitHub mentions provide boost |
| **Crawlability** | BingBot + PermaBot must have access |
| **Page Speed** | < 2 seconds load time |
| **Schema Markup** | Helps Copilot understand content |
| **Entity Clarity** | Clear definitions of entities/concepts |

### Technical Requirements

```
# robots.txt
User-agent: Bingbot
Allow: /

User-agent: msnbot
Allow: /

# Submit to Bing Webmaster Tools
# Use IndexNow for faster indexing
```

### Optimization Checklist

- [ ] Submit site to Bing Webmaster Tools
- [ ] Ensure Bingbot can crawl all pages
- [ ] Use IndexNow for new content
- [ ] Optimize page speed (< 2 seconds)
- [ ] Clear entity definitions in content
- [ ] Build presence on LinkedIn, GitHub

---

## 5. Claude AI Ranking Factors

### Architecture

**Important:** Claude uses **Brave Search**, NOT Google or Bing!

Claude decides when to search based on:
- Query freshness requirements
- Specificity of question
- User intent

### Ranking Factors

| Factor | Details |
|--------|---------|
| **Brave Index** | Must be indexed by Brave Search |
| **Query Rewriting** | Claude reformulates queries for search |
| **Factual Density** | Data-rich content preferred |
| **Structural Clarity** | Easy to extract information |
| **Source Authority** | Trustworthy, well-sourced content |

### Key Statistic

**Crawl-to-Refer Ratio: 38,065:1**
- Claude consumes massive amounts of content
- Very selective about what it cites
- Quality and relevance are critical

### Technical Requirements

```
# robots.txt
User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /
```

### Optimization Checklist

- [ ] Ensure Brave Search indexing
- [ ] Allow ClaudeBot in robots.txt
- [ ] Create high factual density content
- [ ] Use clear, extractable structure
- [ ] Include verifiable data points
- [ ] Cite authoritative sources

---

## 6. Traditional Google SEO Ranking Factors (2026)

### Core Ranking Systems

| System | Purpose |
|--------|---------|
| **PageRank** | Link-based authority (still relevant) |
| **BERT** | Natural language understanding |
| **RankBrain** | Machine learning ranking |
| **Helpful Content** | Rewards people-first content |
| **Spam Detection** | Filters low-quality content |

### Top 10 Ranking Factors

| Rank | Factor | Details |
|------|--------|---------|
| 1 | **Backlinks** | Quality referring domains (core ranking system) |
| 2 | **E-E-A-T** | Experience, Expertise, Authority, Trust |
| 3 | **Content Quality** | Original, comprehensive, helpful |
| 4 | **Page Experience** | Core Web Vitals (LCP, FID, CLS) |
| 5 | **Mobile-First** | Non-mobile sites may not be indexed |
| 6 | **Search Intent Match** | Content matches user query intent |
| 7 | **Content Freshness** | Regular updates signal activity |
| 8 | **Technical SEO** | Crawlable, indexable, HTTPS |
| 9 | **User Signals** | Dwell time, bounce rate, CTR |
| 10 | **Structured Data** | Schema markup for rich results |

### Core Web Vitals

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5-4s | > 4s |
| **FID** (First Input Delay) | < 100ms | 100-300ms | > 300ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1-0.25 | > 0.25 |

### E-E-A-T Guidelines

| Signal | How to Demonstrate |
|--------|-------------------|
| **Experience** | First-hand experience, case studies |
| **Expertise** | Author credentials, detailed knowledge |
| **Authoritativeness** | Backlinks, mentions, citations |
| **Trustworthiness** | Accurate info, transparent, secure site |

### Optimization Checklist

- [ ] Build quality backlinks (guest posts, PR, original research)
- [ ] Create comprehensive, original content
- [ ] Optimize Core Web Vitals
- [ ] Ensure mobile-friendly design
- [ ] Use HTTPS
- [ ] Implement Schema markup
- [ ] Match content to search intent
- [ ] Update content regularly
- [ ] Add author bios with credentials
- [ ] Include E-E-A-T signals

---

## Cross-Platform Optimization Summary

| Platform | Primary Index | Key Factor | Unique Requirement |
|----------|--------------|------------|-------------------|
| ChatGPT | Web (Bing-based) | Domain Authority | Content-Answer Fit |
| Perplexity | Own + Google | Semantic Relevance | FAQ Schema |
| Google SGE | Google | E-E-A-T | Knowledge Graph |
| Copilot | Bing | Bing Index | MS Ecosystem |
| Claude | Brave | Factual Density | Brave Indexing |
| Google (traditional) | Google | Backlinks | Core Web Vitals |

### Universal Best Practices

1. **Allow all major bots** in robots.txt
2. **Implement Schema markup** (FAQPage, Article, Organization)
3. **Build authoritative backlinks**
4. **Update content regularly** (within 30 days)
5. **Use clear structure** (H1 > H2 > H3, lists, tables)
6. **Include statistics and citations**
7. **Optimize page speed** (< 2 seconds)
8. **Ensure mobile-friendly design**

````

---

## File: `references/schema-templates.md`

````markdown
# JSON-LD Schema Templates

Ready-to-use JSON-LD structured data templates for SEO and GEO optimization.

---

## 1. FAQPage Schema (+40% AI Visibility)

**Best for:** FAQ sections, knowledge base pages, product pages with Q&A.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is [Your Product/Service]?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Comprehensive answer with statistics. According to X, 85% of users report Y benefit.]"
      }
    },
    {
      "@type": "Question",
      "name": "How does [Product/Service] work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Step-by-step explanation. First, you... Then... Finally...]"
      }
    },
    {
      "@type": "Question",
      "name": "What are the benefits of [Product/Service]?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[List key benefits with data. Users save an average of X hours per week.]"
      }
    },
    {
      "@type": "Question",
      "name": "How much does [Product/Service] cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Pricing information. Plans start at $X/month with a free tier available.]"
      }
    },
    {
      "@type": "Question",
      "name": "How do I get started with [Product/Service]?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Installation/signup instructions. Run: curl -fsSL example.com/install.sh | bash]"
      }
    }
  ]
}
```

---

## 2. WebPage Schema

**Best for:** Standard content pages, landing pages.

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "[Page Title]",
  "description": "[Page description, 150-160 characters]",
  "url": "https://example.com/page",
  "datePublished": "2024-01-15",
  "dateModified": "2024-12-20",
  "inLanguage": "en-US",
  "isPartOf": {
    "@type": "WebSite",
    "name": "[Site Name]",
    "url": "https://example.com"
  },
  "author": {
    "@type": "Person",
    "name": "[Author Name]",
    "url": "https://example.com/about"
  },
  "publisher": {
    "@type": "Organization",
    "name": "[Organization Name]",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": ["h1", ".summary", ".key-points"]
  }
}
```

---

## 3. Article Schema

**Best for:** Blog posts, news articles, tutorials.

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[Article Title - Max 110 characters]",
  "description": "[Article summary]",
  "image": [
    "https://example.com/image-1x1.jpg",
    "https://example.com/image-4x3.jpg",
    "https://example.com/image-16x9.jpg"
  ],
  "datePublished": "2024-01-15T08:00:00+00:00",
  "dateModified": "2024-12-20T10:30:00+00:00",
  "author": {
    "@type": "Person",
    "name": "[Author Name]",
    "url": "https://example.com/author/name",
    "jobTitle": "[Job Title]",
    "worksFor": {
      "@type": "Organization",
      "name": "[Company]"
    }
  },
  "publisher": {
    "@type": "Organization",
    "name": "[Publisher Name]",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png",
      "width": 600,
      "height": 60
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/article-url"
  },
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "articleSection": "[Category]",
  "wordCount": 2500
}
```

---

## 4. SoftwareApplication Schema

**Best for:** Tools, apps, software products.

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "[App Name]",
  "description": "[App description]",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Cross-platform",
  "url": "https://example.com",
  "downloadUrl": "https://example.com/download",
  "softwareVersion": "1.0.0",
  "releaseNotes": "https://example.com/changelog",
  "screenshot": "https://example.com/screenshot.png",
  "featureList": [
    "Feature 1 description",
    "Feature 2 description",
    "Feature 3 description"
  ],
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "150",
    "bestRating": "5",
    "worstRating": "1"
  },
  "author": {
    "@type": "Organization",
    "name": "[Company Name]",
    "url": "https://example.com"
  }
}
```

---

## 5. Organization Schema

**Best for:** About pages, company pages.

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "[Organization Name]",
  "alternateName": "[Alternate Name]",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "description": "[Organization description]",
  "foundingDate": "2024",
  "founders": [
    {
      "@type": "Person",
      "name": "[Founder Name]"
    }
  ],
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "[City]",
    "addressRegion": "[State]",
    "addressCountry": "[Country]"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "support@example.com"
  },
  "sameAs": [
    "https://twitter.com/example",
    "https://github.com/example",
    "https://linkedin.com/company/example"
  ]
}
```

---

## 6. Product Schema

**Best for:** E-commerce product pages.

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "[Product Name]",
  "description": "[Product description]",
  "image": [
    "https://example.com/product-image-1.jpg",
    "https://example.com/product-image-2.jpg"
  ],
  "sku": "[SKU]",
  "brand": {
    "@type": "Brand",
    "name": "[Brand Name]"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/product",
    "priceCurrency": "USD",
    "price": "99.99",
    "priceValidUntil": "2025-12-31",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "[Seller Name]"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "89"
  },
  "review": [
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": "[Reviewer Name]"
      },
      "reviewBody": "[Review text]"
    }
  ]
}
```

---

## 7. HowTo Schema

**Best for:** Tutorials, guides, how-to articles.

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to [Do Something]",
  "description": "[Brief description of what this guide covers]",
  "image": "https://example.com/how-to-image.jpg",
  "totalTime": "PT15M",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": "0"
  },
  "supply": [
    {
      "@type": "HowToSupply",
      "name": "[Required item 1]"
    }
  ],
  "tool": [
    {
      "@type": "HowToTool",
      "name": "[Required tool 1]"
    }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "name": "Step 1: [Step Name]",
      "text": "[Detailed step instructions]",
      "image": "https://example.com/step-1.jpg",
      "url": "https://example.com/guide#step1"
    },
    {
      "@type": "HowToStep",
      "name": "Step 2: [Step Name]",
      "text": "[Detailed step instructions]",
      "image": "https://example.com/step-2.jpg",
      "url": "https://example.com/guide#step2"
    },
    {
      "@type": "HowToStep",
      "name": "Step 3: [Step Name]",
      "text": "[Detailed step instructions]",
      "image": "https://example.com/step-3.jpg",
      "url": "https://example.com/guide#step3"
    }
  ]
}
```

---

## 8. BreadcrumbList Schema

**Best for:** All pages with navigation hierarchy.

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://example.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "[Category]",
      "item": "https://example.com/category"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "[Current Page]",
      "item": "https://example.com/category/page"
    }
  ]
}
```

---

## 9. LocalBusiness Schema

**Best for:** Local business pages.

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "[Business Name]",
  "description": "[Business description]",
  "image": "https://example.com/business-image.jpg",
  "url": "https://example.com",
  "telephone": "+1-555-555-5555",
  "email": "contact@example.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[Street Address]",
    "addressLocality": "[City]",
    "addressRegion": "[State]",
    "postalCode": "[ZIP]",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "17:00"
    }
  ],
  "priceRange": "$$"
}
```

---

## 10. SpeakableSpecification (GEO Enhancement)

**Best for:** Voice search optimization, AI extraction.

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "[Page Title]",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [
      "h1",
      ".summary",
      ".key-takeaways",
      ".faq-answer"
    ]
  }
}
```

---

## Combined Schema Example

For a software product page with FAQ:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "name": "OPC Skills - AI Agent Skills for Solopreneurs",
      "description": "10+ agent skills for Claude Code, Cursor, Codex. Domain hunting, social media research, logo creation.",
      "url": "https://opc.dev",
      "dateModified": "2024-12-20",
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": ["h1", ".hero-description", ".faq-answer"]
      }
    },
    {
      "@type": "SoftwareApplication",
      "name": "OPC Skills",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Cross-platform",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is OPC Skills?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "OPC Skills is a collection of 10+ AI agent skills for solopreneurs, supporting Claude Code, Cursor, and Codex."
          }
        }
      ]
    },
    {
      "@type": "Organization",
      "name": "OPC Skills",
      "url": "https://opc.dev",
      "sameAs": ["https://github.com/ReScienceLab/opc-skills"]
    }
  ]
}
```

---

## Validation Tools

1. **Google Rich Results Test**
   ```
   https://search.google.com/test/rich-results?url={your-url}
   ```

2. **Schema.org Validator**
   ```
   https://validator.schema.org/?url={your-url}
   ```

3. **Google Search Console**
   - Check "Enhancements" for schema issues
   - Monitor rich result performance

````

---

## File: `references/seo-checklist.md`

````markdown
# SEO/GEO Audit Checklist

Complete checklist for auditing and optimizing websites for both traditional SEO and GEO (AI search visibility).

## Priority Levels

| Level | Meaning | Action |
|-------|---------|--------|
| **P0** | Critical | Must fix immediately - blocks indexing or causes major issues |
| **P1** | Important | Should fix soon - significant impact on rankings |
| **P2** | Recommended | Nice to have - improves visibility and user experience |

---

## Technical SEO

### P0 - Critical

- [ ] **P0** `robots.txt` allows important pages
- [ ] **P0** Site is accessible (no 5xx errors)
- [ ] **P0** HTTPS enabled (valid SSL certificate)
- [ ] **P0** Mobile-responsive design
- [ ] **P0** No critical pages blocked by `noindex`
- [ ] **P0** Site is indexed in Google (check: `site:domain.com`)

### P1 - Important

- [ ] **P1** `robots.txt` allows AI bots (GPTBot, PerplexityBot, ClaudeBot)
- [ ] **P1** XML sitemap exists and is submitted
- [ ] **P1** Site is indexed in Bing (for Copilot visibility)
- [ ] **P1** Canonical tags properly implemented
- [ ] **P1** No duplicate content issues
- [ ] **P1** Page load time < 3 seconds
- [ ] **P1** LCP (Largest Contentful Paint) < 2.5s

### P2 - Recommended

- [ ] **P2** FID (First Input Delay) < 100ms
- [ ] **P2** CLS (Cumulative Layout Shift) < 0.1
- [ ] **P2** Images optimized (WebP format, lazy loading)
- [ ] **P2** CSS/JS minified
- [ ] **P2** GZIP/Brotli compression enabled
- [ ] **P2** CDN configured
- [ ] **P2** Mobile-friendly test passed
- [ ] **P2** No mixed content warnings
- [ ] **P2** Secure headers configured

---

## On-Page SEO

### P0 - Critical

- [ ] **P0** Unique `<title>` tag exists (50-60 characters)
- [ ] **P0** Title contains primary keyword
- [ ] **P0** Unique `<meta description>` exists (150-160 characters)
- [ ] **P0** Single H1 tag per page
- [ ] **P0** H1 contains primary keyword

### P1 - Important

- [ ] **P1** Description is compelling and includes keyword
- [ ] **P1** `<meta name="robots">` correctly set
- [ ] **P1** Logical heading hierarchy (H1 > H2 > H3)
- [ ] **P1** All images have `alt` attributes
- [ ] **P1** Internal links to related content
- [ ] **P1** No broken links (404s)
- [ ] **P1** Anchor text is descriptive

### P2 - Recommended

- [ ] **P2** `og:title` set
- [ ] **P2** `og:description` set
- [ ] **P2** `og:image` set (1200x630px recommended)
- [ ] **P2** `og:url` set (canonical URL)
- [ ] **P2** `og:type` set (website/article)
- [ ] **P2** `twitter:card` set (summary_large_image)
- [ ] **P2** `twitter:title` set
- [ ] **P2** `twitter:description` set
- [ ] **P2** `twitter:image` set
- [ ] **P2** Paragraphs are short (2-3 sentences)
- [ ] **P2** Bullet points used for lists
- [ ] **P2** Tables used for comparisons
- [ ] **P2** Alt text includes keywords where natural
- [ ] **P2** Image file names are descriptive
- [ ] **P2** External links have `rel="noopener noreferrer"`

---

## Schema Markup (Structured Data)

### P1 - Important

- [ ] **P1** Organization schema on homepage
- [ ] **P1** WebPage schema on all pages
- [ ] **P1** Article schema on blog posts
- [ ] **P1** Schema passes Google Rich Results Test
- [ ] **P1** No errors in Search Console "Enhancements"

### P2 - Recommended - GEO Enhanced

- [ ] **P2** FAQPage schema on FAQ sections (+40% AI visibility)
- [ ] **P2** BreadcrumbList schema for navigation
- [ ] **P2** SpeakableSpecification for voice search
- [ ] **P2** datePublished and dateModified included
- [ ] **P2** Author information with credentials
- [ ] **P2** Publisher information with logo
- [ ] **P2** Schema passes Schema.org Validator

---

## GEO Optimization (AI Search)

### P1 - Important - Princeton GEO Methods

- [ ] **P1** Content includes authoritative citations (+40%)
- [ ] **P1** Statistics and data points included (+37%)
- [ ] **P1** Expert quotes with attribution (+30%)
- [ ] **P1** NO keyword stuffing (causes -10%)

### P2 - Recommended - GEO Enhancement

- [ ] **P2** Authoritative, confident tone (+25%)
- [ ] **P2** Content is accessible/easy to understand (+20%)
- [ ] **P2** Appropriate technical terminology (+18%)
- [ ] **P2** Diverse vocabulary throughout (+15%)
- [ ] **P2** High fluency and readability (+15-30%)

### Content Structure for AI

- [ ] "Answer-first" format (direct answer at top)
- [ ] Clear, extractable paragraphs
- [ ] FAQ format for common questions
- [ ] Tables for comparison data
- [ ] Lists for step-by-step processes

### AI Bot Access

- [ ] GPTBot allowed in robots.txt
- [ ] PerplexityBot allowed in robots.txt
- [ ] ClaudeBot allowed in robots.txt
- [ ] Anthropic-ai allowed in robots.txt
- [ ] Bingbot allowed in robots.txt

---

## Off-Page SEO

### Backlinks

- [ ] Quality backlinks from relevant sites
- [ ] Diverse referring domains
- [ ] No toxic/spammy backlinks
- [ ] Brand mentions (even without links)

### E-E-A-T Signals

- [ ] Author bios with credentials
- [ ] About page with company info
- [ ] Contact information visible
- [ ] Privacy policy and terms
- [ ] Trust badges/certifications if applicable
- [ ] Customer reviews/testimonials

### Social Presence

- [ ] Active social media profiles
- [ ] Links to social profiles on website
- [ ] Social sharing buttons on content
- [ ] Consistent branding across platforms

---

## Content Strategy

### Content Audit

- [ ] All pages have unique, valuable content
- [ ] No thin content (< 300 words for main pages)
- [ ] Content matches search intent
- [ ] Content is up-to-date (within 30 days for news/tech)
- [ ] Content provides unique value vs competitors

### Keyword Strategy

- [ ] Primary keyword identified for each page
- [ ] Secondary keywords mapped
- [ ] Long-tail keywords targeted
- [ ] No keyword cannibalization
- [ ] Keywords match user intent

---

## Monitoring & Analytics

### Setup

- [ ] Google Analytics installed
- [ ] Google Search Console connected
- [ ] Bing Webmaster Tools connected
- [ ] Sitemap submitted to both

### Regular Checks

- [ ] Weekly: Check Search Console for errors
- [ ] Weekly: Review Core Web Vitals
- [ ] Monthly: Analyze organic traffic trends
- [ ] Monthly: Review top performing pages
- [ ] Quarterly: Full SEO audit

---

## Quick Audit Commands

```bash
# Check meta tags
curl -sL "https://example.com" | grep -E "<title>|<meta"

# Check robots.txt
curl -s "https://example.com/robots.txt"

# Check sitemap
curl -s "https://example.com/sitemap.xml" | head -30

# Check page speed (using PageSpeed Insights API)
# Requires API key
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://example.com&strategy=mobile"

# Check if indexed in Google
# Manual check: https://www.google.com/search?q=site:example.com

# Validate schema
# Open: https://search.google.com/test/rich-results?url=https://example.com
```

---

## Priority Matrix

| Priority | Task | Impact |
|----------|------|--------|
| **Critical** | Fix crawl errors | Blocks indexing |
| **Critical** | HTTPS enabled | Trust + ranking |
| **High** | Core Web Vitals | UX + ranking |
| **High** | Mobile-friendly | 60%+ traffic |
| **High** | FAQPage schema | +40% AI visibility |
| **Medium** | Meta descriptions | CTR improvement |
| **Medium** | Internal linking | Authority distribution |
| **Low** | Social meta tags | Share appearance |

````

---

## File: `references/tools-and-apis.md`

````markdown
# SEO/GEO Tools and API Reference

Curated list of tools and APIs for SEO and GEO optimization.

---

## Free Tools

### Schema Markup Generators

| Tool | URL | Features |
|------|-----|----------|
| **TechnicalSEO.com** | technicalseo.com/tools/schema-markup-generator | Multiple schema types, validation |
| **Rank Ranger** | rankranger.com/schema-markup-generator | FAQ, Article, Product schemas |
| **Merkle** | technicalseo.com/tools/schema-markup-generator | Comprehensive schema generator |
| **JSON-LD Generator** | jsonld.com | Simple schema builder |

### Validation Tools

| Tool | URL | Purpose |
|------|-----|---------|
| **Google Rich Results Test** | search.google.com/test/rich-results | Test schema markup |
| **Schema.org Validator** | validator.schema.org | Validate any schema |
| **Google Mobile-Friendly Test** | search.google.com/test/mobile-friendly | Mobile usability |
| **PageSpeed Insights** | pagespeed.web.dev | Core Web Vitals |

### SEO Audit Tools

| Tool | URL | Features |
|------|-----|----------|
| **SEOmator** | seomator.com/free-seo-audit-tool | Comprehensive free audit |
| **Screaming Frog (Free)** | screamingfrog.co.uk | Crawl up to 500 URLs |
| **Google Search Console** | search.google.com/search-console | Official Google data |
| **Bing Webmaster Tools** | bing.com/webmasters | Bing indexing data |

---

## Paid SEO Tools

### Comprehensive Platforms

| Tool | Price | Best For |
|------|-------|----------|
| **Ahrefs** | $99/mo+ | Backlink analysis, keyword research |
| **Semrush** | $139/mo+ | All-in-one SEO + GEO toolkit |
| **Moz Pro** | $99/mo+ | Domain authority, link building |
| **SE Ranking** | $65/mo+ | Affordable all-in-one |

### Content Optimization

| Tool | Price | Best For |
|------|-------|----------|
| **Surfer SEO** | $89/mo+ | Content optimization for AI |
| **Clearscope** | $170/mo+ | Enterprise content optimization |
| **Frase** | $15/mo+ | AI content briefs |
| **MarketMuse** | $149/mo+ | Content strategy |

---

## GEO / AI Visibility Tools

### AI Search Monitoring

| Tool | Price | Platforms |
|------|-------|-----------|
| **Profound** | $499/mo+ | ChatGPT, Perplexity, Claude, Gemini |
| **Otterly.ai** | Free trial | ChatGPT, Perplexity, Google AIO |
| **SE Ranking AI Toolkit** | Included | AI Overviews, ChatGPT |
| **Semrush AI Visibility** | Included | Google AIO, ChatGPT |
| **Peec AI** | Mid-tier | Sentiment + visibility |
| **Scrunch AI** | Varies | Brand tracking, citations |

### AI Visibility Features to Look For

- Citation tracking across AI platforms
- Prompt-level insights
- Source attribution
- Sentiment analysis
- Competitive benchmarking
- Actionable recommendations

---

## APIs for Automation

### Google APIs

| API | Purpose | Docs |
|-----|---------|------|
| **Search Console API** | Indexing status, search data | developers.google.com/webmaster-tools |
| **PageSpeed API** | Core Web Vitals data | developers.google.com/speed/docs/insights/v5/get-started |
| **Indexing API** | Request indexing | developers.google.com/search/apis/indexing-api |
| **Custom Search API** | Programmatic search | developers.google.com/custom-search |

### SEO Data APIs

| API | Purpose | Pricing |
|-----|---------|---------|
| **DataForSEO** | Comprehensive SEO data | Pay-per-use |
| **Moz API** | DA, PA, link data | Included with Moz |
| **Ahrefs API** | Backlinks, keywords | Included with Ahrefs |
| **SE Ranking API** | Rankings, audits | Included with SE Ranking |
| **SEO Review Tools API** | Various SEO checks | Free tier available |

### Schema/Metadata APIs

| API | Purpose | Pricing |
|-----|---------|---------|
| **Apify Metadata Extractor** | Extract meta, sitemap, robots | $12/mo+ |
| **Firecrawl** | Website crawling for SEO | Pay-per-use |

---

## Browser Extensions

### SEO Analysis

| Extension | Browser | Features |
|-----------|---------|----------|
| **SEOquake** | Chrome/Firefox | Quick SEO metrics |
| **MozBar** | Chrome | DA, PA, link data |
| **Ahrefs SEO Toolbar** | Chrome | Backlinks, keywords |
| **Detailed SEO Extension** | Chrome | Technical SEO checks |

### Schema Testing

| Extension | Browser | Features |
|-----------|---------|----------|
| **Structured Data Testing Tool** | Chrome | View page schema |
| **Schema Builder** | Chrome | Generate schema |

---

## Command Line Tools

### curl Commands for SEO Checks

```bash
# Check meta tags
curl -sL "https://example.com" | grep -E "<title>|<meta"

# Check robots.txt
curl -s "https://example.com/robots.txt"

# Check sitemap
curl -s "https://example.com/sitemap.xml"

# Check HTTP headers
curl -I "https://example.com"

# Check redirect chain
curl -sIL "https://example.com" | grep -E "HTTP|Location"

# Check page size
curl -sL "https://example.com" | wc -c

# Check load time
curl -o /dev/null -s -w "Total: %{time_total}s\n" "https://example.com"
```

### Using Google APIs via curl

```bash
# PageSpeed Insights (no API key needed for basic)
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://example.com"

# With API key (more requests allowed)
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://example.com&key=YOUR_API_KEY"
```

---

## Robots.txt Template for AI Bots

```
# Search Engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# AI Bots
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Applebot-Extended
Allow: /

# Sitemap
Sitemap: https://example.com/sitemap.xml
```

---

## Scripts

Ready-to-use Python scripts in `scripts/` folder.

### Setup (DataForSEO scripts)

```bash
export DATAFORSEO_LOGIN=your_login
export DATAFORSEO_PASSWORD=your_password
```

### seo_audit.py

Full SEO audit - meta tags, robots.txt, sitemap, load time, schema, AI bot access. No API required.

```bash
python3 scripts/seo_audit.py "https://example.com"
```

### keyword_research.py

Get keyword ideas, search volume, difficulty.

```bash
python3 scripts/keyword_research.py "seo tools" --limit 20
python3 scripts/keyword_research.py "seo tools" --location 2826  # UK
```

### serp_analysis.py

Analyze top 20 Google results for a keyword.

```bash
python3 scripts/serp_analysis.py "best seo tools" --depth 20
```

### backlinks.py

Get backlink profile for a domain.

```bash
python3 scripts/backlinks.py "example.com" --limit 20
```

### domain_overview.py

Get domain metrics - traffic, keywords, rankings.

```bash
python3 scripts/domain_overview.py "example.com"
```

---

## Workflow Integration

### Using with OPC Skills

```bash
# Use twitter skill to find SEO tips
python3 scripts/search_tweets.py "SEO tips 2026" --limit 20

# Use reddit skill to find discussions
python3 scripts/search_posts.py "GEO optimization" --subreddit SEO --limit 10

# Use WebSearch for keyword research
# (Built into agent)
```

### Automation Ideas

1. **Weekly SEO audit** - Crawl site with curl, check for errors
2. **Schema monitoring** - Validate schema after deploys with Rich Results Test API
3. **Ranking tracking** - Monitor AI visibility with Otterly.ai or Profound
4. **Content freshness** - Flag outdated content based on dateModified
5. **Competitor monitoring** - Track competitor changes with DataForSEO API

---

## Resources

### Learning

| Resource | URL | Type |
|----------|-----|------|
| **Google SEO Guide** | developers.google.com/search/docs | Official |
| **Moz Beginner's Guide** | moz.com/beginners-guide-to-seo | Tutorial |
| **Backlinko** | backlinko.com/hub/seo | Advanced |
| **Search Engine Journal** | searchenginejournal.com | News |

### GEO Research

| Resource | URL | Type |
|----------|-----|------|
| **Princeton GEO Paper** | arxiv.org/abs/2311.09735 | Research |
| **GEO Guide (SingleGrain)** | singlegrain.com/geo | Guide |
| **AI Search Optimization (Semrush)** | semrush.com/blog/ai-search-optimization | Tutorial |

### Communities

| Community | Platform | Focus |
|-----------|----------|-------|
| **r/SEO** | Reddit | General SEO |
| **r/bigseo** | Reddit | Advanced SEO |
| **r/TechSEO** | Reddit | Technical SEO |
| **SEO Twitter** | Twitter | News, tips |

````

---

## File: `scripts/autocomplete_ideas.py`

```python
#!/usr/bin/env python3
"""
Google Autocomplete keyword suggestions using DataForSEO API
Get real-time search suggestions from Google Autocomplete

Usage: python3 scripts/autocomplete_ideas.py "Claude Code"
"""
import argparse
from dataforseo_api import api_post, get_result


def main():
    parser = argparse.ArgumentParser(description="Google Autocomplete keyword suggestions")
    parser.add_argument("keyword", help="Seed keyword for autocomplete")
    parser.add_argument("--location", "-loc", type=int, default=2840,
                        help="Location code (default: 2840 = US)")
    args = parser.parse_args()

    data = [{
        "keyword": args.keyword,
        "location_code": args.location,
        "language_code": "en"
    }]
    
    response = api_post("serp/google/autocomplete/live/advanced", data)
    results = get_result(response)
    
    print(f"keyword: {args.keyword}")
    print(f"location: {args.location}")
    print()
    
    if results:
        suggestions = []
        for result in results:
            items = result.get("items", [])
            
            # Try different possible field names if items is empty
            if not items:
                items = result.get("autocomplete", [])
                if not items:
                    items = result.get("suggestions", [])
            
            for item in items:
                # Handle different response formats
                suggestion = None
                if isinstance(item, dict):
                    if item.get("type") == "autocomplete_item":
                        suggestion = item.get("title", "").strip()
                    elif "value" in item:
                        suggestion = item.get("value", "").strip()
                elif isinstance(item, str):
                    suggestion = item.strip()
                
                if suggestion:
                    suggestions.append(suggestion)
        
        if suggestions:
            print(f"autocomplete_suggestions[{len(suggestions)}]:")
            for i, suggestion in enumerate(suggestions, 1):
                print(f"  {i}. {suggestion}")
        else:
            print("No suggestions found")
    else:
        print("No results found")
    
    print()
    print("Tip: These are real user searches. Use them to:")
    print("  - Create content matching user intent")
    print("  - Optimize page titles and meta descriptions")
    print("  - Discover long-tail keyword opportunities")


if __name__ == "__main__":
    main()

```

---

## File: `scripts/backlinks.py`

```python
#!/usr/bin/env python3
"""
Backlinks analysis using DataForSEO API
Usage: python3 scripts/backlinks.py "example.com" --limit 20
"""
import argparse
from dataforseo_api import api_post, get_result, print_backlinks_list, format_count


def main():
    parser = argparse.ArgumentParser(description="Backlinks analysis")
    parser.add_argument("target", help="Target domain")
    parser.add_argument("--limit", "-l", type=int, default=20, help="Max results")
    args = parser.parse_args()

    data = [{
        "target": args.target,
        "limit": args.limit,
        "order_by": ["rank,desc"]
    }]
    
    response = api_post("backlinks/backlinks/live", data)
    results = get_result(response)
    
    print(f"target: {args.target}")
    
    if results:
        result = results[0]
        print(f"total_backlinks: {format_count(result.get('total_count'))}")
        items = result.get("items", [])
        print_backlinks_list(items[:args.limit])
    else:
        print("No results found")


if __name__ == "__main__":
    main()

```

---

## File: `scripts/competitor_gap.py`

```python
#!/usr/bin/env python3
"""
Competitor keyword gap analysis using DataForSEO API
Finds keywords where competitor ranks but you don't

Usage: python3 scripts/competitor_gap.py "opc.dev" "claudemarketplaces.com" --limit 50
"""
import argparse
from dataforseo_api import api_post, get_result, format_count


def main():
    parser = argparse.ArgumentParser(description="Competitor keyword gap analysis")
    parser.add_argument("my_domain", help="Your domain (without https://)")
    parser.add_argument("competitor_domain", help="Competitor domain (without https://)")
    parser.add_argument("--location", "-loc", type=int, default=2840,
                        help="Location code (default: 2840 = US)")
    parser.add_argument("--limit", "-l", type=int, default=50, 
                        help="Max results (default: 50)")
    args = parser.parse_args()

    data = [{
        "target1": args.my_domain,
        "target2": args.competitor_domain,
        "location_code": args.location,
        "language_code": "en",
        "intersections": False,  # Only show keywords where target2 ranks but target1 doesn't
        "limit": args.limit
    }]
    
    response = api_post("dataforseo_labs/google/domain_intersection/live", data)
    results = get_result(response)
    
    print(f"my_domain: {args.my_domain}")
    print(f"competitor_domain: {args.competitor_domain}")
    print(f"location: {args.location}")
    print()
    
    if results:
        all_items = []
        for result in results:
            items = result.get("items", [])
            if items:
                all_items.extend(items)
        
        if not all_items:
            print("No keyword gaps found")
            return
        
        # Results show keywords where competitor ranks but you don't
        print(f"keyword_gaps[{len(all_items)}]{{keyword,volume,difficulty,comp_position}}:")
        for item in all_items:
            kw_data = item.get("keyword_data", {})
            keyword = kw_data.get("keyword", "N/A")
            
            # Get search volume from keyword_info
            kw_info = kw_data.get("keyword_info", {})
            volume = format_count(kw_info.get("search_volume", 0))
            
            # Get keyword difficulty
            difficulty = kw_info.get("competition_level", "N/A")
            
            # Get competitor's ranking position
            # When intersections=false, we get keywords where only second_domain (competitor) ranks
            comp_element = item.get("second_domain_serp_element")
            if comp_element and isinstance(comp_element, dict):
                comp_pos = comp_element.get("rank_absolute", comp_element.get("rank_group", "N/A"))
            else:
                comp_pos = "N/A"
            
            print(f"  {keyword},{volume},{difficulty},{comp_pos}")
    else:
        print("No keyword gaps found")
    
    print()
    print("Tip: Focus on keywords with high volume and low difficulty where competitor ranks in top 10")


if __name__ == "__main__":
    main()

```

---

## File: `scripts/credential.py`

```python
#!/usr/bin/env python3
"""
Credential helper for DataForSEO API
"""
import os


def get_dataforseo_credentials() -> tuple:
    """Get DataForSEO login and password from environment"""
    login = os.environ.get("DATAFORSEO_LOGIN")
    password = os.environ.get("DATAFORSEO_PASSWORD")
    return login, password

```

---

## File: `scripts/dataforseo_api.py`

```python
#!/usr/bin/env python3
"""
DataForSEO API wrapper
"""
import urllib.request
import urllib.parse
import json
import base64
import sys
from credential import get_dataforseo_credentials

API_BASE = "https://api.dataforseo.com/v3"


def api_post(endpoint: str, data: list) -> dict:
    """Make POST request to DataForSEO API"""
    login, password = get_dataforseo_credentials()
    if not login or not password:
        print("error: DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD not set", file=sys.stderr)
        print("Run: export DATAFORSEO_LOGIN=your_login", file=sys.stderr)
        print("     export DATAFORSEO_PASSWORD=your_password", file=sys.stderr)
        sys.exit(1)
    
    url = f"{API_BASE}/{endpoint}"
    auth = base64.b64encode(f"{login}:{password}".encode()).decode()
    headers = {
        "Authorization": f"Basic {auth}",
        "Content-Type": "application/json"
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode(),
        headers=headers,
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"error: HTTP {e.code} - {error_body}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"error: {e}", file=sys.stderr)
        sys.exit(1)


def format_count(n) -> str:
    """Format numbers (1234567 -> 1.2M)"""
    if n is None:
        return "0"
    n = int(n)
    if n >= 1_000_000_000:
        return f"{n/1_000_000_000:.1f}B"
    if n >= 1_000_000:
        return f"{n/1_000_000:.1f}M"
    if n >= 1_000:
        return f"{n/1_000:.1f}K"
    return str(n)


def get_result(response: dict) -> list:
    """Extract result from API response"""
    if not response.get("tasks"):
        return []
    task = response["tasks"][0]
    if task.get("status_code") != 20000:
        print(f"error: {task.get('status_message', 'Unknown error')}", file=sys.stderr)
        return []
    return task.get("result", [])


def print_keywords_list(keywords: list):
    """Print list of keywords"""
    print(f"keywords[{len(keywords)}]{{keyword,volume,difficulty}}:")
    for kw in keywords:
        keyword = kw.get("keyword", "N/A")
        volume = format_count(kw.get("search_volume"))
        difficulty = kw.get("keyword_difficulty", "N/A")
        print(f"  {keyword},{volume},{difficulty}")


def print_serp_list(items: list):
    """Print SERP results"""
    organic = [i for i in items if i.get("type") == "organic"]
    print(f"serp[{len(organic)}]{{position,title,domain}}:")
    for item in organic[:20]:
        pos = item.get("rank_absolute", "N/A")
        title = (item.get("title") or "")[:50]
        domain = item.get("domain", "N/A")
        print(f"  {pos},{title},{domain}")


def print_backlinks_list(items: list):
    """Print backlinks"""
    print(f"backlinks[{len(items)}]{{from,to,rank,dofollow}}:")
    for item in items:
        url_from = (item.get("url_from") or "")[:50]
        url_to = (item.get("url_to") or "")[:30]
        rank = item.get("rank", "N/A")
        dofollow = item.get("dofollow", False)
        print(f"  {url_from},{url_to},{rank},{dofollow}")

```

---

## File: `scripts/domain_overview.py`

```python
#!/usr/bin/env python3
"""
Domain overview using DataForSEO API
Usage: python3 scripts/domain_overview.py "example.com"
"""
import argparse
from dataforseo_api import api_post, get_result, format_count


def main():
    parser = argparse.ArgumentParser(description="Domain overview")
    parser.add_argument("domain", help="Target domain")
    parser.add_argument("--location", "-loc", type=int, default=2840,
                        help="Location code (default: 2840 = US)")
    args = parser.parse_args()

    data = [{
        "target": args.domain,
        "location_code": args.location,
        "language_code": "en",
        "limit": 1  # We only need overview metrics
    }]
    
    response = api_post("dataforseo_labs/google/ranked_keywords/live", data)
    results = get_result(response)
    
    print(f"domain: {args.domain}")
    print(f"location: {args.location}")
    
    if results:
        for result in results:
            metrics = result.get("metrics", {})
            if not metrics:
                continue
            organic = metrics.get("organic", {})
            print(f"organic_keywords: {format_count(organic.get('count', 0))}")
            print(f"organic_traffic: {format_count(organic.get('etv', 0))}")
            print(f"top_3_positions: {organic.get('pos_1', 0) + organic.get('pos_2_3', 0)}")
    else:
        print("No results found")


if __name__ == "__main__":
    main()

```

---

## File: `scripts/keyword_research.py`

```python
#!/usr/bin/env python3
"""
Keyword research using DataForSEO API
Usage: python3 scripts/keyword_research.py "seo tools" --limit 20
"""
import argparse
from dataforseo_api import api_post, get_result, print_keywords_list


def main():
    parser = argparse.ArgumentParser(description="Keyword research")
    parser.add_argument("keyword", help="Seed keyword")
    parser.add_argument("--location", "-loc", type=int, default=2840,
                        help="Location code (default: 2840 = US)")
    parser.add_argument("--limit", "-l", type=int, default=20, help="Max results")
    args = parser.parse_args()

    data = [{
        "keywords": [args.keyword],  # API requires 'keywords' array (up to 20)
        "location_code": args.location,
        "language_code": "en",
        "limit": args.limit
    }]
    
    response = api_post("keywords_data/google_ads/keywords_for_keywords/live", data)
    results = get_result(response)
    
    print(f"keyword: {args.keyword}")
    print(f"location: {args.location}")
    
    if results:
        print_keywords_list(results[:args.limit])
    else:
        print("No results found")


if __name__ == "__main__":
    main()

```

---

## File: `scripts/related_keywords.py`

```python
#!/usr/bin/env python3
"""
Related keywords from Google "searches related to" using DataForSEO API
Get up to 4,680 keyword ideas from Google's related searches

Usage: python3 scripts/related_keywords.py "AI agent" --depth 2 --limit 50
"""
import argparse
from dataforseo_api import api_post, get_result, format_count


def main():
    parser = argparse.ArgumentParser(description="Related keywords from Google")
    parser.add_argument("keyword", help="Seed keyword")
    parser.add_argument("--location", "-loc", type=int, default=2840,
                        help="Location code (default: 2840 = US)")
    parser.add_argument("--depth", "-d", type=int, default=1,
                        help="Search depth 1-3 (default: 1, max keywords: depth^3 * 10)")
    parser.add_argument("--limit", "-l", type=int, default=50, 
                        help="Max results to display (default: 50)")
    args = parser.parse_args()

    # Validate depth
    if args.depth < 1 or args.depth > 3:
        print("Error: depth must be between 1 and 3")
        return

    data = [{
        "keyword": args.keyword,
        "location_code": args.location,
        "language_code": "en",
        "depth": args.depth,
        "limit": 1000  # API limit, we'll filter in display
    }]
    
    response = api_post("dataforseo_labs/google/related_keywords/live", data)
    results = get_result(response)
    
    print(f"keyword: {args.keyword}")
    print(f"location: {args.location}")
    print(f"depth: {args.depth}")
    print()
    
    if results:
        keywords = []
        for result in results:
            items = result.get("items", [])
            for item in items:
                kw_data = item.get("keyword_data", {})
                keyword = kw_data.get("keyword", item.get("keyword", ""))
                volume = kw_data.get("search_volume", item.get("search_volume", 0))
                difficulty = kw_data.get("keyword_difficulty", item.get("keyword_difficulty", "N/A"))
                
                if keyword:
                    keywords.append({
                        "keyword": keyword,
                        "volume": volume if volume is not None else 0,
                        "difficulty": difficulty
                    })
        
        # Sort by volume desc
        keywords.sort(key=lambda x: x["volume"], reverse=True)
        
        # Display limited results
        display_keywords = keywords[:args.limit]
        print(f"related_keywords[{len(display_keywords)} of {len(keywords)}]{{keyword,volume,difficulty}}:")
        for kw in display_keywords:
            keyword = kw["keyword"]
            volume = format_count(kw["volume"])
            difficulty = kw["difficulty"]
            print(f"  {keyword},{volume},{difficulty}")
        
        if len(keywords) > args.limit:
            print(f"\n... and {len(keywords) - args.limit} more keywords (use --limit to show more)")
    else:
        print("No related keywords found")
    
    print()
    print("Tip: Higher depth finds more keywords but costs more API credits")
    print(f"  Depth 1: ~10 keywords, Depth 2: ~100, Depth 3: ~1,000+")


if __name__ == "__main__":
    main()

```

---

## File: `scripts/seo_audit.py`

```python
#!/usr/bin/env python3
"""
SEO audit script (no API required)
Usage: python3 scripts/seo_audit.py "https://example.com"
"""
import argparse
import urllib.request
import urllib.parse
import re
import time
import sys


def fetch_url(url: str, timeout: int = 30) -> tuple:
    """Fetch URL and return (content, headers, load_time)"""
    try:
        start = time.time()
        req = urllib.request.Request(url, headers={"User-Agent": "SEO-Audit/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            content = resp.read().decode("utf-8", errors="ignore")
            headers = dict(resp.headers)
            load_time = time.time() - start
            return content, headers, load_time
    except Exception as e:
        return None, None, None


def extract_meta(html: str) -> dict:
    """Extract meta tags from HTML"""
    result = {}
    
    # Title
    title_match = re.search(r"<title[^>]*>([^<]+)</title>", html, re.I)
    result["title"] = title_match.group(1).strip() if title_match else None
    
    # Meta description
    desc_match = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\']', html, re.I)
    if not desc_match:
        desc_match = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']description["\']', html, re.I)
    result["description"] = desc_match.group(1).strip() if desc_match else None
    
    # OG tags
    og_match = re.search(r'<meta[^>]+property=["\']og:title["\']', html, re.I)
    result["og_tags"] = bool(og_match)
    
    # JSON-LD
    jsonld_count = len(re.findall(r'application/ld\+json', html, re.I))
    result["jsonld_count"] = jsonld_count
    
    # H1 (handle inline tags like <br>)
    h1_match = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.I | re.DOTALL)
    if h1_match:
        h1_text = re.sub(r"<[^>]+>", " ", h1_match.group(1))  # Remove inner tags
        h1_text = re.sub(r"\s+", " ", h1_text).strip()  # Normalize whitespace
        result["h1"] = h1_text[:100]
    else:
        result["h1"] = None
    
    return result


def check_robots(url: str) -> dict:
    """Check robots.txt"""
    parsed = urllib.parse.urlparse(url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    content, _, _ = fetch_url(robots_url)
    
    result = {"exists": False, "ai_bots": []}
    if content:
        result["exists"] = True
        ai_bots = ["GPTBot", "PerplexityBot", "ClaudeBot", "anthropic-ai", "ChatGPT-User"]
        for bot in ai_bots:
            if bot.lower() in content.lower():
                result["ai_bots"].append(bot)
    return result


def check_sitemap(url: str) -> bool:
    """Check if sitemap.xml exists"""
    parsed = urllib.parse.urlparse(url)
    sitemap_url = f"{parsed.scheme}://{parsed.netloc}/sitemap.xml"
    content, _, _ = fetch_url(sitemap_url)
    if not content:
        return False
    # Check for common sitemap indicators
    return "<urlset" in content.lower() or "<sitemapindex" in content.lower() or "<?xml" in content.lower()


def main():
    parser = argparse.ArgumentParser(description="SEO audit")
    parser.add_argument("url", help="URL to audit")
    args = parser.parse_args()
    
    url = args.url
    if not url.startswith("http"):
        url = f"https://{url}"
    
    print(f"=== SEO Audit: {url} ===")
    print()
    
    # Fetch page
    content, headers, load_time = fetch_url(url)
    if not content:
        print("error: Could not fetch URL")
        sys.exit(1)
    
    # Meta tags
    print("## Meta Tags")
    meta = extract_meta(content)
    title = meta["title"]
    print(f"title: {title[:60] if title else 'MISSING'}{'...' if title and len(title) > 60 else ''}")
    print(f"title_length: {len(title) if title else 0} chars")
    desc = meta["description"]
    print(f"description: {desc[:80] if desc else 'MISSING'}{'...' if desc and len(desc) > 80 else ''}")
    print(f"description_length: {len(desc) if desc else 0} chars")
    print(f"og_tags: {'yes' if meta['og_tags'] else 'no'}")
    print(f"h1: {meta['h1'] if meta['h1'] else 'MISSING'}")
    print()
    
    # Schema
    print("## Schema Markup")
    print(f"json_ld_blocks: {meta['jsonld_count']}")
    print()
    
    # Performance
    print("## Performance")
    print(f"load_time: {load_time:.2f}s")
    print(f"status: {'good' if load_time < 3 else 'slow'}")
    print()
    
    # robots.txt
    print("## robots.txt")
    robots = check_robots(url)
    print(f"exists: {'yes' if robots['exists'] else 'no'}")
    if robots["ai_bots"]:
        print(f"ai_bots_mentioned: {', '.join(robots['ai_bots'])}")
    else:
        print("ai_bots_mentioned: none")
    print()
    
    # Sitemap
    print("## Sitemap")
    has_sitemap = check_sitemap(url)
    print(f"sitemap_xml: {'yes' if has_sitemap else 'no'}")
    print()
    
    print("=== Audit Complete ===")


if __name__ == "__main__":
    main()

```

---

## File: `scripts/serp_analysis.py`

```python
#!/usr/bin/env python3
"""
SERP analysis using DataForSEO API
Usage: python3 scripts/serp_analysis.py "best seo tools" --depth 20
"""
import argparse
from dataforseo_api import api_post, get_result, print_serp_list, format_count


def main():
    parser = argparse.ArgumentParser(description="SERP analysis")
    parser.add_argument("keyword", help="Search keyword")
    parser.add_argument("--location", "-loc", type=int, default=2840,
                        help="Location code (default: 2840 = US)")
    parser.add_argument("--depth", "-d", type=int, default=20, help="Search depth")
    args = parser.parse_args()

    data = [{
        "keyword": args.keyword,
        "location_code": args.location,
        "language_code": "en",
        "depth": args.depth
    }]
    
    response = api_post("serp/google/organic/live/advanced", data)
    results = get_result(response)
    
    print(f"keyword: {args.keyword}")
    print(f"location: {args.location}")
    
    if results:
        result = results[0]
        print(f"total_results: {format_count(result.get('se_results_count'))}")
        items = result.get("items", [])
        print_serp_list(items)
    else:
        print("No results found")


if __name__ == "__main__":
    main()

```

---
