# CLAUDE.md

Rules for working in this repository. Read this before making any change.

## Project

Salary management web app for ACME's HR Manager: manage salary data for ~10,000 employees across multiple countries and answer questions about how the org pays people.

- Brief: Incubyte take-home assessment.
- Requirements: `docs/REQUIREMENTS.md` (written before any code).
- Architecture: `docs/ARCHITECTURE.md`.
- UI/UX: `DESIGN.md`.

## Stack

| Layer    | Choice                                       |
| -------- | -------------------------------------------- |
| Backend  | NestJS (TypeScript)                          |
| Frontend | Next.js (TypeScript, React)                  |
| Database | PostgreSQL                                   |
| Linting  | oxlint                                       |
| Deploy   | Docker Compose on a free Oracle Cloud server |

Do not introduce a different framework, database or linter without asking first.

## Testing rules

- Tests must be **clear**: a reader should understand what behavior is being protected from the test name and body alone.
- Cover the **base structure and core behavior**, not every possible outcome or every line of code. No chasing coverage percentages.
- Priorities, in order:
  1. Core business logic (salary rules, validation, insight calculations).
  2. API contract of the main endpoints (happy path + the most important failure case).
  3. Key UI flows only where they carry real logic.
- Tests must be fast and deterministic: no reliance on wall-clock time, random data without a fixed seed, or network calls.
- One behavior per test. Name tests as sentences describing the behavior.
- Skip tests for trivial getters, framework wiring, and pure presentational components.

## Linting and formatting

- Use **oxlint** for linting in both apps. Fix lint errors; do not disable rules inline without a comment explaining why.
- Code must pass lint and type-check (`tsc --noEmit`) before committing.

## Design rule

- **All UI design work must go through the `impeccable` and `ui-ux-pro-max` skills.** Load both before designing or changing any screen, component, layout, color, typography or interaction. See `DESIGN.md`.

## Architecture rules

- The whole system runs as a **Dockerized build** (see `docs/ARCHITECTURE.md`). Every service must have a Dockerfile and be wired into `docker-compose.yml`.
- Images must build for **linux/arm64** (Oracle free tier Ampere A1) as well as amd64.
- Configuration comes from environment variables only. Never commit secrets; commit `.env.example` instead.
- Keep the design ready for an optional Cloudflare proxy and load balancer, but do not require them to run.

## Git rules

- Make **small, incremental commits** that each represent one logical step. The commit history is part of the assessment.
- Commit messages: imperative mood, short subject line (e.g. `Add employee list endpoint with pagination`).
- Requirements doc is committed before any application code.

## AI workflow log

The interview covers how AI was used. Keep `docs/AI_WORKFLOW.md` current as work happens:

- Key prompts and instructions given to AI tools (Claude Code, impeccable, ui-ux-pro-max).
- Decisions where AI output was rejected or corrected, and why.
- Trade-offs considered and the reasoning behind the choice.
