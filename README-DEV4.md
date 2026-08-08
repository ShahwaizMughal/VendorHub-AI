# Developer 4 — RFQ, Quotes & Orders

This branch implements the Developer 4 procurement workflow from the VendorHub AI SRS.

## Scope

- RFQ creation and dispatch to up to 10 vendors
- Vendor match scoring with shared-AI adapter + deterministic fallback
- RFQ detail and PDF export
- Vendor quote submission and revision
- Buyer quote comparison and recommendation
- Atomic quote acceptance with sibling quote rejection
- Automatic order creation
- Forward-only order state transitions
- Order timeline
- EventBus contracts for Developer 5 notifications

## Backend

```text
POST  /api/rfqs
GET   /api/rfqs/:id
GET   /api/rfqs/:id/pdf
GET   /api/rfqs/:id/match-suggestions
POST  /api/quotes
GET   /api/rfqs/:id/quotes
POST  /api/quotes/:id/accept
GET   /api/orders
GET   /api/orders/:id
PATCH /api/orders/:id/status
```

## Integration contracts

JWT payload must expose `userId` (or `id`/`_id`) and `role`. Vendor tokens should expose `vendorId` when the Vendor document `_id` differs from the authenticated User `_id`.

The shared AI service is injected through `app.locals.aiService` and should expose:

- `rankVendors({ rfq, vendors, criteria })`
- `recommendQuote({ rfq, quotes })`

Both AI calls have deterministic fallback behavior so the procurement flow remains usable when the AI service is unavailable.

The event bus is injected through `app.locals.eventBus`. Events emitted by this module include:

- `rfq:created`
- `quote:received`
- `order:created`
- `order:status_changed`

## Local setup

```bash
cd server
npm install
npm run dev
```

```bash
cd client
npm install
npm run dev
```

Required server environment variables:

```env
MONGO_URI=...
JWT_SECRET=...
PORT=5000
CLIENT_URL=http://localhost:5173
```

Quote acceptance uses a MongoDB transaction because the SRS requires accepting one quote and declining sibling quotes atomically. MongoDB must therefore run as a replica set/Atlas deployment for this operation.
