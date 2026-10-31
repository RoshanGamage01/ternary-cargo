# Ternary Cargo v3: UX research and design direction

31 Oct 2026. This responds to Roshan's v2 review: "old fashioned, hard to understand for someone who knows little about IT or cargo; too little control over the data; visuals should be more balanced." I only cite sources that I opened or that search returned this session. Interpretations are marked **→ for us**.

## 1. What the reference products do

### Flexport (logistics, the closest analogue)
- **The shipment page is built around a vertical timeline.** "A new vertical timeline runs down the center, and it's the first thing you see… Every stop along the route shows up in order. Estimates become actual dates as they happen. Expand any leg for the vessel…" Customs has its own milestones. The header gives a **plain-language status** ("in transit to arrival port") and a predicted delivery date that "counts down the days". The page adapts to the mode, so the customs section is hidden when Flexport is not clearing customs. https://www.flexport.com/videos/shipment-details/
- **There is one inbox of tasks** on the right: "open tasks pinned to the top with a due date", then messages, then a searchable event history. https://www.flexport.com/videos/shipment-details/ and https://www.flexport.com/products/flexport-platform/
- **The dashboard is a set of modules, plus a to-do checklist and a watchlist.** "Complete your most important to-do's from a centralized, digital checklist… prioritized by urgency." Flexport reports that test users "spent 30–40% less time" finding insights. https://www.flexport.com/blog/introducing-the-flexport-platform-experience-2-0-your-launchpad-for-greater/
- **Personal dashboards.** Widgets are drag-and-drop and the dashboard comes "pre-configured to the specific needs of logistics managers". https://www.flexport.com/blog/platform-updates-put-more-control-in-users-hands-and-create-a-personalized/
- **Research behind the design.** After more than 85 client interviews, Flexport found that users skipped the dashboard and went straight to the filtered list. Modules should show "urgency and responsibility", meaning who has to act. https://medium.com/flexport-ux/the-flexport-dashboard-2-0-2524f8e92245
- **→ for us:** use a journey timeline as the hero of every shipment and order. Write statuses as sentences. Show a single "what you need to do" inbox. Let users customise their home and pin records to a watchlist.

### Freightos (quoting for novices)
- **Three steps:** enter shipment details, compare instant all-in quotes (price, transit time, provider reviews), then book online. https://www.freightos.com/marketplace/ and https://www.freightos.com/freight-resources/what-is-freightos/
- **→ for us:** "Get a price" should be a three-question start that returns comparable cards, not a form with 20 fields.

### Linear (power without clutter)
- **Filters** live in a menu (shortcut `F`), support AND/OR groups and are mirrored in the URL so a view can be shared. https://linear.app/docs/filters
- **Saved views.** Any filtered list can be saved as a custom view, then shared or favourited. https://linear.app/docs/custom-views
- **Display options are separate from filters.** You choose grouping, ordering, and which properties are shown, and you can switch between list and board (`Ctrl+B`). https://linear.app/docs/display-options and https://linear.app/docs/board-layout
- **→ for us:** the list header gets three controls: View (saved), Filter, Display. Offer a board layout grouped by stage, which reads better than a table for novices.

### Shopify Admin / Polaris (lists, bulk actions, empty states)
- **Saved views as tabs.** "Each tab represents a subset of the list… saved with a unique name". Promote "no more than 2 or 3" filters. https://polaris-react.shopify.com/components/selection-and-input/index-filters
- **Bulk actions** suit "tasks that are often applied to many list items at once". Clicking a row should open its detail. Paginate lists longer than 50 items. https://polaris-react.shopify.com/components/tables/index-table?example=index-table-with-bulk-actions
- **Empty states** should say why the page is empty and what will appear there, and give one primary action labelled verb + noun ("Create order"). https://polaris-react.shopify.com/components/layout-and-structure/empty-state
- **Saved views** should persist stable query values, not rendered labels. https://shopify.dev/docs/apps/build/app-home/migrate-from-polaris-react/index-filters

### Stripe Dashboard (records you can trust)
- **Event log.** Every API or Dashboard change logs an event that you can filter by type. https://docs.stripe.com/development/dashboard/events
- **Custom fields.** Metadata holds up to 50 key–value pairs per object, and users are warned not to store sensitive data in it. https://docs.stripe.com/metadata
- **Editing.** On the customer detail page you edit through "Actions → Edit information", and the page also lists related subscriptions, invoices and quotes. https://docs.stripe.com/billing/customer
- **→ for us:** add custom fields per record type (key–value, with limits), make every change an event ("changed ETA 12 Nov → 14 Nov, reason: carrier advised"), and show related records on the detail sheet.

### Notion (flexible data for non-technical people)
- **Views.** Each database view has its own layout, visible properties, filters, sorts and groups, and changes can be saved for everyone. https://www.notion.com/help/views-filters-and-sorts
- **Typed properties:** text, number, select, status, date, person, checkbox, relation and more. https://www.notion.com/help/database-properties
- **→ for us:** custom fields are typed (text, number, date, select, yes/no), and users add them without IT help.

