# Ternary Cargo — Design critique & product direction (v1 → v2)
Owner: Brand & Design Lead · 31 Oct 2026 · Status: ready for build. British spelling throughout.

Sources reviewed: `/workspace/cargo/screens/*.png` (37 screens), `prototype/tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`, `components/ui/index.tsx`, `components/shell.tsx`, `components/load3d.tsx`, `components/pages/*`.

---
## 1. Top 10 fixes (ranked by impact)

1. **No design tokens; dark mode is a CSS override hack** — `app/globals.css`, `tailwind.config.ts`.
   Problem: colours are hard-coded (`bg-indigo-600`, `slate-*`), and dark mode works by `!important` overrides of `.bg-white`, `.text-slate-700` etc. Any new class breaks dark mode; brand change means a find-and-replace.
   Fix: adopt shadcn CSS variables (§2.2 snippet), map Tailwind `colors` to `hsl(var(--token))`, replace `bg-white`→`bg-card`, `text-slate-500`→`text-muted-foreground`, `border-slate-200`→`border-border`, `bg-indigo-600`→`bg-primary`. Delete every `.dark .xxx{…!important}` rule.

2. **Data integrity shown wrongly on Unloading & tally** — `28-unloading-in-progress.png`, `components/pages/wh.tsx`.
   Problem: PKG-007 actual 21.9 kg vs 24.5 declared (−10.6%) is chipped **Good**; Exceptions KPI says **0**; "Weighed 196.2 kg / declared 340.0" compares a partial tally to a full total. The UI is telling the clerk everything is fine when it isn't.
   Fix: per-row variance column (`−2.6 kg · −10.6%`) with tolerance rule (±2%) → `Variance` warning chip + row tint `bg-warning/5`; Exceptions KPI counts it; Weighed shows `196.2 / 171.5 kg expected for 7 tallied` with a progress bar. Pending rows dimmed `text-muted-foreground`, "—" not mixed with blanks.

3. **Verification lets you sign off over an open discrepancy** — `30-verification-discrepancy.png`.
   Problem: big green "Sign off verification" is primary while a Discrepancy is open; photo slots are coloured placeholder blocks.
   Fix: button label becomes "Sign off with exception" (`variant="outline"` + warning icon) until liability and photos are complete; require supervisor confirmation dialog (`AlertDialog`). Photo tiles: dashed `border-dashed border-border bg-muted` with "Add photo" + count, thumbnails once uploaded.

4. **Status chips are inconsistent and wrap** — shipments list (`12`), dashboard (`03`), `Badge` in `ui/index.tsx`.
   Problem: "Customs hold" wraps onto two lines; tones are ad-hoc (`blue/violet/amber`) with no icon so colour alone carries meaning (fails WCAG 1.4.1); same state differs between screens.
   Fix: single `<StatusChip state="customs_hold" />` driven by the map in §2.5: `whitespace-nowrap`, icon + label, dot variant for dense tables.

5. **Shipments table wraps IDs, dates and routes; wastes width** — `12-shipments-list.png`.
   Problem: `TC-SEA-24118`, `02 Nov 2026`, `Sea FCL` break across two lines, doubling row height; no sorting, selection, column filters, pagination, or row count; filter pills don't show counts.
   Fix: §2.7 data-table pattern (TanStack Table + shadcn `Table`): `whitespace-nowrap` on ID/date/mode columns, mono IDs, `ETA` as `02 Nov` with year only if ≠ current, sticky header, checkbox select + bulk bar, column visibility, faceted filters (Mode, Status, Carrier, ETA range), saved views, 25/50/100 pagination. Pills become `ToggleGroup` with counts: `Sea FCL 42`.

6. **Brand doesn't connect to Ternary** — sidebar logo in `shell.tsx` (indigo→violet gradient "T"), Geist fonts loaded in `app/fonts/` but body uses Inter fallback, primary is Tailwind `indigo-600` (#4F46E5) — not Ternary indigo.
   Fix: Pulli Grid mark (`/workspace/brand/logo/ternary-mark-reversed.svg` on dark rail; favicon `ternary-favicon-colour*.svg`) + wordmark "Ternary **Cargo**"; load Inter + IBM Plex Sans + JetBrains Mono via `next/font/google`; remove Geist; apply §2.2 tokens.

