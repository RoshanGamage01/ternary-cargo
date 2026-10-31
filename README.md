# Ternary Cargo: interactive UI prototype (v2)

One SaaS platform for exporters, manufacturers and forwarders, from the factory floor to the consignee. **UI only:** mock data, state kept in localStorage, no backend. ETA predictions, CO2e figures, prices and load plans are illustrative.

```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npx next start -p 3100
node tests/dead-buttons.mjs     # Playwright dead-button check (server on :3100)
node tests/shots-v2.mjs         # screenshots -> ../screens-v2
```

Modules: Manufacturing (sales orders → SGTIN serialisation → SSCC palletising → packing list/ASN → 3D load plan → loading → unloading confirmation), freight ops (quotes, bookings, shipments with P50/P90 ETA, consolidation, documents, customs, tracking, arrival), warehouse (tally, verification with two-person exception sign-off, offline mobile scan, DO release), finance and admin, and the customer portal.

Docs: `docs/research.md`, `docs/product-vision.md`, `docs/team/`, and screenshots in `docs/screens-v2/index.md` (v1 in `docs/screens/`).
