# Architecture

## Overview

```
                  (optional)           (optional)
 Browser ──► Cloudflare proxy ──► Load balancer ──► Oracle VM (Docker Compose)
                                                      │
                                                      ├─ proxy  Caddy: TLS, gzip/zstd, routing
                                                      │     ├─ /api/* → api  (NestJS on Fastify)
                                                      │     └─ /*     → web  (Next.js standalone)
                                                      │
                                                      └─ db     PostgreSQL 17 (named volume, not public)
```

Without the optional layers, the browser talks straight to Caddy on the VM.

```
packages/shared ─┬─► apps/api   reference data, pay band rules, zod schemas, response types
                 └─► apps/web   the same schemas validate forms before they reach the API
```

## Components

| Service | Responsibility                                                                                                                            |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `web`   | Next.js App Router UI. The pages are static shells that render instantly; data loads on the client through TanStack Query against `/api`. |
| `api`   | NestJS modules: `employees` (CRUD and history), `insights` (aggregates), `meta`/`health`. Migrations and reference data sync run on boot. |
| `db`    | `employees`, `salary_changes`, `pay_bands`, `countries`, `fx_rates`, plus one view, `employee_pay`.                                       |
| `proxy` | Caddy is the only public port. It handles automatic HTTPS when `SITE_ADDRESS` is a domain.                                                |

## Data model

```
countries (code, name, currency) ─┐
fx_rates (currency, usd_per_unit, as_of)
pay_bands (country, department, level → min, max)   local currency
employees (code, name, email, title, department, level, country, salary, hired_on)
salary_changes (employee → previous_salary, previous_currency, new_salary, currency, reason, changed_at)

employee_pay  = employees ⋈ countries ⋈ fx_rates ⟕ pay_bands
                → salary_usd, band_min/max, band_status, gap_usd
```

Salaries are stored in **local currency**, because that is what an HR manager agrees with an employee. USD is derived, never stored. That way one FX table update re-bases every comparison, and a stored USD figure can never go stale.

`employee_pay` is the single definition of "USD salary" and "below band". The list, the detail page and every insight query read from it, so they cannot disagree with each other.

## Decisions and trade-offs

| Decision                                      | Why                                                                                                                                                                                 | Trade-off                                                                          |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **PostgreSQL** over SQLite                    | The product questions are percentiles and group-bys, which Postgres has natively (`percentile_cont`). It also gives concurrent writes, trigram search and a real server for Docker. | One more container than SQLite.                                                    |
| **postgres.js + plain SQL** instead of an ORM | The interesting part of this app is aggregate SQL, so it stays readable in reviews. postgres.js is the fastest Node driver and composes safe fragments for dynamic filters.         | No generated schema types; a few row types are declared by hand in `@acme/shared`. |
| **Hand-rolled migrator** (~30 lines)          | Ordered `.sql` files and a `schema_migrations` table, inside a transaction with an advisory lock so replicas can boot together.                                                     | No down migrations. Forward-only is the norm for production databases anyway.      |
| **Fastify adapter**                           | Lower per-request overhead than Express, with the same Nest programming model.                                                                                                      | Some Express-only middleware isn't usable (none needed here).                      |
| **zod in a shared package**                   | One schema validates the form in the browser and the request in the API, and gives both sides the same types.                                                                       | Not the Nest-default class-validator, but less code and no decorators on DTOs.     |
| **Offset pagination**                         | 10k rows and page jumps ("page 40 of 48") are what HR expects. Count and page run in parallel.                                                                                      | Keyset pagination would scale further. Not needed at this size.                    |
| **Client-side data fetching**                 | Pages are static and cached at the edge. Filters and sorting are interactive, and `keepPreviousData` keeps the table steady while the next page loads.                              | The first data paint waits for one API round trip (~10–40 ms).                     |
| **Seeded FX table**                           | Reproducible numbers and deterministic tests.                                                                                                                                       | Rates must be updated by hand or by a later job.                                   |
| **Bands per country × department × level**    | This matches how pay bands are usually set, and makes "below band" meaningful.                                                                                                      | Bands are generated, not real. Editing them in the UI is out of scope.             |