7. **Dashboard has no operational "now"** — `03-dashboard.png`.
   Problem: chart of shipments by week dominates the fold; KPIs lack trend/target context and aren't clickable; "Needs attention" chips misuse ref colours (red ref ≠ severity); no map/lanes, no SLA ageing.
   Fix: layout in §2.9 — clickable KPI cards with delta + sparkline, Exceptions panel sorted by severity × age, Lanes/map, live Activity feed; chart moves below and uses brand palette (sea=indigo, air=teal, road=saffron).

8. **Wizard and forms feel empty and unguided** — `13–17` wizard, `16-wizard-3-cargo.png`.
   Problem: cargo step is read-only table with no inline add/edit, no validation, half the viewport empty; stepper pills look like chips; totals cards repeat the table.
   Fix: editable rows (inline inputs, `+ Add line`, HS-code combobox with description), right-hand sticky **Summary** panel (`lg:grid-cols-[1fr_320px]`) showing totals, chargeable weight, W/M and estimated charges; stepper as numbered line with state (done/current/todo) and clickable completed steps; `Continue` disabled with reason tooltip.

9. **Tracking route map is a toy** — `26-tracking.png`.
   Problem: flat light-blue box with a dashed arc; Colombo/Singapore positions geographically wrong; no current position/ETA confidence; completed vs planned milestones barely distinguishable.
   Fix: MapLibre GL with a muted basemap (§2.9 map styling), great-circle lane, vessel marker, ETA chip with confidence ("ETA 31 Oct 14:00 · high"); milestone timeline with solid line done / dashed planned, timestamps in `tabular-nums`, current step highlighted `ring-primary`, delays in warning colour with "+6 h".

10. **Accessibility & feedback gaps across the shell** — `shell.tsx`, `ui/index.tsx`.
   Problem: grey 11–12 px sidebar group labels and `text-slate-500` secondary text on `#f6f7f9` sit near/below 4.5:1; Field inputs have `focus:outline-none` with only a border colour change; no loading skeletons, no empty states (e.g. shipments list ends in a blank half-screen), Drawer lacks focus trap; avatar "NP" vs greeting "Nimal" mismatch.
   Fix: `focus-visible:ring-2 ring-ring ring-offset-2` on every interactive element; muted text ≥ 4.5:1 (tokens in §2.2 are checked); use shadcn `Sheet`/`Dialog` (Radix focus trap); `Skeleton` rows while loading; §2.8 empty states; fix user identity data.

Also noted (quick wins): login (`01`) and tenant select (`02`) should show the Pulli Grid mark and tenant logos; master-data tables should share the same table component; documents (`21–24`) keep the white `doc-paper` in dark mode (good — keep).

---
## 2. Product design direction

### 2.1 Sub-brand: "Ternary Cargo"
- **Relationship:** endorsed product brand. Lockup: Pulli Grid mark + "Ternary" (IBM Plex Sans 600) + "Cargo" (IBM Plex Sans 400, teal). Product never replaces the mark; it owns an accent.
- **Product personality:** calm control room — precise, quiet, trustworthy. Colour is reserved for state and action; chrome stays neutral.
- **Product accent:** Ternary **teal #0F7C7A** is the product primary (moves goods = "Deliver" pillar); Ternary **indigo #1F2A5C / navy #0E1630** form the rail and dark surfaces; **saffron #E39B2D** is the highlight/attention accent (never for errors). Light teal #4DB6AC is the dark-mode primary.
- **Mark in product:** 3×3 dots reused as a motif — loading spinner (dots light up in kolam order), empty-state illustrations, tenant avatar fallback.

