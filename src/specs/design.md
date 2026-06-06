# Architecture Specification

## Project Overview

### Purpose

This application is a modern, mobile-friendly Progressive Web Application (PWA) designed to aggregate, discover, and display local events from multiple sources, including:

* Facebook Events
* Eventbrite
* Meetup
* Local government event feeds
* Community organization websites
* User-submitted events
* Other publicly available event APIs

The application will be hosted on Cloudflare Pages and utilize Supabase as its backend platform for data storage, authentication, APIs, and security.

### Goals

* Fast static site delivery
* Mobile-first responsive design
* Progressive Web App support
* Offline capabilities where practical
* Accessible user experience (WCAG 2.2 AA)
* Secure backend architecture
* Scalable event ingestion
* Robust monitoring and error handling
* Low operational cost
* SEO-friendly content

---

# Technology Stack

## Frontend

| Component             | Technology                |
| --------------------- | ------------------------- |
| Runtime               | Node.js LTS               |
| Package Manager       | npm                       |
| Static Site Generator | Eleventy (11ty)           |
| Styling               | Bootstrap 5               |
| Icons                 | Bootstrap Icons           |
| JavaScript            | Vanilla JS / ES Modules   |
| Build Tool            | Vite (optional)           |
| PWA Support           | Service Workers           |
| Storage               | Local Storage + IndexedDB |
| Hosting               | Cloudflare Pages          |

## Backend

| Component       | Technology                     |
| --------------- | ------------------------------ |
| Database        | Supabase PostgreSQL            |
| Authentication  | Supabase Auth                  |
| API             | Supabase REST + Edge Functions |
| Security        | Row Level Security (RLS)       |
| Storage         | Supabase Storage               |
| Background Jobs | Supabase Edge Functions        |
| Monitoring      | Supabase Logs                  |

## Infrastructure

| Component         | Technology                  |
| ----------------- | --------------------------- |
| CDN               | Cloudflare                  |
| DNS               | Cloudflare                  |
| SSL               | Cloudflare Managed SSL      |
| Analytics         | Cloudflare Analytics        |
| Error Monitoring  | Sentry                      |
| Uptime Monitoring | Better Stack or Uptime Kuma |

---

# High Level Architecture

```text
                    +------------------+
                    | Social/Event APIs|
                    +---------+--------+
                              |
                              v
                    +------------------+
                    | Event Import Jobs|
                    | Edge Functions   |
                    +---------+--------+
                              |
                              v
+-------------+      +------------------+
| Cloudflare  |----->| Supabase API     |
| Pages       |      | PostgreSQL       |
+------+------+      +--------+---------+
       |                      |
       |                      |
       v                      v
+---------------------------------------+
|       Browser / PWA Application       |
|                                       |
| Bootstrap 5 UI                        |
| Local Storage                         |
| IndexedDB Cache                       |
| Service Worker                        |
+---------------------------------------+
```

---

# Application Layers

## Presentation Layer

Responsibilities:

* Render pages
* Responsive UI
* Accessibility
* SEO metadata
* User interactions

Requirements:

* Bootstrap 5 grid system
* Mobile-first design
* Semantic HTML
* ARIA labels
* Keyboard navigation support
* Color contrast compliance

---

## Application Layer

Responsibilities:

* Event search
* Filtering
* Favorites
* User preferences
* API communication

Features:

* Event browsing
* Event details
* Favorites
* Saved searches
* Location filtering
* Calendar integrations

---

## Data Layer

Responsibilities:

* Data persistence
* API communication
* Offline caching

Sources:

* Supabase REST API
* Edge Functions
* Local Storage
* IndexedDB

---

# Event Ingestion Architecture

## Supported Sources

### Facebook Events

When available through approved APIs.

### Eventbrite

Public Eventbrite APIs.

### Meetup

Public Meetup APIs.

### Community Sources

Custom importers.

### User Submitted Events

Moderated submissions.

---

## Import Pipeline

```text
Scheduler
    |
    v
Edge Function
    |
    +--> Fetch Events
    |
    +--> Normalize Data
    |
    +--> Deduplicate
    |
    +--> Validate
    |
    +--> Store
```

### Normalization Rules

Convert all providers into a common schema:

```json
{
  "id": "",
  "title": "",
  "description": "",
  "startDate": "",
  "endDate": "",
  "venue": "",
  "city": "",
  "state": "",
  "latitude": "",
  "longitude": "",
  "source": "",
  "sourceUrl": ""
}
```

---

