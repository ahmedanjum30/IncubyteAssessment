# Architecture

## Overview

```
                 (optional)            (optional)
 Browser ──► Cloudflare proxy ──► Load balancer ──► Oracle VM (Docker Compose)
                                                     │
                                                     ├─ reverse proxy (TLS, routing)
                                                     │     ├─ /      → web  (Next.js)
                                                     │     └─ /api   → api  (NestJS)
                                                     │
                                                     └─ db (PostgreSQL, persistent volume)
```

Without the optional layers, the browser talks directly to the reverse proxy on the Oracle VM.

## Components

| Service | Tech        | Responsibility |
| ------- | ----------- | -------------- |
| `web`   | Next.js     | HR Manager UI: employee management and salary insights. |
| `api`   | NestJS      | REST API, validation, business rules, aggregate queries for insights. |
| `db`    | PostgreSQL  | Relational store for employees and salaries. Data on a named Docker volume. |
| `proxy` | Reverse proxy (e.g. Caddy) | Single public entry point, TLS, routes `/api` to `api` and everything else to `web`. |

### Why PostgreSQL

The data is relational and the main product questions are aggregates (average/median salary by country, job title, department, etc.). PostgreSQL handles `GROUP BY`, window functions and percentiles (`percentile_cont`) natively, and 10,000 rows is comfortably small for it with indexes on the filter columns.

## Deployment: Dockerized build on free Oracle server

- Target: Oracle Cloud Always Free **Ampere A1 (ARM64)** VM.
- Every service has its own Dockerfile; `docker-compose.yml` runs the full stack.
- Images are built multi-arch (`linux/amd64` + `linux/arm64`) so they run locally and on the Oracle VM.
- Multi-stage builds keep production images small (build stage → slim runtime stage, non-root user).
- Config through environment variables; `.env.example` is committed, real `.env` is not.
- Database migrations run as a step before the API starts; the seed script (10,000 employees) runs on demand.
- Postgres is not exposed publicly; only the reverse proxy publishes ports 80/443.

## Optional: Cloudflare proxy

Not required to run. If enabled later:

- Point DNS at the Oracle VM with the Cloudflare proxy on (orange cloud).
- Use Cloudflare **Full (strict)** TLS with a Cloudflare origin certificate on the reverse proxy.
- Restrict the VM's ingress (OCI security list / firewall) to Cloudflare IP ranges.
- Gains: DDoS protection, CDN caching for static Next.js assets, hidden origin IP.

## Optional: Load balancer

Not required to run. If traffic or availability needs grow:

- Put an OCI Load Balancer (Always Free includes one flexible LB) or Cloudflare Load Balancing in front.
- Run 2+ `api` and `web` replicas; both are stateless so they scale horizontally.
- Health check endpoints: `GET /api/health` (api) and `/` (web).
- PostgreSQL remains a single instance; a managed DB or replica is the next step if needed.

The app must stay stateless (no in-memory sessions or local file storage) so these layers can be added without code changes.