### Arc browser (calm chrome)
- **Content-first layout.** There is no toolbar. Tabs, search and tools sit in a collapsible left sidebar. Spaces separate contexts with their own colours. https://blog.logrocket.com/ux-design/ux-analysis-arc-opera-edge/ and https://www.theverge.com/23462235/arc-web-browser-review
- **Note:** Arc is being sunset, and its ideas carry on in Dia. https://arc.net/
- **→ for us:** use a quiet, light sidebar that collapses, show the workspace as a coloured "space", and let content take the width.

## 2. Patterns for novices

| Pattern | Evidence | How v3 applies it |
|---|---|---|
| **Progressive disclosure** | Show "a few of the most important options", reveal more on request, label the link clearly. This improves learnability, efficiency and error rate. https://www.nngroup.com/articles/progressive-disclosure/ | Each form shows its essential fields, with **"More details (optional)"** to reveal the rest. Advanced settings sit behind a labelled reveal. |
| **Training wheels** | In Carroll's studies, novices limited to core features were 21–26% faster at first and later 52% faster on advanced tasks. https://www.nngroup.com/articles/training-wheels-user-interface/ | A **Simple / Expert mode** toggle. Simple mode hides advanced columns and settings but drops no features. |
| **Plain language** | Use short, active sentences and words users recognise. Explain specialist terms the first time they appear. https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/clear-language/ | Labels become plain ("Bill of lading" → "Shipping receipt (Bill of lading)"). A glossary covers about 40 terms. |
| **Tooltips for jargon** | Keep them short and supplementary, never for essential instructions. They must work on hover and keyboard focus and close with Esc. https://www.nngroup.com/articles/tooltip-guidelines/ and https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/ | A dotted-underline `<Term>` with an accessible tooltip and a link to the glossary. Essential guidance stays visible as hint text. |
| **Side sheets keep context** | Overlays suit details because they keep "visibility of the underlying information". https://www.nngroup.com/articles/bottom-sheet/ | Clicking a row opens a right-hand **detail sheet** (bottom sheet on mobile) with edit, notes, files and history. |
| **Task-first home** | Flexport's checklist and inbox ranked by urgency (above). | Home asks **"What do you want to do?"** and shows a "Needs you today" list. |
| **Journey visual** | Flexport's vertical timeline (above). | A horizontal stepper in lists and cards, and a vertical timeline on detail pages, each with a next-best-action button. |
| **Empty states that teach** | Polaris empty state guidance (above). | Every feature has an empty state with a 3-step "how it works" and one primary action. |

## 3. Data control (answering "too little control, few inputs")
- **Full edit forms** for every record. Essentials come first, then "More details". Shipments, for example, gain incoterm, cargo-ready date, HS codes, references, temperature, insurance, priority, assignee and tags.
- **Inline edit** in the grid: double-click or Enter edits a cell, and every change is logged.
- **Bulk actions:** select rows, then change status, assign, add tag, export or delete, with undo through the toast.
- **Saved views and filters** as Polaris-style tabs (stored locally, as noted in §1 Shopify), with column show/hide and density.
- **Custom fields** that are typed and defined per entity in Settings, then editable on every record.
- **Manual overrides with reasons.** For ETA, weight, status and charges, an override needs a reason. The original value is kept, and the field shows an "Overridden" badge plus an audit entry.
- **Notes and attachments** on every record (attachments are mock: file name and size are stored).
- **Audit history** on every record, from the shared event log.

## 4. v3 design direction
- **Layout.** Airy and balanced: a 12-column grid, 24–32 px gutters, max content width 1280 px and generous card padding (20–24 px). Make one primary action per screen obvious and put secondary actions in a "⋯" menu.
- **Palette.** Calmer. Keep design.md's tokens (Ternary teal primary, saffron and terracotta accents, slate neutrals) but use them softly: a light, nearly white sidebar instead of navy, tinted surfaces, 2–3 colours per screen, and accents saved for status and the primary action.
- **Visuals.** Cards and timelines first. Lists default to **cards or a board by stage**, with the table one click away ("Table" in Display) for experts.
- **Typography.** Inter for UI with a larger base (15 px) and clear hierarchy (28/20/16/14), IBM Plex Sans for headings, JetBrains Mono only for codes (SSCC, container numbers).
- **Motion.** Subtle: sheets slide in and the stepper animates progress.
- **Library stack (design.md):** shadcn/ui via the CLI (Radix primitives), TanStack Table for grids, sonner for toasts, next-themes for dark mode, MapLibre GL for the route map, and the three.js load planner with view presets and a 2D fallback.

## 5. What we deliberately don't do
- No backend. Views, fields, notes and attachments are stored in localStorage.
- Polaris advises against browser-only saved views in production; this is acceptable for a prototype.
- Map tiles use the public MapLibre demo style (no API key). Production would need a commercial tile provider.
