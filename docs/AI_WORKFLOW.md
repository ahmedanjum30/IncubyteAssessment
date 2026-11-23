# AI workflow

This project was built with **Claude Code** as the main agent, plus two design skills: **impeccable** and **ui-ux-pro-max**. This log records what each tool did, the prompts that steered the work, and the places where AI output was checked, rejected or corrected.

## How the work was driven

| Step                           | Who decided                                                         | What AI did                                                                                                                                                                                                                                                                        |
| ------------------------------ | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Read the brief (PDF and email) | Me                                                                  | Summarised deliverables and flagged that the repo needed `git init` before any work, so the history shows the process.                                                                                                                                                             |
| Stack                          | Me: NestJS, Next.js, PostgreSQL, oxlint, Docker on Oracle free tier | Recorded the rules in `CLAUDE.md` and wrote the first architecture doc, including the optional Cloudflare proxy and load balancer.                                                                                                                                                 |
| Product brief                  | Me (3 questions answered)                                           | impeccable `init` interviewed me (desktop + occasional mobile, no brand, WCAG 2.2 AA) and wrote `PRODUCT.md`.                                                                                                                                                                      |
| Visual direction               | Me (picked from 3)                                                  | impeccable rolled a style catalog (`concept-seed`), and I wrote three HTML sketches for its decision page. ui-ux-pro-max supplied the data-dense dashboard style, the Fira pairing for the "category standard" card, and the **box plot** recommendation for salary distributions. |
| Refinement                     | Me: "more animated and beautiful"                                   | Built an animated prototype, served it in impeccable live mode, and checked it with screenshots and the detector.                                                                                                                                                                  |
| Requirements                   | AI draft, my approval                                               | One-page `docs/REQUIREMENTS.md`, committed before any code.                                                                                                                                                                                                                        |
| Build                          | AI, in small commits                                                | Shared package, API, UI, Docker, docs. Each step was linted, type-checked and tested before committing.                                                                                                                                                                            |

## Key prompts (paraphrased)

- "Add these rules to CLAUDE.md / DESIGN.md: clear tests covering the base structure, not every line; Dockerized for our free Oracle server; all design through impeccable and ui-ux-pro-max; oxlint; PostgreSQL; Cloudflare proxy and load balancer optional in the architecture."
- "Generate 3 styles and show them in the live impeccable server."
- "Annual Plate Sheet feels good, but I want it more animated and beautiful."
- "Build it. Use the best-performing options. I don't want it slow or sloppy, and fewer comments."

The last prompt shaped the engineering choices: Fastify over Express, postgres.js over an ORM, CSS modules over runtime styling, no chart library, prefetching and request cancellation, and comments only where the _why_ isn't obvious.

## Where AI output was checked and corrected

Every one of these was caught by a check I asked for (lint, type-check, tests, the impeccable detector, or looking at screenshots), not by assuming the output was right.

| What AI produced                                          | Problem                                                                                   | Fix                                                                                                           |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Prototype fonts: Geist + Geist Mono                       | The impeccable detector flagged them as overused AI-default faces.                        | Switched to Schibsted Grotesk + Azeret Mono.                                                                  |
| Plate labels set _above_ titles ("Plate 1 · ...")         | impeccable's craft floor bans kickers/eyebrows above headings.                            | Moved the metadata beside the title on the same baseline, and wrote the rule into `DESIGN.md`.                |
| Box-plot animation using `scaleX`                         | Scaling squashes the 1px borders to invisible at small widths.                            | Animated `left`/`width` instead. Only 12 rows, so the layout cost is negligible.                              |
| First version of relocation logic in `EmployeesService`   | It wrote an empty currency into salary history (a sentinel-string hack).                  | Rewrote it. History now stores both `previous_currency` and `currency`, with a unit test for relocation.      |
| Seed salaries hard-clamped at 0.7× of band midpoint       | Many employees piled up at an identical gap, and the "Needs a decision" list looked fake. | Switched to a log-normal spread with a wide soft clamp.                                                       |
| Seed name pools (~10 × 10 per country)                    | Screenshots showed "Emma Reed" three times in one list.                                   | Expanded the pools. Combinations now far exceed headcount per country.                                        |
| Zod default error messages                                | A form test exposed messages like "Too small: expected string to have >=2 characters".    | Wrote human messages in the shared schema; the API and UI both use them.                                      |
| Tabular numerals on 34px stats                            | Screenshots showed visible gaps around commas ("3 , 381").                                | Display stats use proportional digits; tables keep tabular digits. Recorded in `DESIGN.md`.                   |
| Selected chart row marked with a 2px side stripe          | The detector flagged it as a side-tab, an AI-UI tell.                                     | Selection now tints the row and changes the label's colour and weight.                                        |
| Literal font sizes and colours in components              | Detector: off the documented type ramp.                                                   | Moved everything onto `--fs-*` and colour tokens and documented them. The detector now reports zero findings. |
| `react-hooks` workaround with a ref written during render | oxlint `react(refs)` error.                                                               | Replaced it with React 19's `useEffectEvent`.                                                                 |
| `role="search"` / `role="group"`                          | oxlint a11y: prefer semantic elements.                                                    | Used `<search>` and `<fieldset>` with a visually hidden `<legend>`.                                           |

