# ACME Pay

Salary management for ACME's HR Manager: keep salary records for 10,000 employees in 12 countries accurate, and answer "how do we pay people?" without exporting to Excel.

![Overview](docs/screenshots/overview.png)

| Employees                                    | Employee                                   | Pay insights                               |
| -------------------------------------------- | ------------------------------------------ | ------------------------------------------ |
| ![Employees](docs/screenshots/employees.png) | ![Employee](docs/screenshots/employee.png) | ![Insights](docs/screenshots/insights.png) |

## What it does

- **Employees:** search by name, email or employee code; filter by country, department, job title or band status; sort, page, add, edit and delete. Filters live in the URL, so any view can be shared.
- **Salary history:** every salary change keeps the old value, the new value (including currency when someone relocates), the date and a reason.
- **Overview:** for each department, the pay distribution per country (P10/P25/median/P75/P90 in USD) and a list of who is paid below their band, largest gap first.
- **Pay insights:** minimum, median, average and maximum salary per job title, filterable by country and department.

Read [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) for scope and for what was deliberately left out.

## Stack

|          |                                                                                |
| -------- | ------------------------------------------------------------------------------ |
| API      | NestJS 12 on Fastify, postgres.js with plain SQL, zod validation               |
| UI       | Next.js 16 (App Router), React 19, TanStack Query, Radix Dialog, CSS modules   |
| Database | PostgreSQL 17                                                                  |
| Shared   | `@acme/shared`: reference data, pay band rules, zod schemas used by both sides |
| Tooling  | npm workspaces, TypeScript (strict), oxlint, Prettier, Vitest                  |
| Deploy   | Docker Compose with Caddy on an Oracle Cloud free-tier Ampere (ARM64) VM       |

```
apps/api        NestJS API, migrations, seed
apps/web        Next.js UI
packages/shared Types, schemas and pay rules shared by api and web
deploy/         Caddyfile
docs/           Requirements, architecture, AI workflow, screenshots
design/         Approved UI prototype
```

## Run it with Docker (whole stack)

```bash
cp .env.example .env              # change POSTGRES_PASSWORD for anything real
docker compose up -d --build --wait
docker compose exec api node apps/api/dist/database/seed.js   # 10,000 employees, ~1s
```

Open http://localhost. If port 80 is taken, set `HTTP_PORT=8088` in `.env`.

## Develop locally

Requires Node 22+ and Docker.

```bash
npm install
npm run db:up                     # Postgres on localhost:5433
npm run build -w @acme/shared
npm run build -w @acme/api && npm run db:seed
npm run dev:api                   # http://localhost:3001/api
npm run dev:web                   # http://localhost:3000 (proxies /api)
```

## Quality checks

```bash
npm run lint                      # oxlint
npm run typecheck
npm test                          # shared + api + web
TEST_DATABASE_URL=postgres://acme:acme@localhost:5433/acme_pay_test npm test   # also runs the PostgreSQL integration suite
```

There are 42 tests in total. They cover the behaviour that matters rather than every line:

- **Shared:** pay rules (band status, gap, USD conversion) and the validation schemas.
- **API:** service rules (salary history, relocation, duplicate email, not found), the HTTP contract (query parsing, validation errors), the seed generator (deterministic, unique, realistic band spread), and SQL against real PostgreSQL (filters, search, history, percentile consistency).
- **Web:** form behaviour (client validation, reason only when the salary changes, sends only changed fields), URL state, formatting and chart scale.

CI runs all of it against a Postgres service and builds both images for amd64 and arm64.

## API

All endpoints are under `/api`.

| Method | Path                                                                     | Purpose                                                                |
| ------ | ------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| GET    | `/employees?q&country&department&jobTitle&band&sort&order&page&pageSize` | Paged, filtered list with USD and band status                          |
| GET    | `/employees/:id`                                                         | One employee with salary history                                       |
| POST   | `/employees`                                                             | Create (salary in local currency)                                      |
| PATCH  | `/employees/:id`                                                         | Update; a salary change writes history (`salaryChangeReason` optional) |
| DELETE | `/employees/:id`                                                         | Delete                                                                 |
| GET    | `/insights/summary?country&department`                                   | Headcount, median, average, below-band count                           |
| GET    | `/insights/distribution?country&department`                              | Percentiles per country                                                |
| GET    | `/insights/job-titles?country&department`                                | Min/median/average/max per job title                                   |
| GET    | `/insights/below-band?country&department&limit`                          | Largest gaps first                                                     |
| GET    | `/meta`                                                                  | Countries, currencies, FX, departments, job titles                     |
| GET    | `/health`                                                                | Liveness, including a database ping                                    |

Validation errors return `400` with `issues: [{ path, message }]`, a duplicate email returns `409`, and an unknown id returns `404`.

## Deploy to the Oracle free tier

1. Create an Always Free **Ampere A1** VM (Ubuntu). In the subnet's security list, open ports 80 and 443.
2. Install Docker Engine and the compose plugin, then clone this repo.
3. `cp .env.example .env`, then set a strong `POSTGRES_PASSWORD`. Set `SITE_ADDRESS=pay.example.com` for automatic HTTPS, or keep `:80`.
4. `docker compose up -d --build --wait`, then run the seed command above.

The images build natively on ARM. CI also cross-builds them for arm64 on every push. Optional Cloudflare proxy and load balancer setups are described in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Further reading

- [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md): goal, scope, exclusions and assumptions
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): design, decisions, trade-offs and performance
- [docs/AI_WORKFLOW.md](docs/AI_WORKFLOW.md): how AI was used and where its output was corrected
- [DESIGN.md](DESIGN.md) and [PRODUCT.md](PRODUCT.md): design system and product brief
