# Local Events Hub

A modern Progressive Web Application (PWA) for discovering, browsing, and sharing local events from multiple community and social platforms.

The application aggregates events from public APIs and community sources, normalizes the data, and presents it through a fast, mobile-friendly experience powered by static site generation and edge-hosted infrastructure.

---

## Features

### Event Discovery

* Browse local events
* Search and filter events
* Category-based navigation
* Location-aware event listings
* Mobile-friendly experience

### Data Sources

* Facebook Events (where API access is available)
* Eventbrite
* Meetup
* Local community organizations
* Government event feeds
* User-submitted events
* Additional public event APIs

### Progressive Web App

* Installable on desktop and mobile
* Offline support
* Cached event browsing
* Responsive design
* Fast loading experience

### User Features

* User authentication
* Favorite events
* Saved preferences
* Personalized experience
* Event submissions

---

# Technology Stack

## Frontend

* Node.js
* npm
* Eleventy (11ty)
* Bootstrap 5
* Vanilla JavaScript (ES Modules)
* Progressive Web App technologies

## Backend

* Supabase
* PostgreSQL
* Row Level Security (RLS)
* Supabase Auth
* Supabase Storage
* Supabase Edge Functions

## Infrastructure

* Cloudflare Pages
* Cloudflare CDN
* Cloudflare DNS
* Cloudflare Analytics

## Monitoring

* Sentry
* Supabase Logs
* Uptime Monitoring

---

# Architecture

See:

```text
/docs/ARCHITECTURE.md
```

The architecture document contains:

* System design
* Database design
* Security model
* RLS policies
* Event ingestion architecture
* Monitoring strategy
* Error handling standards
* Deployment architecture

---

# Getting Started

## Prerequisites

Install:

* Node.js LTS
* npm
* Git

Recommended:

* VS Code
* Supabase CLI
* Cloudflare Wrangler

Verify installation:

```bash
node --version
npm --version
git --version
```

---

# Local Development

Clone repository:

```bash
git clone https://github.com/your-org/local-events-hub.git

cd local-events-hub
```

Install dependencies:

```bash
npm install
```

Create environment file:

```bash
cp .env.example .env
```

Configure environment variables.

Start development server:

```bash
npm run dev
```

Application will be available at:

```text
http://localhost:8080
```

---

# Environment Variables

Example:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=

SENTRY_DSN=

PUBLIC_SITE_URL=http://localhost:8080
```

Never commit secrets to source control.

---

# Project Structure

```text
/
├── src/
│   ├── pages/
│   ├── layouts/
│   ├── includes/
│   ├── assets/
│   ├── js/
│   ├── css/
│   └── services/
│
├── public/
│
├── functions/
│   ├── event-import/
│   ├── event-sync/
│   └── moderation/
│
├── docs/
│   └── ARCHITECTURE.md
│
├── tests/
│
├── .github/
│   └── workflows/
│
├── package.json
├── README.md
└── wrangler.toml
```

---

# Development Commands

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build static site:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

Run linting:

```bash
npm run lint
```

Run tests:

```bash
npm test
```

---

# Security

Security is a first-class concern.

Implemented controls include:

* HTTPS everywhere
* Supabase Row Level Security
* Secure authentication flows
* Input validation
* API rate limiting
* Cloudflare protections
* Secure secret management

Review:

```text
/docs/ARCHITECTURE.md
```

for complete security details.

---

# Accessibility

This project targets WCAG 2.2 AA compliance.

Requirements include:

* Semantic HTML
* Keyboard navigation
* Proper heading structure
* Screen reader compatibility
* Sufficient color contrast
* Accessible forms and controls

Accessibility should be considered for every feature and pull request.

---

# Performance Goals

Target Lighthouse Scores:

| Category       | Score |
| -------------- | ----- |
| Performance    | 90+   |
| Accessibility  | 95+   |
| Best Practices | 95+   |
| SEO            | 95+   |

Performance goals:

* First Contentful Paint < 2s
* Largest Contentful Paint < 2.5s
* Time To Interactive < 3s

---

# Deployment

## Cloudflare Pages

Production deployments are performed through GitHub integration.

Deployment workflow:

```text
Git Push
    ↓
GitHub Actions
    ↓
Build Validation
    ↓
Cloudflare Pages
    ↓
Production
```

---

# Monitoring & Observability

The application includes:

* Frontend error tracking
* API monitoring
* Database monitoring
* Uptime monitoring
* Structured logging
* Performance tracking

Errors should be actionable and observable.

---

# Contributing

1. Create a feature branch
2. Follow coding standards
3. Add tests when applicable
4. Verify accessibility requirements
5. Submit a pull request

---

# Design Principles

* Static-first architecture
* Mobile-first design
* Accessibility by default
* Security by default
* Progressive enhancement
* API-driven architecture
* Edge-first delivery
* Observable systems
* Cost-efficient infrastructure

---

# License

MIT License

See LICENSE for details.
