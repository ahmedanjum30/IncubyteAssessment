---
version: 1
slug: "design-prototype-index-html"
primary_target: "design/prototype/index.html"
related_targets: []
---

# Surface: ACME Pay overview (prototype)

Scope: the HR Manager's overview screen: filter by department, read pay distribution by country, act on employees below band. Mode: Operate.

## Direction contract

THESIS: The org's pay printed as one plate in a design annual: a near-white sheet, hairline-ruled, where distributions are the illustrations. Refuses the blue KPI-card dashboard.

OWN-WORLD: Sheet #F5F4F6 drifting warm (#FAF6F5) and green (#EEF3EF) at the corners, ink #16181A, hairlines #C9C7C4, one periwinkle (#4B4FA8 on #DCDDF3) reserved for "needs attention". Geist for everything, Geist Mono uppercase 11px at 0.14em for labels. Zero radius, filled ink primary, outline secondary, crosshair register marks on plate corners.

STORY: The HR Manager sees how a department is paid across twelve countries, spots where pay sits below band, and opens those employees.

FIRST VIEWPORT: 64px sticky mono token bar (nav + department tokens). Display headline 54px left, actions right. Hairline stats row (4 cells). Two plates: box plots by country (5 cols) and the below-band table (7 cols).

FORM: challenger design-annual-s-plate-section, chosen by the user over the assigned Thematic Atlas. seed:c3181e4dd46c29e2. Signature move: the plate prints itself: crosshairs slide into register and box plots draw from the median outward; on filter change they morph to new values.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
