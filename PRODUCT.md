# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

- Backend: NestJS (TypeScript)
- Frontend: Next.js (TypeScript, React)
- Database: PostgreSQL
- Linting: oxlint
- Deploy: Docker Compose on a free Oracle Cloud (Ampere A1, ARM64) server; Cloudflare proxy and load balancer optional later.

## Users

- **Primary:** the HR Manager at ACME. Works mostly on a desktop in long sessions (editing salary records, filtering large tables, reading pay insights) and occasionally checks an employee or a figure on a phone.

## Product Purpose

ACME's HR team manages salary data for ~10,000 employees across multiple countries in spreadsheets, which is tedious and error-prone. This product replaces those spreadsheets with a web app where the HR Manager can:

1. Manage employee salary records (create, view, edit, delete, search, filter).
2. Answer questions about how the org pays people (e.g. salary ranges and averages by country, job title, department).

Success: the HR Manager can find any employee in seconds, update a salary confidently, and answer a pay question without exporting to Excel.

## Positioning

A focused tool for one persona and two jobs: keep salary data correct, and make pay patterns visible. It deliberately does not try to be a full HRIS or payroll system.

## Operating Context

- Internal tool, used by HR staff only.
- Data spans multiple countries and currencies.
- Dataset size: ~10,000 employees (seeded for the demo).
- Built as an Incubyte take-home assessment; reviewers judge product thinking, engineering judgment and code quality.

## Capabilities and Constraints

- Employee CRUD with search, filter, sort and pagination over ~10k rows.
- Salary insights: aggregates by country, job title, department.
- Undecided (to be settled in `docs/REQUIREMENTS.md`): currency normalization approach, exact insight set, auth scope.

## Brand Commitments

None. ACME is a fictional org with no brand assets; the product may establish its own identity.

## Evidence on Hand

- Seeded data only (10,000 generated employees). No real employee data, customers or testimonials exist; do not fabricate any.

## Product Principles

1. **Correctness over cleverness:** salary data must never look ambiguous (currency, period, and source are always clear).
2. **Answers, not exports:** common pay questions are answerable inside the app.
3. **Speed at scale:** 10,000 rows must feel instant to search and filter.
4. **Deliberate scope:** do a small set of jobs well; say clearly what is left out.

## Accessibility & Inclusion

- WCAG 2.2 AA: contrast, full keyboard navigation, visible focus, screen-reader labels.
- Layout must work on desktop first and remain usable on phone widths.