### 2.2 Tokens (shadcn CSS variables, HSL) — drop into `app/globals.css`
```css
@layer base {
  :root {
    --background: 220 20% 98%;        /* #F8F9FB */
    --foreground: 226 55% 12%;        /* navy #0E1630 */
    --card: 0 0% 100%;
    --card-foreground: 226 55% 12%;
    --popover: 0 0% 100%;
    --popover-foreground: 226 55% 12%;
    --primary: 179 78% 27%;           /* teal #0F7C7A */
    --primary-foreground: 0 0% 100%;
    --secondary: 229 30% 95%;
    --secondary-foreground: 229 50% 24%; /* indigo #1F2A5C */
    --muted: 220 16% 95%;
    --muted-foreground: 222 14% 40%;  /* ≥4.5:1 on card + background */
    --accent: 179 40% 94%;
    --accent-foreground: 179 78% 20%;
    --highlight: 36 77% 53%;          /* saffron #E39B2D */
    --highlight-foreground: 226 55% 12%;
    --destructive: 0 72% 45%;
    --destructive-foreground: 0 0% 100%;
    --border: 220 14% 89%;
    --input: 220 14% 84%;
    --ring: 179 78% 32%;
    --radius: 0.5rem;
    /* sidebar / rail */
    --sidebar: 229 50% 24%;           /* indigo */
    --sidebar-foreground: 225 30% 86%;
    --sidebar-active: 179 78% 27%;
    /* semantic */
    --success: 152 62% 32%;  --success-foreground: 0 0% 100%;
    --warning: 36 85% 42%;   --warning-foreground: 0 0% 100%;   /* darker saffron for text contrast */
    --info: 211 70% 42%;     --info-foreground: 0 0% 100%;
    --danger: 0 72% 45%;     --danger-foreground: 0 0% 100%;
    --neutral: 220 10% 46%;
    /* modes */
    --mode-sea: 229 50% 36%; --mode-air: 179 78% 32%; --mode-road: 36 77% 48%; --mode-courier: 266 40% 50%;
    /* charts */
    --chart-1: 229 50% 36%; --chart-2: 179 78% 32%; --chart-3: 36 77% 53%; --chart-4: 174 42% 51%; --chart-5: 222 14% 60%;
  }
  .dark {
    --background: 226 55% 8%;         /* deeper than navy */
    --foreground: 220 25% 92%;
    --card: 226 50% 11%;              /* ≈ navy #0E1630 */
    --card-foreground: 220 25% 92%;
    --popover: 226 48% 13%;
    --popover-foreground: 220 25% 92%;
    --primary: 174 42% 51%;           /* light teal #4DB6AC */
    --primary-foreground: 226 55% 10%;
    --secondary: 228 35% 18%;
    --secondary-foreground: 220 25% 90%;
    --muted: 228 32% 16%;
    --muted-foreground: 222 16% 66%;
    --accent: 179 40% 16%;
    --accent-foreground: 174 50% 75%;
    --highlight: 36 80% 60%;
    --highlight-foreground: 226 55% 10%;
    --destructive: 0 70% 60%;
    --destructive-foreground: 226 55% 10%;
    --border: 228 30% 20%;
    --input: 228 30% 24%;
    --ring: 174 42% 55%;
    --sidebar: 226 55% 7%;
    --sidebar-foreground: 222 16% 72%;
    --sidebar-active: 174 42% 51%;
    --success: 152 50% 52%;  --warning: 38 85% 60%;  --info: 211 80% 66%;  --danger: 0 75% 66%;  --neutral: 222 12% 62%;
    --mode-sea: 229 60% 70%; --mode-air: 174 42% 55%; --mode-road: 36 80% 60%; --mode-courier: 266 50% 72%;
  }
  body { @apply bg-background text-foreground antialiased; font-feature-settings: "cv11", "ss01"; }
}
```
`tailwind.config.ts`:
```ts
const c = (v: string) => `hsl(var(--${v}) / <alpha-value>)`;
theme: { extend: {
  colors: {
    border: c("border"), input: c("input"), ring: c("ring"), background: c("background"), foreground: c("foreground"),
    primary: { DEFAULT: c("primary"), foreground: c("primary-foreground") },
    secondary: { DEFAULT: c("secondary"), foreground: c("secondary-foreground") },
    muted: { DEFAULT: c("muted"), foreground: c("muted-foreground") },
    accent: { DEFAULT: c("accent"), foreground: c("accent-foreground") },
    highlight: { DEFAULT: c("highlight"), foreground: c("highlight-foreground") },
    destructive: { DEFAULT: c("destructive"), foreground: c("destructive-foreground") },
    card: { DEFAULT: c("card"), foreground: c("card-foreground") },
    popover: { DEFAULT: c("popover"), foreground: c("popover-foreground") },
    sidebar: { DEFAULT: c("sidebar"), foreground: c("sidebar-foreground"), active: c("sidebar-active") },
    success: c("success"), warning: c("warning"), info: c("info"), danger: c("danger"), neutral: c("neutral"),
    mode: { sea: c("mode-sea"), air: c("mode-air"), road: c("mode-road"), courier: c("mode-courier") },
  },
  borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
  fontFamily: { sans: ["var(--font-inter)", "system-ui"], display: ["var(--font-plex)", "var(--font-inter)"], mono: ["var(--font-mono)", "ui-monospace"] },
}}
```
`app/layout.tsx`: `Inter` (`variable: "--font-inter"`), `IBM_Plex_Sans` (weights 500/600, `--font-plex`), `JetBrains_Mono` (400/500, `--font-mono`) from `next/font/google`; `<html className={…}>`; manage dark with `next-themes` (`attribute="class"`, system default).