## Performance

Measured locally with 10,000 seeded employees (warm, via 127.0.0.1):

| Request                                                       | Time      |
| ------------------------------------------------------------- | --------- |
| `GET /api/employees` (25 rows + total)                        | ~6 ms     |
| Search + country filter + salary sort                         | ~7 ms     |
| Band filter, sort by gap, page 40                             | ~14 ms    |
| `GET /api/insights/summary` (all 10k)                         | ~10–20 ms |
| `GET /api/insights/distribution` (percentiles × 12 countries) | ~11 ms    |
| `GET /api/insights/job-titles`                                | ~22 ms    |
| Seed 10,000 employees                                         | ~0.9 s    |

What makes it fast:

- **Indexes** on `(country_code, department, level)` (filters and the band join), `department`, `job_title`, `(full_name, id)` for sorting, and a **trigram GIN index** for `ILIKE` search.
- The list query and its `count(*)` run **in parallel**. Page size is capped at 100, so no request can pull the whole table.
- Insights are **single aggregate queries**. Nothing loops over employees in Node.
- On the client: the next page is **prefetched**, the search input is **debounced** (250 ms), in-flight requests are **cancelled** through `AbortSignal` when filters change, and the previous data stays on screen while the next loads.
- **Fonts are self-hosted** by `next/font` (no layout shift, no third-party request). Styling uses plain CSS modules (no runtime CSS-in-JS), and the chart is CSS rather than a chart library. Animation uses CSS transitions, never JavaScript loops, except the stat count-up, which uses `requestAnimationFrame`.
- Caddy compresses responses with zstd/gzip. The overview HTML is about 3.4 KB on the wire.
- Postgres is tuned modestly for the 24 GB Ampere VM (`shared_buffers=256MB`, `work_mem=16MB`).

**When it would need to change:** around 1M+ rows, add keyset pagination and a materialized view for insights, refreshed when salaries change.

## Deployment: Docker on the Oracle free tier

- Target: Oracle Cloud Always Free **Ampere A1 (ARM64)**.
- Multi-stage images on multi-arch `node:24-alpine`. The runtime images run as a non-root user and hold production dependencies only (api ~300 MB; web is Next `standalone`).
- Compose health checks gate startup in order: db, then api, then web. Restarts are `unless-stopped`.
- Configuration comes only from environment variables. `.env.example` is committed; `.env` is not.
- Postgres binds to `127.0.0.1` on the host, so only Caddy is public.
- CI cross-builds both images for `linux/amd64` and `linux/arm64`.

## Optional: Cloudflare proxy

This isn't required to run. To enable it later:

- Point DNS at the VM with the Cloudflare proxy on.
- Use **Full (strict)** TLS with a Cloudflare origin certificate, or let Caddy keep its own certificate.
- Restrict the VM's ingress (OCI security list) to Cloudflare's IP ranges. The API already trusts proxy headers (`trustProxy`).
- **Cloudflare Access** in front of the site gives SSO-based access control without changing app code. This is the planned answer to authentication (see the requirements).
- Next's hashed `/_next/static/*` assets are immutable and cache well at the edge.

## Optional: Load balancer

This isn't required to run. If traffic or availability needs grow:

- Put the **OCI flexible load balancer** (one is included in Always Free) or Cloudflare Load Balancing in front.
- Run 2+ replicas of `api` and `web`. Both are stateless: no sessions, no local files, config from the environment.
- Health checks: `GET /api/health` (which also pings the database) and `GET /`.
- Migrations take a Postgres advisory lock, so several API replicas can start at the same time safely.
- PostgreSQL stays single-instance. A managed database or a read replica is the next step.
