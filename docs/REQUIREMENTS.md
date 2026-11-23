# Requirements: ACME Pay

## Goal

Replace the spreadsheets ACME's HR team uses for salary data with a web app. The HR Manager should be able to keep salary records for ~10,000 employees in 12 countries accurate, and answer "how do we pay people?" without exporting to Excel.

**Success looks like:**
- Finding any employee takes seconds.
- A salary change is safe, validated and traceable.
- The common pay questions are answered on screen.

## User

There is one persona: the **HR Manager**. They work at a desktop in long sessions and sometimes check something on a phone. They are comfortable with spreadsheets but should not need SQL or pivot tables.

## Scope and features

### 1. Employee records
- List all employees with server-side search (by name, email or employee code), filters (country, department, job title, band status), sorting and pagination.
- Add, view, edit and delete employees. Validation covers required fields, a positive salary and a unique email.
- Each salary is stored in its **local currency**, and the USD equivalent is always shown next to it for comparison.

### 2. Salary history
- Every salary change is recorded with the old value, the new value, the date and an optional reason. Nothing is silently overwritten.

### 3. Pay insights (the questions HR actually asks)
- **"What does a department pay in each country?"** Distribution per country: 10th, 25th, 50th, 75th and 90th percentiles, in USD.
- **"Who is paid below their band?"** Employees below the minimum of the pay band for their country, department and level, sorted by the size of the gap.
- **"What do we pay for this role?"** Per job title: headcount and minimum, median, average and maximum salary, filterable by country.
- **Headline figures** for any filter: headcount, median salary and number below band.

### 4. Platform
- NestJS API, Next.js UI and PostgreSQL, all Dockerized for a free-tier Oracle Cloud VM.
- A deterministic seed script creates 10,000 employees.
- WCAG 2.2 AA, usable at phone widths.

## Deliberately left out, and why

| Left out | Reasoning |
| --- | --- |
| **Authentication and roles** | There is one persona, and the brief doesn't ask for it. It belongs behind SSO in a real deployment (Cloudflare Access fits the architecture with no code changes). Building a login screen would cost time without testing anything the brief cares about. |
| **Payroll, tax, bonuses, equity** | This is salary *management*, not payroll. Base salary is what HR compares, and each of these is a product in its own right. |
| **Live FX rates** | FX rates are a fixed, dated table so that numbers are reproducible and tests are deterministic. A daily rate job is a small later step. |
| **Bulk CSV import/export UI** | It would help with migrating off Excel, but the seed proves the data model. Export is the first item to add next. |
| **Approval workflows** | Salary changes are recorded in the history but don't need sign-off. Approvals need multiple users, which we don't have. |
| **Org chart and manager hierarchy** | Not needed to answer pay questions. |
| **Gender and diversity pay-gap analysis** | This matters, but it needs sensitive personal data and careful legal framing. Inventing that data for a demo would be misleading. The insight engine is built so a new grouping dimension can be added cheaply. |

## Assumptions (we would confirm these with the client)
- Each country has one currency.
- Salaries are annual base pay.
- Pay bands are set per country, department and level (L1 to L6).
- ~10,000 employees is the expected scale for the next few years, so a single PostgreSQL instance is enough.
- No real personal data is used; everything in the seed is synthetic.