### 2.3 Type scale
| Role | Font | Size / line | Weight | Use |
|---|---|---|---|---|
| Display | IBM Plex Sans | 28/36 | 600 | Login, empty-state hero only |
| Page title | IBM Plex Sans | 22/28 | 600 | `h1` per page |
| Section | Inter | 16/24 | 600 | Card titles |
| Body | Inter | 14/20 | 400 | Default UI |
| Table | Inter | 13/18 | 400 (500 for primary col) | Data tables (compact) |
| Label / caps | Inter | 11/16, `tracking-wide uppercase` | 500 | Table headers, KPI labels (use sparingly) |
| KPI number | Inter | 28/32 | 600, `tabular-nums` | Stat cards |
| ID / code | JetBrains Mono | 12.5/18 | 500 | Refs, BL/AWB, container no., HS, SSCC, seal |
Rules: all numbers, weights, money and dates get `tabular-nums`; numeric columns right-aligned; units in muted text (`340.0 <span class="text-muted-foreground">kg</span>`); dates `31 Oct 2026`, times 24 h `14:35`, money `LKR 38.4M` with full value in tooltip. Container numbers formatted `MSKU 774120 3` (owner · serial · check digit).

### 2.4 Density & spacing
- 4 px base. Page padding `px-6 py-6` (≥1280: `px-8`); card padding `p-5`; card gap `gap-4`; section gap `space-y-6`.
- Two densities, user toggle in Settings + table toolbar: **Comfortable** row 44 px (`py-3`), **Compact** row 36 px (`py-2`, 13 px text) — default Compact for warehouse/ops tables, Comfortable for finance/settings.
- Controls: height 36 px (`h-9`), small 32 px; touch screens (Mobile scan) 44 px minimum.
- Max content width none for tables; forms max `max-w-3xl` with sticky summary aside.
- Radius 8 px cards/inputs, 6 px chips/buttons inside tables; shadow only on overlays (`shadow-lg`) — cards use border only (`border bg-card`).

### 2.5 Shipment states → status chip
Chip anatomy: `inline-flex h-6 items-center gap-1.5 rounded-md px-2 text-xs font-medium whitespace-nowrap ring-1 ring-inset` + 14 px lucide icon; tone classes `bg-{tone}/10 text-{tone} ring-{tone}/25`. Dense variant: 8 px dot + label, no fill. Tooltip shows timestamp and actor.
| State | Tone | Icon (lucide) |
|---|---|---|
| Draft | neutral | `FilePen` |
| Quoted | neutral | `Calculator` |
| Booked | info | `CalendarCheck` |
| Received at origin / Stuffed | info | `PackageCheck` |
| Sailed / Departed | primary (teal) | `Ship` / `Plane` / `Truck` by mode |
| In transit | primary | `Navigation` |
| Transhipment | primary | `Repeat` |
| Arrived | info | `Anchor` (sea) / `PlaneLanding` |
| Customs hold | warning | `ShieldAlert` |
| Customs cleared | success | `ShieldCheck` |
| Devanning / Tallying | highlight (saffron) | `PackageOpen` |
| Discrepancy / Damage | danger | `TriangleAlert` |
| Verified | success | `ClipboardCheck` |
| Ready for release / DO issued | success | `FileCheck` |
| Out for delivery | primary | `Truck` |
| Delivered | success (solid fill `bg-success text-success-foreground`) | `CircleCheck` |
| Delayed (modifier) | warning outline + "+6 h" | `Clock` |
| On credit hold (finance) | warning | `Lock` |
| Cancelled | neutral, strike label | `CircleSlash` |
Severity order for sorting/attention: danger > warning > highlight > info > primary > success > neutral. Mode badges use `mode-*` tokens with icon only + label (`Ship Sea FCL`) — never the same colours as states.