### Polish and security pass

Requested: "/impeccable polish", "do a security check if we have missed anything", "add spamming bans, rate limit". The UI was driven through Edge's DevTools protocol (dialogs, hover, validation, true 390px phone width), and the API was probed with crafted requests.

| Found                                                                    | Fix                                                                                                                                                                        |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/employees/99999999999` returned 500                            | `IdPipe` rejects anything that isn't a positive 32-bit integer (400). Tested with five bad ids.                                                                            |
| A 2 MB JSON body hung the connection                                     | API `bodyLimit` 64 KB and Caddy `max_size 1MB`. It now returns 413.                                                                                                        |
| No rate limiting                                                         | Per-IP limits with separate read and write budgets, plus a temporary 403 ban for clients that keep hammering. Tested at the unit level and with a live flood of 40 writes. |
| The rate limiter logged every 429 as an ERROR                            | It returned plain objects, which Nest treats as unknown errors. It now returns `HttpException`, and the logs stay quiet.                                                   |
| Default database password `acme` in compose                              | Compose now requires `POSTGRES_PASSWORD`.                                                                                                                                  |
| No CSP or Permissions-Policy, and API responses had no hardening headers | CSP on pages. Caddy adds `nosniff`, frame, referrer and permissions headers to every response. Containers drop capabilities.                                               |
| Employee page overflowed to 473px on phones                              | Twelve 40px grid gaps forced the width. The page now collapses to one column below 1100px.                                                                                 |
| Brand wrapped and nav clipped at 390px                                   | Brand set to no-wrap, with a tighter nav on phones.                                                                                                                        |
| Five stacked filter selects filled a phone screen                        | On phones the filters sit behind a "Filters (n)" toggle.                                                                                                                   |
| Tabular numerals widened punctuation in sentences ("filters .")          | Tabular digits are now applied only to numeric cells.                                                                                                                      |
| Empty search was a dead end with a useless pager                         | Added a "Clear filters" action and hid the pager when there are no results.                                                                                                |
| Box plot showed a `$0–$1` axis while loading                             | Added a shimmer skeleton until data arrives.                                                                                                                               |
| Tooltip title wrapped awkwardly in mono                                  | The country name is the title line, with the counts on a mono line below.                                                                                                  |
| Date input was taller than the other fields                              | All inputs fixed at 42px.                                                                                                                                                  |
| "+" crosshairs on dialogs (user feedback)                                | Removed. Crosshairs stay on plates only, and the rule is recorded in `DESIGN.md`.                                                                                          |

### Deploying next to another project

The Oracle VM already ran another production app (PlayFlight) with its own Caddy on 80/443. ACME Pay was added at `/acme-pay`, with a chooser on the root.

| Found                                                                                     | Fix                                                                                                                                                                                                                                                                                               |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| After joining PlayFlight's Docker network, its root page was sometimes served by ACME Pay | Docker adds each service name as a DNS alias, so `web` resolved to both apps and Caddy round-robined between them. I detached immediately, then renamed the services to `acme-db` / `acme-api` / `acme-web` and confirmed with `getent hosts web` on that network.                                |
| Caddyfile edits had no effect                                                             | PlayFlight's deploy uses `rsync`, which swaps the file's inode, while the Caddy container still held the old single-file bind mount. The edits were loaded without downtime via `docker cp` + `caddy reload`, after checking the running config equalled the host file apart from the new routes. |
| `/acme-pay` "worked" on the first try                                                     | It only worked through the alias clash above. Every check was then repeated 6× to rule out round-robin luck.                                                                                                                                                                                      |

## What I kept for myself

- Product scope and the "left out" list in the requirements.
- The visual direction choice and the "more animated" steer.
- The stack, the deployment target, and the testing philosophy (meaningful tests over coverage).

## Tools

- **Claude Code** (Claude Opus): planning, implementation, running tests and builds, screenshots through headless Edge, commits.
- **impeccable:** `init` (product brief), `concept-seed` + decision page (style directions), live mode (prototype iteration), `detect` (design anti-pattern checks), `DESIGN.md` format.
- **ui-ux-pro-max:** design-system query for an HR compensation dashboard (style, density, palette baseline), typography search, chart-type search (box plot for distributions).
