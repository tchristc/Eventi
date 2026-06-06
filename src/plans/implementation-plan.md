# Implementation Plan

## Scope
Build the Local Events Hub PWA using Eleventy + Bootstrap frontend, Supabase backend, and Cloudflare Pages deployment as specified in the project README and design spec.

## Success Criteria
- Static site builds and serves locally with Eleventy.
- Event listing and event detail pages render from normalized data.
- Supabase schema, RLS, and auth are in place.
- Import pipeline can ingest at least one provider source end-to-end.
- PWA baseline (manifest + service worker + offline shell) is active.
- CI validates lint, tests, build, and accessibility smoke checks.

## Constraints
- Mobile-first and WCAG 2.2 AA alignment.
- Static-first architecture with progressive enhancement.
- Security-first defaults (no secret leakage, RLS enabled, input validation).
- Cost-conscious services and edge-friendly deployment.

## Phases

### Phase 1: Foundations (Week 1)
- Initialize Node.js project and Eleventy configuration.
- Create source folders, base layout, and starter pages.
- Add env template and deployment config placeholders.
- Add CI workflow scaffold.

Deliverables:
- Local dev command works.
- Build command outputs static artifacts.
- Base homepage renders and is responsive.

### Phase 2: Data Model and API Integration (Week 2)
- Implement normalized event schema and data adapters.
- Create Supabase migrations for core tables.
- Add service layer for events and categories.
- Add unified API error format.

Deliverables:
- Seeded events can render in UI.
- API/service contract tests pass.

### Phase 3: Core User Experience (Week 3)
- Event list, detail, filtering, and category navigation.
- Favorites and user settings with Supabase Auth.
- Accessibility passes for keyboard and screen reader basics.
- Dynamic location dropdown with recent selections and remove actions.
- Live filter updates for subject, category, start/end date, and radius (default 50 miles).

Deliverables:
- Users can browse, filter, and save favorites.
- Lighthouse accessibility score target reached for primary pages.
- Changing location updates the local event feed immediately.
- Filter changes update displayed events without full page reload.

### Phase 4: Ingestion Pipeline (Week 4)
- Add initial provider import function (Eventbrite first).
- Deduplication and validation pipeline.
- Dead-letter handling for failed imports.

Deliverables:
- Scheduled import writes normalized events.
- Structured logs and failure handling visible.

### Phase 5: PWA, Observability, and Launch (Week 5)
- Manifest, service worker caching, and offline fallback.
- Sentry integration and uptime checks.
- Performance tuning and deployment hardening.

Deliverables:
- App installable on mobile and desktop.
- Error telemetry active in production.
- Deployment runbook completed.

## Work Breakdown
- Frontend Foundation: layouts, pages, CSS, JS modules.
- Backend Foundation: Supabase schema, RLS, auth, edge functions.
- Ingestion: provider clients, normalizers, validators, schedulers.
- Quality: lint, unit tests, smoke tests, accessibility checks.
- Operations: CI/CD, logging, monitoring, incident runbook.
- Discovery UX: location suggestions, recent locations persistence/removal, live search filtering.

## Risks and Mitigations
- Provider API variability: isolate adapters and schema validation.
- OAuth complexity: start with email/magic-link auth first.
- Data quality issues: strict dedupe rules and dead-letter queue.
- Performance drift: automate Lighthouse checks in CI.

## Definition of Done
- Functional requirements implemented for MVP.
- Security and RLS policies verified.
- Accessibility and performance goals validated.
- CI green on lint, tests, build, and checks.
- Architecture and operational docs updated.
