# Architecture Overview

This document is the implementation-facing architecture baseline derived from src/specs/design.md.

## Core Direction
- Static-first frontend using Eleventy.
- Supabase for data, auth, and policy-driven security.
- Cloudflare Pages for edge-hosted delivery.
- Progressive enhancement with PWA capabilities.

## High-Level Components
- Web App: Eleventy static pages + progressive JS.
- Data Services: Supabase REST/Edge Functions.
- Event Ingestion: scheduled provider import functions.
- Observability: Sentry + platform logs + uptime checks.

## Data Flow
1. Scheduled function fetches source events.
2. Source events are normalized and deduplicated.
3. Validated events are stored in Supabase.
4. Frontend reads event data and renders static/dynamic views.
5. Client caches selected data for offline usage.

## Security Model
- Supabase Auth for identity.
- RLS on user-specific records (favorites, submissions).
- Public read policies for approved event data.
- Input validation on all write paths.

## MVP Boundaries
- Event listing and detail pages.
- Search/filter baseline.
- Favorites for authenticated users.
- One provider ingestion adapter implemented first.

## Non-Functional Targets
- WCAG 2.2 AA alignment.
- Lighthouse: Performance 90+, Accessibility 95+, Best Practices 95+, SEO 95+.
- FCP < 2s, LCP < 2.5s, TTI < 3s.