# Database Architecture

## Core Tables

### events

```sql
events
------
id
title
slug
description
start_date
end_date
venue
address
city
state
latitude
longitude
image_url
source
source_event_id
created_at
updated_at
```

### categories

```sql
categories
----------
id
name
slug
```

### event_categories

```sql
event_categories
----------------
event_id
category_id
```

### users

Managed by Supabase Auth.

### favorites

```sql
favorites
---------
user_id
event_id
created_at
```

### submissions

```sql
submissions
-----------
id
submitted_by
status
event_data
created_at
```

---

# Security Architecture

## Authentication

Supabase Auth:

* Email/password
* Magic links
* Google OAuth
* Facebook OAuth

---

## Row Level Security

### Public Events

```sql
SELECT
USING (true)
```

### Favorites

```sql
auth.uid() = user_id
```

### User Submissions

```sql
auth.uid() = submitted_by
```

### Admin Access

Role-based policies.

---

# API Design

## API Principles

* Versioned endpoints
* RESTful
* JSON responses
* Consistent error format

Example:

```json
{
  "success": false,
  "error": {
    "code": "EVENT_NOT_FOUND",
    "message": "Requested event does not exist."
  }
}
```

---

# Caching Strategy

## Cloudflare CDN

Cache:

* Images
* Static assets
* Generated pages

## Browser Cache

* CSS
* JS
* Fonts

## IndexedDB

Store:

* Recent searches
* Event listings
* Favorites cache

## Local Storage

Store:

* UI preferences
* Theme
* Last search filters

---

# Progressive Web App

## Requirements

### Service Worker

Functions:

* Asset caching
* Offline support
* Background sync

### Web Manifest

Includes:

* App name
* Icons
* Theme colors
* Install support

### Offline Experience

Users should:

* View recently loaded events
* Access favorites
* Continue browsing cached content

---

# Error Handling

## Frontend

Centralized error handler.

Categories:

* API errors
* Validation errors
* Network failures
* Authentication errors

User-friendly messages:

```javascript
Unable to load events.
Please try again later.
```

---

## API Layer

All endpoints return:

```json
{
  "success": false,
  "error": {
    "code": "",
    "message": ""
  }
}
```

---

## Database Layer

Requirements:

* Retry transient failures
* Log failed operations
* Dead-letter storage for failed imports

---

# Monitoring

## Frontend Monitoring

Sentry:

Capture:

* JavaScript errors
* Promise rejections
* Performance issues

---

## Backend Monitoring

Track:

* API latency
* Import failures
* Database failures
* Authentication failures

---

## Uptime Monitoring

Monitor:

* Website availability
* API availability
* Supabase connectivity

Alert channels:

* Email
* Discord
* Slack

---

# Performance Requirements

## Lighthouse Targets

| Metric         | Target |
| -------------- | ------ |
| Performance    | 90+    |
| Accessibility  | 95+    |
| Best Practices | 95+    |
| SEO            | 95+    |

---

## Page Performance

First Contentful Paint:

< 2 seconds

Largest Contentful Paint:

< 2.5 seconds

Time To Interactive:

< 3 seconds

---

# Accessibility Requirements

WCAG 2.2 AA compliance.

Requirements:

* Semantic HTML
* Proper heading structure
* Keyboard navigation
* Screen reader support
* ARIA labels
* Focus indicators
* Sufficient contrast ratios

---

# CI/CD

## GitHub Actions

Pipeline:

```text
Lint
  ↓
Unit Tests
  ↓
Build
  ↓
Accessibility Tests
  ↓
Deploy to Cloudflare Pages
```

---

# Logging Strategy

## Frontend

Log Levels:

* Error
* Warning
* Info

Production:

* Send errors to Sentry

---

## Backend

Structured JSON logs.

Example:

```json
{
  "timestamp": "",
  "level": "error",
  "service": "event-import",
  "message": "Failed to import event",
  "eventId": ""
}
```

---

# Future Enhancements

* AI-powered event recommendations
* Geolocation search
* Push notifications
* SMS notifications
* Event attendance tracking
* Calendar subscriptions
* Multi-region support
* Edge caching of event APIs
* Event moderation workflow
* Admin dashboard

---

# Architectural Principles

1. Static-first architecture
2. API-driven design
3. Mobile-first UX
4. Accessibility by default
5. Secure by default
6. Progressive enhancement
7. Offline-first where practical
8. Observable systems
9. Cost-efficient infrastructure
10. Vendor-neutral application design