### 2.6 Iconography
lucide-react, 16 px in UI, 1.75 stroke, `text-muted-foreground` unless stateful. No emoji, no gradients.

### 2.7 Data-table pattern
- Built on TanStack Table + shadcn `Table`; one `<DataTable>` used by shipments, master data, tally, billing.
- **Toolbar:** search (debounced, searches ref/BL/AWB/container), faceted filter buttons with counts, saved views dropdown ("My arrivals today"), density toggle, column visibility, export CSV.
- **Header:** sticky `top-0 bg-card/95 backdrop-blur`, 11 px caps muted, sort arrows on hover, resizable columns.
- **Rows:** first column = mono ID link (`font-mono text-primary hover:underline`), secondary line in muted 12 px for context (e.g. shipper under consignee) instead of wrapping; numeric right-aligned `tabular-nums`; status chip column fixed width 140 px; row hover `bg-muted/50`; selected `bg-accent`; exception rows have 2 px left border `border-l-danger`/`warning`.
- **Selection:** checkbox column; bulk action bar slides up (`fixed bottom-6` pill) — "3 selected · Print labels · Assign · Export".
- **Row actions:** kebab menu at end + click row opens right `Sheet` preview (keeps list context); `Enter` opens full page; `j/k` keyboard navigation.
- **Footer:** "1–25 of 148", page size, pagination. Skeleton rows (8) while loading; inline error row with Retry.
- Never wrap: IDs, dates, chips, mode. Truncate long names with tooltip (`truncate max-w-[220px]`).

### 2.8 Empty states
Three kinds, same component `<EmptyState icon title body action secondaryAction />`, centred in card, `py-16`, illustration = Pulli Grid 3×3 dots (muted, one dot in teal):
- **First use:** "No shipments yet" · "Create your first shipment or import from a quotation." · [New shipment] [Import CSV].
- **No results:** "No shipments match these filters" · show active filters as removable chips · [Clear filters].
- **All clear (positive):** Exceptions "Nothing needs attention — 0 holds, 0 discrepancies" with success tint; this is a reward state, not a blank.
- **Error:** "Couldn't load shipments" + [Retry] + support ref.
Tables with few rows should not leave a blank half-screen: shrink card to content and show "That's all 7 shipments" footer.

### 2.9 Dashboard layout (1440 desktop; 12-col grid, `gap-4`)
1. **Header row:** greeting + tenant + date; right: date-range segmented control (Today / 7 d / 30 d), [New shipment] primary, [⌘K] hint.
2. **KPI strip (5 cards, clickable to filtered list):** Active shipments · Arriving today (sea/air split) · Customs holds (avg age) · Pending verification · Revenue MTD (vs target bar). Each: label, big tabular number, delta chip (▲ 12 vs last wk, green/red by meaning not direction), 30-day sparkline in `chart-*`.
3. **Row 2:** **Exceptions** (col-span-5) — list sorted severity × age, each row: chip, ref (mono), one-line reason, age ("18 h"), owner avatar, quick action (Resolve / Assign). **Lanes map** (col-span-7) — MapLibre, muted basemap (land `muted`, water `background`, no labels below zoom 4), lanes as arcs width = volume, colour by mode token, dots for live vessels/flights, Colombo hub highlighted saffron; toggle "Map | Lanes table" (top lanes with volume, on-time %, avg transit).
4. **Row 3:** **Today's operations timeline** (col-span-8) — arrivals/devanning/deliveries on an hour axis (warehouse bays as rows). **Activity feed** (col-span-4) — real-time events (avatar, verb, object link, relative time), filter by "Mine".
5. **Row 4:** Volume by week chart (stacked, mode colours) + On-time performance by carrier.
Mobile/tablet: KPIs become horizontal scroll; Exceptions first; map collapses to lanes table.

### 2.10 Dark mode
- Token-driven only (no overrides). Surfaces stack: background 8% L → card 11% → popover 13% → hover +3%. Borders, not shadows, separate surfaces.
- Primary switches to light teal; chips use `/15` fills and lighter tone text so contrast ≥ 4.5:1.
- Documents/print previews stay on white paper (`.doc-paper` keeps light tokens via `className="light"` scope).
- Map: dark basemap variant; 3D: dark backdrop (§2.11). Charts: raise lightness of series ~15%.
- Default follows system; toggle in user menu; persist per user.

