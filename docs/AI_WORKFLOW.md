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

## What I kept for myself

- Product scope and the "left out" list in the requirements.
- The visual direction choice and the "more animated" steer.
- The stack, the deployment target, and the testing philosophy (meaningful tests over coverage).

## Tools

- **Claude Code** (Claude Opus): planning, implementation, running tests and builds, screenshots through headless Edge, commits.
- **impeccable:** `init` (product brief), `concept-seed` + decision page (style directions), live mode (prototype iteration), `detect` (design anti-pattern checks), `DESIGN.md` format.
- **ui-ux-pro-max:** design-system query for an HR compensation dashboard (style, density, palette baseline), typography search, chart-type search (box plot for distributions).