### 2.11 3D container / load-plan view (`components/load3d.tsx`)
- **Layout:** 3D canvas (left, flex-1) + right panel 320 px: summary (utilisation % volume, payload kg / max, CoG offset), legend, selected item details. Toolbar top-left: view presets **Iso · Side · Top · Rear (door)**, colour-by toggle, explode/step slider, screenshot, fullscreen.
- **Camera:** perspective fov 35° (less distortion than 45), default isometric from rear-right door side at ~30° elevation; `OrbitControls` with damping, polar angle clamped (no going under the floor), min/max distance; smooth animated transitions between presets (`CameraControls` from drei). Door end always marked ("DOOR" label + small door outline).
- **Container shell:** ISO dims to scale (20′/40′/40′HC/ULD contours). Corrugated walls as transparent `meshPhysicalMaterial` (opacity 0.06, slight teal tint) with 1 px edges `#64748B` (dark: `#334155`); floor wood tone muted `hsl(30 20% 70%)`; front wall subtly opaquer for depth. No gradient sky — flat `--muted` (light) / `--background` (dark).
- **Cargo boxes:** `meshStandardMaterial` roughness 0.8, metalness 0; 2% gap between boxes; thin darker edges (`Edges` at 30% black). Labels (SKU / consignment) via `Html` only on hover/selection to avoid clutter.
- **Colour by (toggle):**
  - *Consignment / customer* — categorical palette of 8 brand-derived hues: indigo, teal, saffron, light teal, slate-blue `#5B6CB2`, terracotta `#C0623B`, olive `#7C8A3A`, plum `#7A4F8C`; beyond 8 repeat with hatch pattern.
  - *Weight* — sequential single-hue ramp light teal → indigo (light `#CDEBE7` → `#1F2A5C`), legend shows kg bands; overweight-per-floor-area flagged saffron outline.
  - *Load sequence / drop* — stop 1 (door, unload first) teal → last stop indigo.
  - *Fragility/stackability* — non-stackable boxes get a saffron top face.
- **Hover:** box lifts 1 cm visually (emissive +0.15), cursor pointer, tooltip: package ID (mono), SKU, consignment, dims, kg, stack layer.
- **Selection:** click → outline (drei `Outlines`/postprocessing outline, primary colour 2 px), others fade to 25% opacity; right panel shows details + "Show all of this consignment" (select group). Selection synced with packing-list table row (bidirectional).
- **Legend:** right panel list: swatch, name, count, kg, % of volume; click toggles visibility; eye icon. Always present — colour is never the only key (selection also shows text).
- **Feedback:** utilisation bar, CoG marker (crosshair on floor; warning if offset > 10% of length), max payload warning, unplaced items list in danger tone.
- **Performance:** `InstancedMesh` per colour group (>200 boxes), `frameloop="demand"`, `dpr={[1, 2]}`, shadows off by default (contact shadow only), `PerformanceMonitor` drops to dpr 1 and disables edges on low FPS. Lazy-load the canvas (`next/dynamic`, `ssr:false`) with Pulli Grid dot-spinner skeleton. **Fallback** (no WebGL / `prefers-reduced-motion` / low-end): 2D SVG orthographic **top + side** views with same colours and legend, plus the layer-by-layer table — fully functional, printable for the loading crew.
- **Accessibility:** keyboard: Tab cycles boxes in load order, arrow keys orbit, `1–4` presets; screen-reader summary "40′HC, 18 of 20 packages placed, 82% volume, 14.2 t".

### 2.12 Motion & micro-interactions
150 ms ease-out for hover/press, 200 ms for sheets; toasts bottom-right (sonner) with Undo for destructive actions; optimistic updates on status changes; respect `prefers-reduced-motion`.

### 2.13 Implementation order (for dev team)
1. Tokens + fonts + next-themes (fixes #1, #6) → 2. `StatusChip`, `DataTable`, `EmptyState`, `Stat` rebuilt on tokens (#4, #5, #10) → 3. Tally/verification logic display (#2, #3) → 4. Dashboard (#7) → 5. Wizard summary (#8) → 6. Map (#9) → 7. 3D refresh (§2.11).
Install: `npx shadcn@latest add table badge button card sheet dialog alert-dialog dropdown-menu toggle-group tooltip skeleton command input select checkbox progress tabs sonner`; `npm i @tanstack/react-table next-themes maplibre-gl`.
