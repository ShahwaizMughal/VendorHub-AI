## Page 1

VendorHub AI
Software Requirements Specification (SRS)
Capstone / Industry Internship Engineering Team — 6 Developers
Version 1.0 · July 30, 2026
Table of Contents
Stack: MongoDB, Express.js, React.js, Node.js (MERN) + Tailwind CSS, Framer 
Motion, Redux Toolkit, Socket.io, JWT, Cloudinary. This SRS supersedes the original 
concept document’s proposed stack (Next.js/FastAPI/PostgreSQL/Elasticsearch) — 
the entire architecture below is re-engineered for a MERN-only stack suitable for a 6-
developer parallel team building a portfolio-grade, SaaS-quality product within a 
semester/internship timeline.
1. Introduction
1.1 Purpose
This document specifies the functional and non-functional requirements, system architecture, 
data model, API contracts, UI/UX direction, and team task division for VendorHub AI, an AI-
assisted B2B sourcing and supplier-discovery platform. It is written to IEEE 830-style 
conventions and is intended to let six developers begin implementation in parallel with 
minimal cross-dependency and minimal need for clarification meetings.
1.2 Scope
VendorHub AI is a MERN web application that lets Buyers describe a sourcing need in natural 
language, discover and compare Vendors, generate and send RFQs (Requests for Quotation), 
receive and compare Quotes, communicate via real-time chat, and manage the resulting 
Orders end-to-end. An Admin role verifies vendors, manages categories/plans, and monitors 
platform health.
For the MVP (this SRS’s implementation target), “AI” features (matching score, RFQ drafting 
assist, negotiation email drafts) are implemented as a dedicated AI Service Layer that wraps 
OpenAI/Gemini behind a single internal API, so that the rest of the system never depends 
directly on a specific AI vendor. This keeps AI provider swaps to one file/module.
Out of scope for MVP (documented in Section 13 – Future Enhancements): payments/escrow, 
ERP integrations (SAP, QuickBooks, Dynamics), OCR document intelligence, SSO/white-
labeling, demand forecasting.


## Page 2

1.3 Definitions
Term
Definition
RFQ
Request for Quotation — a structured 
document a Buyer sends to one or more 
Vendors describing what they need
Quote
A Vendor’s priced response to an RFQ
Match Score
AI-computed 0-100 compatibility score 
between a Buyer’s need and a Vendor
MOQ
Minimum Order Quantity
JWT
JSON Web Token, used for stateless 
authentication
RBAC
Role-Based Access Control
1.4 Acronyms
SRS, MERN, JWT, RBAC, API, REST, CRUD, MVP, CI/CD, SPA, UX/UI, SLA, CORS, XSS, CSRF.
1.5 References
•
IEEE 830-1998 Recommended Practice for SRS
•
MongoDB / Mongoose documentation
•
Express.js, React 18, Node.js LTS documentation
•
OWASP REST Security Cheat Sheet
•
Source concept document: “VendorHub AI” project brief (attached PDF)
2. Overall Description
2.1 Product Perspective
VendorHub AI is a new, standalone SPA (single-page application) with a Node/Express REST + 
Socket.io backend and a MongoDB data store. It is not a modification of an existing system. It is 
architected as three deployable units:


## Page 3

Diagram 1
2.2 Product Functions (Summary)
1.
Multi-role auth (Buyer / Vendor / Admin) with email verification and password reset
2.
Buyer dashboard with AI-assisted natural-language supplier search
3.
Vendor public profile + private management dashboard
4.
Product/service catalog per vendor
5.
AI vendor match scoring
6.
RFQ creation, PDF export, and multi-vendor dispatch
7.
Quote submission and side-by-side AI-recommended comparison
8.
Real-time chat between Buyer and Vendor
9.
Order lifecycle tracking post-quote-acceptance
10.
In-app + email notifications
11.
Buyer/Vendor analytics dashboards
12.
Admin vendor verification, category management, platform analytics
2.3 User Classes and Characteristics
Role
Description
Technical Skill
Buyer
Procurement staff, small 
business owner, importer
Low–Medium
Vendor
Manufacturer/supplier 
managing their storefront
Low–Medium
Admin
Internal platform operator
Medium–High
Guest
Unauthenticated visitor 
browsing public vendor 
Any


## Page 4

Role
Description
Technical Skill
profiles
2.4 Assumptions
•
Users have modern evergreen browsers (Chrome, Edge, Firefox, Safari — last 2 
versions)
•
AI provider (OpenAI/Gemini) API keys are available in all environments; a mock/local 
fallback exists for dev/offline work
•
MongoDB Atlas free/shared tier is sufficient for MVP data volumes
•
Real-time features degrade gracefully (polling fallback) if WebSocket is blocked by a 
network
2.5 Constraints
•
Must use MERN stack only (no Next.js/FastAPI/Postgres per project mandate)
•
Must be buildable/maintainable by 6 developers working concurrently with low merge 
conflict risk
•
Must ship an MVP within a single academic term / internship cycle
•
Free-tier-friendly (Atlas, Cloudinary, Render/Vercel) for demo/deployment purposes
3. Functional Requirements
Modules below cover the MVP surface area. Each follows the same template: Purpose, 
Inputs, Outputs, Business Rules, Validation, User Flow, Acceptance Criteria, API 
Requirements, Database Collections, Dependencies, Edge Cases. Modules marked 
[Phase 2] are specified at a lighter level of detail and expanded in Section 13.
3.1 Module 1 — Authentication & User Management
(Owned by Developer 1)
Aspect
Detail
Purpose
Allow any user to register as Buyer or 
Vendor, verify their email, log in/out, reset a 
forgotten password, and manage their 
profile; provide the JWT/RBAC middleware 
every other module depends on.
Inputs
Registration form (name, email, password, 
role, company name), login form (email, 
password), forgot-password email, reset form 
(token + new password), email verification 
link token, profile update form, avatar 
upload.
Outputs
Access token (short-lived JWT), refresh token 
(httpOnly cookie), user object, 
verification/reset emails, updated profile 
payload.


## Page 5

Aspect
Detail
Business Rules
A user picks exactly one primary role at 
signup (Buyer or Vendor); Admin accounts 
are seeded/created manually, never via 
public signup. Email must be verified before 
a Vendor profile can be published (Buyers 
can browse unverified). One account per 
email. Password reset tokens expire after 1 
hour and are single-use.
Validation
Email: RFC-compliant format, uniqueness. 
Password: min 8 chars, 1 uppercase, 1 
number, 1 symbol. Company name required 
for Vendor role. All inputs sanitized server-
side (see Section 12).
User Flow 1. Visitor lands on /register, selects role (Buyer/Vendor), submits form. 2. 
Backend creates user with isVerified: false, sends verification email (signed token, 24h 
expiry). 3. User clicks link → /verify-email/:token → account activated. 4. User logs in at 
/login → receives access token (in memory/Redux) + refresh token (httpOnly cookie). 5. 
Forgot password → /forgot-password → email with reset link → /reset-
password/:token → new password set, all existing refresh tokens revoked.
Acceptance Criteria - [ ] Cannot log in with an unverified email (Vendor) — returns 403 with 
a clear message - [ ] Access token expires in 15 min; refresh token in 7 days and rotates on use - 
[ ] Password is never returned in any API response, ever - [ ] Rate limiting: max 5 login 
attempts / 15 min per IP+email combo
API Requirements | Method | Endpoint | Auth | Description | |—|—|—|—| | POST | 
/api/auth/register | Public | Create account | | POST | /api/auth/verify-
email/:token | Public | Verify email | | POST | /api/auth/login | Public | Login, returns 
tokens | | POST | /api/auth/refresh | Cookie | Rotate access token | | POST | 
/api/auth/logout | Bearer | Revoke refresh token | | POST | /api/auth/forgot-
password | Public | Send reset email | | POST | /api/auth/reset-password/:token | 
Public | Set new password | | GET | /api/users/me | Bearer | Get current profile | | PATCH | 
/api/users/me | Bearer | Update profile | | POST | /api/users/me/avatar | Bearer | 
Upload avatar (Cloudinary) |
Database Collections: users (see Section 5)
Dependencies: Cloudinary (avatar), email service (Nodemailer + SMTP/Postmark/SendGrid), 
none on other developers’ modules — this module is the platform’s foundation, so it must 
merge to develop first.
Edge Cases - User requests password reset repeatedly → rate-limit to 1 request / 5 min - 
Expired/used verification token → show “resend verification” CTA - Refresh token reuse 
detected (stolen token) → revoke entire token family, force re-login - Vendor role selected but 
company name omitted → block submit client-side + 400 server-side


## Page 6

3.2 Module 2 — Buyer Dashboard & AI Supplier Search
(Owned by Developer 2)
Aspect
Detail
Purpose
Give Buyers a home base to search for 
suppliers using natural language, see AI-
ranked matches, track their 
RFQs/quotes/orders at a glance, and manage 
favorite vendors.
Inputs
Free-text search query, structured filters 
(country, industry, MOQ, price band, 
certification, lead time), “save vendor” action.
Outputs
Ranked list of vendor cards with match score, 
dashboard widgets (active RFQs, pending 
quotes, orders, saved vendors, recent 
searches, spending summary).
Business Rules
AI search always returns a deterministic 
filtered/sorted DB query augmented by an 
AI-generated relevance score — the AI never 
has direct DB write access; it only reads a 
pre-filtered candidate set (max 50) and re-
ranks it. This keeps latency and cost bounded 
and prevents prompt-injection from 
mutating data. Free-tier accounts limited to 
10 searches/month (soft paywall banner, not 
hard block for MVP demo).
Validation
Search query 3–300 chars. Filter values 
validated against enum lists (see Vendor 
schema).
User Flow 1. Buyer lands on /dashboard → sees widgets populated from aggregation queries. 
2. Buyer types “Need 10,000 cotton t-shirts manufactured in Pakistan” into the AI Search bar. 3. 
Frontend sends query to POST /api/search/ai. 4. Backend extracts structured filters from 
the text (via AI Service Layer, function-calling style prompt) → runs a Mongo query against 
vendors/products → passes top candidates + query back to AI Service Layer for 
scoring/explanation → returns ranked list with matchScore and a one-line “why this vendor” 
rationale. 5. Buyer can save a vendor (adds to favorites) or open a vendor profile.
Acceptance Criteria - [ ] A search returns results in under 3s for the demo dataset (cached 
candidate query < 200ms, AI re-rank is the variable cost) - [ ] If the AI service is down/times 
out, the system falls back to a plain filtered/sorted-by-rating list (never a blank page) - [ ] 
Search history (last 10 queries) persists per user
API Requirements | Method | Endpoint | Auth | Description | |—|—|—|—| | POST | 
/api/search/ai | Bearer (Buyer) | NL search → ranked vendors | | GET | 
/api/search/history | Bearer (Buyer) | Recent searches | | GET | 


## Page 7

/api/dashboard/buyer | Bearer (Buyer) | Aggregated widget data | | POST | 
/api/favorites/:vendorId | Bearer (Buyer) | Save/unsave vendor | | GET | 
/api/favorites | Bearer (Buyer) | List saved vendors |
Database Collections: searches, favorites (reads vendors, products, rfqs, quotes, 
orders — read-only from this module’s perspective)
Dependencies: AI Service Layer (owned by Dev 6 / shared lib), Vendor Profile data (Dev 3) — 
read-only, so no write-conflict risk.
Edge Cases - Query in a non-English language → AI Service Layer instructed to detect language 
and respond in kind, filters still map to the same enum values - Zero results → show “broaden 
your search” suggestions instead of empty state - Ambiguous quantity (“a lot of shirts”) → AI 
asks a single clarifying follow-up chip instead of guessing
3.3 Module 3 — Vendor Experience (Profile, Catalog, Dashboard)
(Owned by Developer 3)
Aspect
Detail
Purpose
Let a Vendor build a public storefront profile, 
manage a product/service catalog, and view a 
dashboard of incoming demand and 
performance.
Inputs
Company info form, photos/videos 
(Cloudinary), certifications (upload + 
metadata), product forms (name, category, 
price range, MOQ, lead time, images), team 
members.
Outputs
Public vendor profile page, vendor dashboard 
widgets (new RFQs, active orders, revenue, 
product performance).
Business Rules
A vendor profile is only publicly 
listed/searchable once 
verificationStatus === 'verified' 
(set by Admin, Dev 6). Vendors can still edit 
and preview their profile pre-verification. 
Each product belongs to exactly one category 
(from a shared, admin-managed category 
list).
Validation
Price range min ≤ max. MOQ > 0. At least 1 
product image required per product before 
publish. Certification files limited to 
PDF/JPG/PNG, 10MB max.
User Flow 1. Vendor completes onboarding wizard: Company Info → Certifications → Products 
→ Review. 2. Profile saved as draft; Admin sees it in a verification queue. 3. Once verified, profile 


## Page 8

appears in AI Search results and is publicly viewable at /vendors/:slug. 4. Vendor manages 
products via a catalog table (add/edit/archive), views dashboard analytics.
Acceptance Criteria - [ ] Unverified vendor profile is excluded from /api/search/ai and 
/api/vendors public listing, but visible to the vendor themself and Admin - [ ] Product 
images upload to Cloudinary and store only the secure URL + public_id in Mongo - [ ] Vendor 
dashboard widget numbers match underlying RFQ/Order collections (no cached staleness > 1 
min)
API Requirements | Method | Endpoint | Auth | Description | |—|—|—|—| | POST | 
/api/vendors/me | Bearer (Vendor) | Create/update own profile | | GET | 
/api/vendors/:slug | Public | Public profile view | | GET | /api/vendors | Public | 
Directory listing (verified only) | | POST | /api/vendors/me/certifications | Bearer 
(Vendor) | Upload certification | | POST | /api/products | Bearer (Vendor) | Create product | 
| PATCH | /api/products/:id | Bearer (Vendor, owner) | Update product | | DELETE | 
/api/products/:id | Bearer (Vendor, owner) | Archive product | | GET | /api/products?
vendor=:id | Public | List a vendor’s catalog | | GET | /api/dashboard/vendor | Bearer 
(Vendor) | Aggregated widget data |
Database Collections: vendors, products, categories (read)
Dependencies: Admin verification workflow (Dev 6, but decoupled via a 
verificationStatus enum field — Dev 3 doesn’t need Dev 6’s admin UI to exist to build 
and test this module against a seeded verified vendor).
Edge Cases - Vendor deletes a product referenced in an open RFQ/Quote → soft-delete 
(archived: true) rather than hard delete, so historical RFQs still render the product name - 
Duplicate slug on profile creation → auto-suffix (-2, -3) - Certification upload fails mid-request 
→ retry with resumable upload guidance, no partial DB record created until Cloudinary 
confirms
3.4 Module 4 — RFQ, Quotes & Orders (Procurement Workflow)
(Owned by Developer 4)
This module covers three tightly-related sub-flows: RFQ Generator, AI Vendor Matching + 
Quote Comparison, and Order Management.
Aspect
Detail
Purpose
Let a Buyer generate a structured RFQ 
(assisted by AI drafting), send it to one or 
more vendors, receive quotes, compare them 
(with an AI recommendation), accept one, 
and track the resulting order to completion.
Inputs
RFQ form (product, quantity, material/spec, 
budget range, delivery date, payment terms, 
shipping method, attachments), quote 
submission form (vendor side: unit price, 
total, lead time, terms, notes), order status 


## Page 9

Aspect
Detail
updates.
Outputs
RFQ record + exportable PDF, quote records, 
side-by-side comparison table with AI 
recommendation, order record with status 
timeline.
Business Rules
An RFQ can be sent to up to 10 vendors at 
once. A quote can only be submitted by a 
vendor the RFQ was sent to, and only once 
(can be revised, not duplicated). Accepting a 
quote auto-creates an order and marks 
sibling quotes declined. Match scoring (AI 
Vendor Matching) runs at RFQ-creation time 
to suggest which verified vendors to send to, 
using 
price/quality/delivery/reviews/location/cap
acity/certifications/past-performance as 
inputs to the AI Service Layer prompt — 
output is a 0–100 score + short rationale, 
cached on the RFQ-vendor pairing.
Validation
Quantity > 0. Delivery date must be in the 
future. Budget min ≤ max. Max 5 
attachments, 15MB total.
User Flow 1. Buyer clicks “New RFQ” → fills form (or uses “AI Draft” to auto-fill from their last 
search query). 2. Buyer picks vendors from an AI-ranked suggestion list (or manually). 3. RFQ 
sent → vendors notified (Module: Notifications). 4. Each vendor submits a quote via their 
dashboard. 5. Buyer opens Quote Comparison view → table of all quotes + AI-highlighted “best 
value” pick with rationale. 6. Buyer accepts a quote → order created with status 
pending_confirmation. 7. Vendor confirms → status progresses: confirmed → 
in_production → shipped → delivered. 8. Buyer can export the RFQ (and later, the final 
order confirmation) as PDF.
Acceptance Criteria - [ ] Accepting one quote automatically sets all sibling quotes on that RFQ 
to declined in the same transaction - [ ] PDF export matches the on-screen RFQ data exactly 
(single source of truth, no duplicate templating logic) - [ ] Order status can only move forward 
(no skipping backward) except an explicit cancelled state reachable from any pre-
delivered status
API Requirements | Method | Endpoint | Auth | Description | |—|—|—|—| | POST | 
/api/rfqs | Bearer (Buyer) | Create RFQ, dispatch to vendors | | GET | /api/rfqs/:id | 
Bearer (owner Buyer or targeted Vendor) | RFQ detail | | GET | /api/rfqs/:id/pdf | Bearer | 
Generate/download PDF | | GET | /api/rfqs/:id/match-suggestions | Bearer (Buyer) | 
AI vendor match list | | POST | /api/quotes | Bearer (Vendor) | Submit quote against an RFQ 
| | GET | /api/rfqs/:id/quotes | Bearer (Buyer) | List + AI comparison | | POST | 
/api/quotes/:id/accept | Bearer (Buyer) | Accept quote → create order | | GET | 


## Page 10

/api/orders/:id | Bearer (Buyer/Vendor party) | Order detail + timeline | | PATCH | 
/api/orders/:id/status | Bearer (Vendor, then Buyer for delivered-confirm) | Advance 
status |
Database Collections: rfqs, quotes, orders
Dependencies: AI Service Layer (shared lib, Dev 6), Notifications module (Dev 5) via an 
internal event emitter (eventBus.emit('rfq:created', ...)) so Dev 4 doesn’t need to 
write Dev 5’s notification code — just emit events on a documented contract.
Edge Cases - Vendor doesn’t respond to RFQ within a set window → Buyer sees a “no response” 
indicator (no auto-cancellation for MVP) - Buyer tries to accept a quote on an RFQ already 
closed → 409 Conflict - Currency mismatch between Buyer’s region and Vendor’s quote → MVP 
stores a single currency field per quote and displays it as-is (no live conversion in MVP; 
flagged for Phase 2)
3.5 Module 5 — Messaging, Notifications & Shared Design System
(Owned by Developer 5)
Aspect
Detail
Purpose
Provide real-time Buyer↔Vendor chat, a 
unified notification system (in-app + email), 
and the shared UI component library 
(Navbar, Sidebar, Footer, theming) that every 
other developer’s pages are built on top of.
Inputs
Chat messages (text, file, image), read-receipt 
events, notification-triggering events emitted 
by other modules.
Outputs
Persisted conversation threads, real-time 
message delivery via Socket.io, notification 
bell feed, email notifications.
Business Rules
A conversation thread is scoped to a single 
Buyer-Vendor pair, optionally linked to an 
RFQ/Order for context. Notifications are 
generated from a fixed set of documented 
event types (rfq:created, 
quote:received, order:shipped, 
message:received, 
contract:expiring [Phase 2], 
payment:reminder [Phase 2]) — any 
module can emit these via a shared 
eventBus, decoupling Dev 5 from needing to 
know internals of Dev 2/3/4’s code.
Validation
Message text ≤ 5,000 chars. File attachments 
≤ 10MB, allowed types: pdf/png/jpg/docx.


## Page 11

User Flow 1. Buyer opens a vendor profile or RFQ and clicks “Message” → thread created if 
none exists. 2. Messages sent over Socket.io, persisted to Mongo, delivered instantly if recipient 
is online, else shown as unread + triggers a notification. 3. Notification bell shows unread 
count; clicking opens a dropdown/feed; clicking an item deep-links to the relevant 
RFQ/Order/Chat. 4. Critical notifications (RFQ received, quote received, order shipped) also 
send an email.
Acceptance Criteria - [ ] Message delivery latency < 500ms on a healthy connection - [ ] If 
Socket.io connection drops, client falls back to polling /api/messages/:threadId every 10s 
and reconnects automatically - [ ] Read receipts update in real time for both parties - [ ] 
Reusable component library (Button, Card, Modal, Input, Table, Badge, Skeleton, Toast) is 
documented (Storybook or an in-app /design-system route) before Week 3, since every 
other developer consumes it
API Requirements | Method | Endpoint | Auth | Description | |—|—|—|—| | GET | 
/api/threads | Bearer | List my conversation threads | | GET | 
/api/threads/:id/messages | Bearer (participant) | Message history | | POST | 
/api/threads/:id/messages | Bearer (participant) | Send message (also emits socket 
event) | | POST | /api/threads | Bearer | Start/find thread with a counterparty | | GET | 
/api/notifications | Bearer | List notifications | | PATCH | 
/api/notifications/:id/read | Bearer | Mark as read | | WS | socket: join:thread, 
message:new, message:read, notification:new | Auth via socket handshake token | 
Real-time channel |
Database Collections: threads, messages, notifications
Dependencies: This is the most “infrastructure-like” module (shared design system + event 
bus). It should ship its component library and event-bus contract first (Week 1–2) so Devs 
2/3/4 aren’t blocked styling their pages.
Edge Cases - User sends a message to a thread they’re not part of → 403 - Socket auth token 
expires mid-session → client silently refreshes token and re-joins rooms without dropping the 
UI - Duplicate thread-start requests (double click) → idempotent, returns existing thread
3.6 Module 6 — Admin, Analytics & Platform Management
(Owned by Developer 6 / Team Lead)
Aspect
Detail
Purpose
Give the Admin control over vendor 
verification, categories, and platform-wide 
reporting; own the cross-cutting architecture 
concerns (shared constants, DB indexes, CI, 
final integration).
Inputs
Verification approve/reject actions (+ 
reason), category CRUD, report filters.
Outputs
Vendor verification queue, category list, 
platform analytics dashboards (user growth, 


## Page 12

Aspect
Detail
RFQ volume, GMV proxy, top categories).
Business Rules
Only Admin role can set 
vendors.verificationStatus. Category 
deletion is blocked if products reference it 
(must reassign first). Platform analytics are 
read-only aggregations — no writes to 
business data from this dashboard.
Validation
Rejection requires a reason string (shown to 
vendor). Category name unique, 2–40 chars.
User Flow 1. Admin logs in → sees pending-verification queue (new vendor signups). 2. 
Reviews company info/certifications → Approve (sets verified, vendor becomes searchable) 
or Reject (with reason, vendor notified, can resubmit). 3. Admin manages the shared category 
taxonomy consumed by Module 3 & 4 forms. 4. Admin views platform analytics (aggregation 
pipelines over users, rfqs, orders).
Acceptance Criteria - [ ] Verification action is atomic and immediately reflected in public 
search (no cache lag > 1 min) - [ ] Category deletion attempt with dependent products returns a 
409 with the list of blocking products - [ ] Analytics dashboard loads in < 2s using pre-
aggregated/indexed queries, not full collection scans
API Requirements | Method | Endpoint | Auth | Description | |—|—|—|—| | GET | 
/api/admin/vendors/pending | Bearer (Admin) | Verification queue | | PATCH | 
/api/admin/vendors/:id/verify | Bearer (Admin) | Approve/reject | | GET | 
/api/admin/categories | Bearer (Admin) / Public GET variant for forms | List categories | 
| POST | /api/admin/categories | Bearer (Admin) | Create category | | DELETE | 
/api/admin/categories/:id | Bearer (Admin) | Delete (guarded) | | GET | 
/api/admin/analytics/overview | Bearer (Admin) | Platform-wide metrics |
Database Collections: categories, reads across all collections for analytics; owns no 
exclusive business collection beyond categories
Dependencies: None blocking — Dev 6 also owns architecture/CI/merge review, so this 
module is intentionally last-priority feature work relative to unblocking the rest of the team.
Edge Cases - Two admins act on the same vendor verification simultaneously → optimistic 
locking via a version field prevents a double-write race - Category rename after products 
already reference it by ID → no issue (products store categoryId, not name)
3.7 Phase-2 Modules (specified at lighter detail — see Section 13)
Module
Owner (Phase 2)
One-line spec
AI Negotiation Assistant
Dev 4 domain
AI Service Layer generates 
negotiation emails/counter-
offers from RFQ+Quote 
context; pure text generation, 
no new collections beyond a 


## Page 13

Module
Owner (Phase 2)
One-line spec
negotiationDrafts cache
AI Risk Analysis
Dev 6 domain
Computes a risk score from 
vendor age, verification gaps, 
delivery history; stored as 
vendors.riskScore, 
recomputed on a schedule 
(cron/agenda job)
Documents & AI 
Summarization
Dev 4 domain
Generic documents 
collection (Cloudinary file + 
metadata) attachable to 
RFQ/Order/Vendor; AI 
summarization is an on-
demand endpoint, not stored 
inline
Payments 
(Stripe/PayPal/Wise)
Dev 6 domain
Wraps Stripe Checkout for 
subscription plans 
(Free/Pro/Business/Enterpri
se); order payments deferred 
further
ERP/Shipping Integrations
N/A
DHL/FedEx/UPS/
QuickBooks/SAP — adapter-
pattern integration layer, 
built only once MVP is stable
4. Non-Functional Requirements
Category
Requirement
Performance
API p95 response time < 400ms for CRUD 
reads; AI-dependent endpoints (search, 
matching) budgeted up to 3s with a visible 
skeleton/shimmer loading state; DB queries 
backed by indexes (Section 5.4) to avoid 
collection scans
Scalability
Stateless Express instances behind a load 
balancer (horizontal scale); Socket.io scaled 
via Redis adapter if >1 instance is deployed; 
MongoDB Atlas auto-scaling tier for 
production
Reliability
Graceful degradation: AI Service Layer 
failures fall back to non-AI sorted results 
rather than erroring the whole page; all 
external calls (Cloudinary, AI, email) 
wrapped in try/catch with retry (max 2, 
exponential backoff)


## Page 14

Category
Requirement
Availability
Target 99% uptime for demo/production; 
health-check endpoint /api/health for 
uptime monitors
Security
See Section 12 in full (JWT, hashing, RBAC, 
rate limiting, Helmet, CORS, sanitization, 
XSS/CSRF mitigation)
Accessibility
WCAG 2.1 AA target: semantic HTML, ARIA 
labels on icon-only buttons, keyboard 
navigable modals/menus, color contrast ≥ 
4.5:1 in both light/dark themes
SEO
Public pages (vendor directory, vendor 
profile) server-rendered-friendly via React 
Helmet meta tags, semantic headings, 
sitemap.xml, robots.txt; authenticated 
dashboard pages are noindex
Maintainability
Consistent folder structure (Section 8), 
ESLint + Prettier enforced pre-commit, 
documented API contracts (this SRS + 
Postman/Swagger collection), modular AI 
Service Layer isolates third-party AI provider 
changes to one file
Responsiveness
Mobile-first Tailwind breakpoints 
(sm/md/lg/xl); all dashboards usable down 
to 375px width; tables collapse to stacked 
cards on mobile
Cross-Browser Support
Chrome, Edge, Firefox, Safari (last 2 major 
versions each); no vendor-prefixed-only CSS 
relied upon


## Page 15

5. Database Design
5.1 Entity Relationship Overview
Diagram 2
5.2 Collections & Schemas
users
{
  _id: ObjectId,
  name: String,
  email: { type: String, unique: true, lowercase: true },
  passwordHash: String,
  role: { type: String, enum: ['buyer', 'vendor', 'admin'], required: 
true },
  isVerified: { type: Boolean, default: false },
  avatarUrl: String,
  avatarPublicId: String,
  companyName: String,          // required if role === 'vendor'
  refreshTokenFamily: String,   // for rotation/reuse detection
  plan: { type: String, enum: ['free','pro','business','enterprise'], 
default: 'free' },
  createdAt: Date, updatedAt: Date
}
vendors
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'users', unique: true },
  slug: { type: String, unique: true, index: true },


## Page 16

  companyDescription: String,
  country: { type: String, index: true },
  industry: { type: String, index: true },
  certifications: [{ name: String, fileUrl: String, publicId: 
String }],
  photos: [{ url: String, publicId: String }],
  videos: [{ url: String, publicId: String }],
  exportCountries: [String],
  productionCapacity: String,
  teamSize: Number,
  languages: [String],
  responseTimeHours: Number,
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  verificationStatus: { type: String, enum: 
['pending','verified','rejected'], default: 'pending', index: true },
  rejectionReason: String,
  riskScore: Number,           // Phase 2
  version: { type: Number, default: 0 }, // optimistic locking
  createdAt: Date, updatedAt: Date
}
products
{
  _id: ObjectId,
  vendorId: { type: ObjectId, ref: 'vendors', index: true },
  categoryId: { type: ObjectId, ref: 'categories', index: true },
  name: String,
  images: [{ url: String, publicId: String }],
  specifications: Object,
  moq: Number,
  priceMin: Number, priceMax: Number,
  leadTimeDays: Number,
  availableStock: Number,
  archived: { type: Boolean, default: false },
  createdAt: Date, updatedAt: Date
}
categories
{ _id: ObjectId, name: { type: String, unique: true }, slug: String, 
createdAt: Date }
rfqs
{
  _id: ObjectId,
  buyerId: { type: ObjectId, ref: 'users', index: true },
  product: String, quantity: Number, material: String,
  budgetMin: Number, budgetMax: Number,
  deliveryDate: Date, paymentTerms: String, shippingMethod: String,


## Page 17

  attachments: [{ url: String, publicId: String, name: String }],
  targetVendorIds: [{ type: ObjectId, ref: 'vendors' }],
  matchScores: [{ vendorId: ObjectId, score: Number, rationale: String 
}],
  status: { type: String, enum: ['open','closed','cancelled'], 
default: 'open', index: true },
  createdAt: Date, updatedAt: Date
}
quotes
{
  _id: ObjectId,
  rfqId: { type: ObjectId, ref: 'rfqs', index: true },
  vendorId: { type: ObjectId, ref: 'vendors', index: true },
  unitPrice: Number, totalPrice: Number, currency: String,
  leadTimeDays: Number, terms: String, notes: String,
  status: { type: String, enum: ['submitted','accepted','declined'], 
default: 'submitted', index: true },
  createdAt: Date, updatedAt: Date
}
Unique compound index on { rfqId: 1, vendorId: 1 } to enforce “one quote per vendor 
per RFQ”.
orders
{
  _id: ObjectId,
  rfqId: ObjectId, quoteId: ObjectId,
  buyerId: { type: ObjectId, ref: 'users' },
  vendorId: { type: ObjectId, ref: 'vendors' },
  status: { type: String, enum: 
['pending_confirmation','confirmed','in_production','shipped','deliver
ed','cancelled'], default: 'pending_confirmation', index: true },
  statusHistory: [{ status: String, at: Date, note: String }],
  invoiceUrl: String,
  createdAt: Date, updatedAt: Date
}
threads
{ _id: ObjectId, participantIds: [ObjectId], rfqId: ObjectId, 
lastMessageAt: Date, createdAt: Date }
Compound index on { participantIds: 1 }.
messages
{
  _id: ObjectId, threadId: { type: ObjectId, ref: 'threads', index: 
true },
  senderId: ObjectId, text: String,


## Page 18

  attachment: { url: String, type: String },
  readBy: [ObjectId], createdAt: Date
}
notifications
{
  _id: ObjectId, userId: { type: ObjectId, index: true },
  type: { type: String, enum: 
['rfq_created','quote_received','order_shipped','message_received','co
ntract_expiring','payment_reminder'] },
  payload: Object, isRead: { type: Boolean, default: false, index: 
true },
  createdAt: Date
}
favorites
{ _id: ObjectId, buyerId: { type: ObjectId, index: true }, vendorId: 
ObjectId, createdAt: Date }
Unique compound index { buyerId: 1, vendorId: 1 }.
searches
{ _id: ObjectId, buyerId: { type: ObjectId, index: true }, query: 
String, filters: Object, createdAt: Date }
5.3 Relationships Summary
From
To
Type
users
vendors
1:1 (when role=vendor)
vendors
products
1:N
categories
products
1:N
rfqs
quotes
1:N
quotes
orders
1:1
threads
messages
1:N
users
notifications
1:N
5.4 Key Indexes
•
users.email (unique)
•
vendors.slug (unique), vendors.verificationStatus, vendors.
{country,industry} (compound, for filtered search)
•
products.vendorId, products.categoryId
•
rfqs.buyerId, rfqs.status
•
quotes.{rfqId,vendorId} (unique compound)
•
orders.status
•
notifications.{userId,isRead} (compound)


## Page 19

•
favorites.{buyerId,vendorId} (unique compound)
6. REST API Design (Consolidated)
Per-module tables in Section 3 are the authoritative detail; this table is the flat master 
index for Swagger/Postman generation.
Domain
Base Path
Notes
Auth
/api/auth/*
Public except logout
Users
/api/users/*
Bearer required
Vendors
/api/vendors/*
Mixed public/Bearer
Products
/api/products/*
Mixed public/Bearer 
(Vendor-owner writes)
Search
/api/search/*
Bearer (Buyer)
RFQs
/api/rfqs/*
Bearer
Quotes
/api/quotes/*
Bearer
Orders
/api/orders/*
Bearer
Threads/Messages
/api/threads/*
Bearer
Notifications
/api/notifications/*
Bearer
Favorites
/api/favorites/*
Bearer (Buyer)
Admin
/api/admin/*
Bearer (Admin)
Health
/api/health
Public
Standard success envelope
{ "success": true, "data": { }, "meta": { "page": 1, "limit": 20, 
"total": 42 } }
Standard error envelope
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": 
"Email is required", "fields": { "email": "Required" } } }
HTTP Status
Meaning
400
Validation error
401
Missing/invalid/expired token
403
Authenticated but not authorized 
(wrong role/owner)
404
Resource not found
409
Conflict (duplicate, race condition, 
invalid state transition)
422
Semantically invalid (e.g., budgetMin 
> budgetMax)
429
Rate limited


## Page 20

HTTP Status
Meaning
500
Unhandled server error
Protected route pattern (Express middleware chain)
router.patch('/api/products/:id',
  authenticate,               // verifies JWT, attaches req.user
  authorize('vendor'),        // role check
  ownsResource('product'),    // ownership check (vendorId === 
req.user.vendorId)
  validate(updateProductSchema),
  productController.update
);
7. Authentication Flow
Diagram 3
•
JWT: access token payload = { sub: userId, role, iat, exp }, signed HS256, 
secret in env var.
•
Refresh Tokens: stored httpOnly + secure + sameSite: strict cookie; rotated on 
every use; reuse of an old token invalidates the whole family (theft detection).
•
Role-Based Access: authorize(...roles) middleware checks req.user.role.
•
Email Verification: signed, time-limited token mailed on signup; required before 
Vendor profile publishes.
•
Forgot Password: signed, single-use, 1-hour token; on reset, all refresh tokens for that 
user are revoked.


## Page 21

•
Google Login (Future): OAuth2 code flow → backend exchanges code, creates/links 
users record with provider: 'google'; documented here so Dev 1 can stub the 
route now and wire it up in Phase 2 without a schema migration (the 
provider/providerId fields are added to users from day one, nullable).
8. Folder Structure
vendorhub-ai/
├── client/                          # React app
│   ├── src/
│   │   ├── app/                     # store.js, root providers
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/                  # Button, Card, Modal, Input, 
Badge, Skeleton, Toast (Dev 5)
│   │   │   ├── layout/              # Navbar, Sidebar, Footer, 
DashboardShell (Dev 5)
│   │   │   └── shared/              # cross-feature reusable 
components
│   │   ├── features/
│   │   │   ├── auth/                # Dev 1
│   │   │   ├── buyer/                # Dev 2
│   │   │   ├── vendor/               # Dev 3
│   │   │   ├── rfq/                  # Dev 4
│   │   │   ├── chat/                 # Dev 5
│   │   │   └── admin/                # Dev 6
│   │   ├── hooks/                   # useAuth, useSocket, 
useDebounce...
│   │   ├── lib/                     # axios instance, socket client, 
formatters
│   │   ├── routes/                  # React Router route definitions, 
ProtectedRoute
│   │   ├── store/                   # Redux Toolkit slices (or 
Context providers)
│   │   ├── styles/                  # Tailwind config, theme tokens
│   │   └── main.jsx
│   └── index.html
├── server/                          # Express app
│   ├── src/
│   │   ├── config/                  # db.js, cloudinary.js, env.js
│   │   ├── models/                  # Mongoose schemas (one file per 
collection)
│   │   ├── controllers/             # per-domain
│   │   ├── routes/                  # per-domain, mounted in app.js
│   │   ├── middleware/              # authenticate, authorize, 
ownsResource, validate, rateLimit, errorHandler
│   │   ├── services/                # aiService.js, emailService.js, 
cloudinaryService.js, pdfService.js
│   │   ├── events/                  # eventBus.js + listeners 


## Page 22

(notifications)
│   │   ├── sockets/                 # socket.io namespace setup
│   │   ├── utils/
│   │   ├── validators/              # Joi/Zod schemas per domain
│   │   └── app.js
│   └── server.js
├── shared/                          # constants, enums shared across 
client/server (roles, statuses)
├── .github/workflows/ci.yml
├── .env.example
└── README.md
9. UI Pages
Design direction for every page: modern SaaS aesthetic 
(Stripe/Linear/Vercel/Notion/Framer/GitHub/Clerk/Supabase/OpenAI/Shopify Admin 
inspired) — gradients on hero/empty states, glassmorphism on modals/overlays, clean flat 
cards with subtle shadow (shadow-sm + 1px border, not heavy drop-shadows), rounded-xl 
corners, generous whitespace, a premium type pairing (e.g., Geist / Inter for UI text, a slightly 
distinct display face for headings), full dark/light mode via CSS variables + Tailwind dark: 
classes.
#
Page
Purpose
Key 
Components
Forms/
Tables/
Charts
Animations 
(Framer 
Motion)
1
Landing (/)
Marketing/
conversion
Hero, 
FeatureGrid, 
PricingTable, 
Footer
Pricing 
comparison 
table
Staggered 
fade-in on 
scroll 
(whileInVi
ew), gradient 
hero blob 
subtle float
2
Register/
Login 
(/register,
/login)
Auth entry
AuthCard, 
RoleToggle, 
SocialButtons 
(future)
Register/
Login forms
Card 
entrance 
scale+fade, 
input focus 
ring 
transition, 
shake on 
validation 
error
3
Email 
Verify / 
Forgot / 
Reset
Account 
recovery
StatusIcon, 
AuthCard
Reset form
Success 
checkmark 
draw-in (SVG 
path 
animation)
4
Buyer 
Buyer home
WidgetCard×
— 
Widget 


## Page 23

#
Page
Purpose
Key 
Components
Forms/
Tables/
Charts
Animations 
(Framer 
Motion)
Dashboard 
(/dashboar
d)
6, 
AISearchBar, 
RecentSearch
es
(aggregated 
numbers)
stagger-in, 
number 
count-up on 
load, skeleton 
loaders while 
fetching
5
AI Search 
Results 
(/search)
Ranked 
vendor list
VendorCard, 
MatchScoreB
adge, 
FilterSidebar
Filter form
Card lift on 
hover, 
match-score 
radial 
progress 
animate-in
6
Vendor 
Public Profile 
(/vendors/
:slug)
Storefront
Gallery, 
CertBadges, 
ProductGrid, 
ReviewList, 
ChatCTA
Review form
Tab 
underline 
slide, gallery 
lightbox fade, 
sticky CTA 
slide-up on 
scroll
7
Vendor 
Dashboard 
(/vendor/d
ashboard)
Vendor home
WidgetCard×
5, 
RFQInboxPre
view
—
Same widget 
pattern as #4
8
Vendor 
Profile Editor 
(/vendor/p
rofile/edi
t)
Onboarding/
editing
Stepper, 
ImageUpload
er, 
CertUploader
Multi-step 
form
Stepper 
progress bar 
animate, step 
transition 
slide-
horizontal
9
Product 
Catalog 
Manager 
(/vendor/p
roducts)
CRUD 
products
DataTable, 
ProductForm
Modal
Product table 
+ form modal
Modal 
glassmorphis
m backdrop 
fade, row 
delete slide-
out
10
RFQ Builder 
(/rfq/new)
Create RFQ
RFQForm, 
AIDraftButto
n, 
VendorPicker 
(AI-ranked)
RFQ form
Progress bar 
per step, AI-
draft 
“typing” 
shimmer 
while 


## Page 24

#
Page
Purpose
Key 
Components
Forms/
Tables/
Charts
Animations 
(Framer 
Motion)
generating
11
RFQ Detail / 
PDF Preview 
(/rfq/:id)
View + 
export
RFQSummar
yCard, 
AttachmentL
ist, 
PDFPreview
Modal
—
PDF preview 
slide-in panel
12
Quote 
Comparison 
(/rfq/:id/
quotes)
Compare 
quotes
ComparisonT
able, 
AIRecommen
dationBanne
r
Comparison 
table
Recommende
d row subtle 
glow/pulse, 
column 
highlight on 
hover
13
Order 
Tracking 
(/orders/:
id)
Status 
timeline
Timeline, 
StatusBadge, 
InvoiceLink
—
Timeline step 
fill animation 
as status 
advances
14
Orders List 
(/orders)
All orders
DataTable, 
StatusFilterT
abs
Orders table
Tab 
underline 
slide
15
Chat 
(/messages
)
Real-time 
messaging
ThreadList, 
MessageBub
ble, 
Composer
Message 
composer
New message 
slide-
up+fade, 
typing 
indicator 
dots pulse
16
Notifications 
Feed 
(/notifica
tions)
All 
notifications
NotificationIt
em list
—
Unread pulse 
dot, mark-as-
read fade
17
Analytics 
(Buyer/Vend
or) 
(/analytic
s)
Charts
LineChart 
(spending/re
venue), 
BarChart 
(top 
vendors/pro
ducts), 
StatCards
Charts 
(Recharts)
Chart draw-
in animation, 
stat-card 
count-up
18
Admin 
Verification 
Queue 
Approve/
reject
DataTable, 
VendorRevie
wDrawer
Rejection-
reason form
Drawer slide-
in from right


## Page 25

#
Page
Purpose
Key 
Components
Forms/
Tables/
Charts
Animations 
(Framer 
Motion)
(/admin/ve
ndors)
19
Admin 
Categories 
(/admin/ca
tegories)
Manage 
taxonomy
DataTable, 
InlineEditRo
w
Category 
form
Row inline-
edit expand
20
Admin 
Analytics 
(/admin/an
alytics)
Platform 
metrics
ChartGrid, 
StatCards
Charts
Same as #17
21
Settings/
Profile 
(/settings
)
Account 
mgmt
ProfileForm, 
AvatarUploa
der, 
ThemeToggle
Profile form
Theme toggle 
sun/moon 
morph icon
22
404 / Error 
boundary
Fallback
IllustrationE
mptyState
—
Fade-in 
illustration
General cross-page patterns: page transitions via AnimatePresence on route change 
(fade+8px translateY), skeleton loaders matching final layout shape for every data-fetching 
page, button ripple on primary CTAs, sidebar collapse/expand transition on dashboard 
shells, toast notifications slide-in from top-right with auto-dismiss progress bar.
10. Component Hierarchy
<App>
 ├─ <ThemeProvider>            (dark/light context)
 ├─ <ReduxProvider>
 ├─ <SocketProvider>           (Dev 5)
 └─ <RouterProvider>
      ├─ <PublicLayout>            → Landing, VendorPublicProfile, 
VendorDirectory
      │    ├─ <Navbar/> <Footer/>  (shared, Dev 5)
      ├─ <AuthLayout>               → Login, Register, ForgotPassword, 
ResetPassword
      │    └─ <AuthCard/>
      └─ <DashboardLayout>          (protected, role-aware)
           ├─ <Sidebar/> <Topbar/> <NotificationBell/>  (shared, Dev 
5)
           ├─ role=buyer  → <BuyerDashboard> <AISearch> <RFQBuilder> 
<QuoteComparison> <OrdersList> <Analytics>
           ├─ role=vendor → <VendorDashboard> <ProfileEditor> 
<ProductCatalog> <RFQInbox> <Analytics>
           ├─ role=admin  → <VerificationQueue> <CategoryManager> 
<PlatformAnalytics>
           └─ shared      → <Chat> <NotificationsFeed> <Settings>


## Page 26

Reusable Components (components/ui, owned by Dev 5, consumed by all) Button, 
IconButton, Card, Modal, Drawer, Input, Textarea, Select, MultiSelect, 
DatePicker, Badge, Avatar, Tabs, DataTable, Skeleton, Toast, Tooltip, 
ProgressBar, Stepper, EmptyState.
Layout Components: Navbar, Sidebar, Footer, DashboardShell, PageHeader, 
ProtectedRoute, RoleGate.
Shared/Domain-crossing Components: VendorCard, MatchScoreBadge, StatusBadge, 
NotificationItem, ThreadPreview, MessageBubble, WidgetCard, ChartCard.
11. State Management
Approach: Redux Toolkit for global, cross-cutting state; local component state (useState) for 
form/UI-only state; React Query-style caching is achieved via RTK Query for all server-state 
(avoids duplicating fetch/cache logic).
Slices (RTK Query API slices + regular slices): | Slice | Type | Responsibility | |—|—|—| | 
authSlice | regular | current user, access token (in-memory only, never localStorage), auth 
status | | themeSlice | regular | dark/light mode, persisted to a cookie (not localStorage per 
artifact/browser constraints — N/A here since this is a real deployed app, so localStorage 
is fine in production, just not inside Claude artifacts) | | authApi | RTK Query | 
login/register/refresh/profile endpoints | | vendorApi | RTK Query | vendor profile/catalog 
endpoints | | searchApi | RTK Query | AI search, favorites | | rfqApi | RTK Query | 
RFQ/quote/order endpoints | | chatSlice + socket middleware | regular + custom 
middleware | active thread, message cache merge from socket events into RTK Query cache via 
updateQueryData | | notificationSlice | regular | unread count, live-updated via socket 
|
State Flow Example (RFQ → Quote → Order): 1. RFQBuilder dispatches 
rfqApi.createRfq mutation → cache invalidates ['RFQ'] tag. 2. QuoteComparison page’s 
rfqApi.getQuotes(rfqId) query auto-refetches on tag invalidation when a vendor 
submits a quote (via socket-triggered manual 
dispatch(rfqApi.util.invalidateTags(...))). 3. Accepting a quote invalidates 
['RFQ','Order'] tags → OrdersList updates without manual refetch calls.
API Integration Pattern: a single axiosBaseQuery wraps axios (interceptor attaches 
Authorization header, handles 401 → silent refresh → retry original request once), used by 
every RTK Query slice for consistency.
12. Security
Concern
Implementation
Input Validation
Every route validated server-side with 
Joi/Zod schemas in validators/ before 
hitting a controller — client-side validation 
is UX-only, never trusted


## Page 27

Concern
Implementation
Password Hashing
bcrypt, cost factor 12, never log or return 
password/hash
JWT
Short-lived access token (15m), rotated 
refresh token (7d) in 
httpOnly+secure+sameSite cookie, HS256 
signed with a strong secret from env
Protected Routes
authenticate middleware on every non-
public route; frontend <ProtectedRoute> 
mirrors this for UX but is not a security 
boundary by itself
Role Permissions
authorize('buyer'|'vendor'|'admin
') + resource-ownership checks 
(ownsResource) for update/delete 
operations
Rate Limiting
express-rate-limit: 100 req/15min 
general, 5 req/15min on auth endpoints 
(login/forgot-password)
Helmet
helmet() applied globally for secure 
headers (CSP, HSTS, X-Frame-Options, etc.)
CORS
Explicit allow-list of frontend origins (env-
driven), credentials: true for cookie-based 
refresh flow
Mongo Sanitization
express-mongo-sanitize to strip $/. 
operator-injection attempts from user input 
before it reaches queries
XSS Prevention
React’s default escaping + sanitize any user-
generated HTML (chat, notes) before render 
if dangerouslySetInnerHTML is ever used 
(avoided wherever possible); Content-
Security-Policy via Helmet
CSRF
Primary mutation auth is a Bearer token in 
an Authorization header (not cookie-
read), which is inherently CSRF-resistant; the 
one cookie in play (refresh token) is 
sameSite: strict and only used against a 
dedicated /auth/refresh endpoint with no 
side effects beyond issuing a new token pair, 
minimizing CSRF surface. A csurf-style 
double-submit token can be added for the 
refresh endpoint if the team wants defense-
in-depth.


## Page 28

13. Future Enhancements
•
Full AI Procurement Agent (autonomous vendor outreach + negotiation within 
approved limits)
•
Payments: Stripe/PayPal/Wise checkout for subscription plans + escrow for orders
•
Advanced analytics: demand forecasting, predictive pricing trends, supplier 
performance scoring over time
•
Recommendation engine: personalized vendor/product suggestions from Buyer 
behavior history
•
Push notifications (web push / mobile)
•
ERP integrations: QuickBooks, SAP, Microsoft Dynamics
•
Shipping integrations: DHL, FedEx, UPS live tracking
•
Google/LinkedIn/Microsoft SSO, 2FA
•
OCR + AI document intelligence for contracts/certifications
•
Docker Compose for local dev parity; CI/CD via GitHub Actions → auto-deploy to staging 
on develop, production on tagged release
14. Deployment Architecture
Diagram 4
Environment Variables (.env.example):
NODE_ENV=
PORT=
MONGO_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
AI_PROVIDER=openai|gemini


## Page 29

OPENAI_API_KEY=
GEMINI_API_KEY=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
CLIENT_URL=
Frontend: static build deployed to Vercel/Netlify with a CDN edge cache; env-driven 
VITE_API_URL. Backend: containerizable Node process (Dockerfile provided in Phase 2) 
deployed to Render/Railway (MVP) or EC2/ECS (scale-up); Socket.io configured with a Redis 
adapter if scaled beyond one instance. Database: MongoDB Atlas shared/dedicated cluster 
with daily backups and IP allow-listing. Cloudinary: stores all user-uploaded media (avatars, 
product images, certifications, chat attachments); only secure URLs + public_id persisted in 
Mongo.
15. Testing
Level
Tooling
Scope
Unit Testing
Jest (backend), Vitest + React 
Testing Library (frontend)
Pure functions, validators, 
Redux slices/reducers, 
isolated components
Integration Testing
Jest + Supertest, in-memory 
MongoDB (mongodb-
memory-server)
Controller+model 
interactions, auth 
middleware chains
API Testing
Postman/Newman collection 
(generated from Section 6)
Full request/response 
contract verification, run in 
CI
UI Testing
Playwright or Cypress
Critical user journeys: 
register→verify→login, create 
RFQ→receive 
quote→accept→track order, 
send chat message
Manual Testing
Shared test-case checklist per 
module (owned by each Dev 
for their domain, reviewed by 
Dev 6)
Exploratory, cross-browser, 
responsive breakpoints, 
accessibility spot-checks
Minimum bar before merge to develop: unit tests for new logic pass, at least one 
integration test per new endpoint, no ESLint errors, manual smoke test of the happy path.
16. Task Division — 6 Developers, Low-Dependency Parallelization
Guiding principle: each developer owns a full vertical slice (frontend pages + backend 
routes/controllers/models + their own DB collections) rather than being split by “frontend 
team / backend team.” Cross-module communication happens only through (a) an internal 
event bus (eventBus.emit(...)), (b) the shared UI component library (Dev 5, built 


## Page 30

first), and (c) the shared AI Service Layer interface (a single function contract, 
aiService.rank(), aiService.draft(), etc., owned collectively but implemented by Dev 
6 in Week 1). This means Dev 2, 3, and 4 can build, run, and test their entire slice against seeded 
data without waiting on each other.
Diagram 5
16.1 Developer Assignment Matrix
Developer 1 — Authentication & Users · Branch: feature/auth · Dependency Level: Low 
(foundational; others depend on it, it depends on nothing) · Estimated Workload: ~15%
Aspect
Detail
Pages
Login, Register, Verify, Forgot/Reset, Settings
Backend APIs
/api/auth/*, /api/users/*
MongoDB Collections
users
React Components
AuthCard, RoleToggle, forms
Routes (Express)
routes/auth.routes.js, 
routes/user.routes.js
Middleware
authenticate, authorize, rate limiter 
(owns these for the whole team)
Models
User.js
Controllers/Services
auth.controller.js, 
user.controller.js, 
emailService.js
Required Reusable Components (consumed)
ui/Input, ui/Button, ui/Card


## Page 31

Aspect
Detail
Deliverables
Working login/register/verify/reset flow, 
JWT middleware package for the team
Developer 2 — Buyer Experience · Branch: feature/buyer · Dependency Level: Low (read-
only on Vendor data, calls shared AI contract) · Estimated Workload: ~18%
Aspect
Detail
Pages
Buyer Dashboard, AI Search Results, 
Favorites
Backend APIs
/api/search/*, 
/api/dashboard/buyer, 
/api/favorites/*
MongoDB Collections
searches, favorites (reads 
vendors/products)
React Components
AISearchBar, VendorCard, 
FilterSidebar, buyer WidgetCard set
Routes (Express)
routes/search.routes.js, 
routes/favorite.routes.js
Middleware
Consumes authenticate/authorize
Models
(none new)
Controllers/Services
search.controller.js (calls 
aiService.rank)
Required Reusable Components (consumed)
Full ui/ kit + MatchScoreBadge
Deliverables
AI search page + buyer dashboard widgets
Developer 3 — Vendor Experience · Branch: feature/vendor · Dependency Level: Low 
(independent CRUD slice) · Estimated Workload: ~18%
Aspect
Detail
Pages
Vendor Dashboard, Profile Editor, Product 
Catalog, Public Profile
Backend APIs
/api/vendors/*, /api/products/*, 
/api/dashboard/vendor
MongoDB Collections
vendors, products
React Components
ProfileEditorStepper, 
ImageUploader, ProductFormModal, 
catalog DataTable
Routes (Express)
routes/vendor.routes.js, 
routes/product.routes.js
Middleware
Consumes + ownsResource('product'), 
ownsResource('vendor')
Models
Vendor.js, Product.js, Category.js 


## Page 32

Aspect
Detail
(shared read)
Controllers/Services
vendor.controller.js, 
product.controller.js, 
cloudinaryService.js
Required Reusable Components (consumed)
Full ui/ kit + DataTable, Stepper
Deliverables
Vendor onboarding + catalog CRUD + public 
profile page
Developer 4 — RFQ, Quotes & Orders · Branch: feature/rfq · Dependency Level: Medium 
(depends on Vendor data existing + AI contract + emits events for Dev 5) · Estimated Workload: 
~22% (largest surface: 3 sub-flows)
Aspect
Detail
Pages
RFQ Builder, RFQ Detail, Quote Comparison, 
Orders List/Detail
Backend APIs
/api/rfqs/*, /api/quotes/*, 
/api/orders/*
MongoDB Collections
rfqs, quotes, orders
React Components
RFQForm, AIDraftButton, 
ComparisonTable, Timeline
Routes (Express)
routes/rfq.routes.js, 
routes/quote.routes.js, 
routes/order.routes.js
Middleware
Consumes + ownsResource('rfq'), state-
transition guard
Models
Rfq.js, Quote.js, Order.js
Controllers/Services
rfq.controller.js, 
quote.controller.js, 
order.controller.js, pdfService.js
Required Reusable Components (consumed)
Full ui/ kit + DataTable, Timeline, 
ProgressBar
Deliverables
Full RFQ→Quote→Order flow + PDF export
Developer 5 — Messaging, Notifications & Design System · Branch: feature/chat, 
feature/design-system · Dependency Level: Low→Medium (must ship design system + 
event bus early, or it becomes a soft blocker) · Estimated Workload: ~17% (front-loaded early)
Aspect
Detail
Pages
Chat, Notifications Feed, design-system 
storybook route
Backend APIs
/api/threads/*, 
/api/notifications/*, socket 


## Page 33

Aspect
Detail
namespace
MongoDB Collections
threads, messages, notifications
React Components
ThreadList, MessageBubble, Composer, 
NotificationItem, full ui/ kit
Routes (Express)
routes/thread.routes.js, 
routes/notification.routes.js
Middleware
Socket auth handshake middleware
Models
Thread.js, Message.js, 
Notification.js
Controllers/Services
thread.controller.js, 
notification.controller.js, 
eventBus.js listeners
Required Reusable Components
This developer builds them (not consumed 
from elsewhere)
Deliverables
Chat (real-time) + notification system + 
shared ui/ library shipped Week 1–2
Developer 6 (Team Lead) — Architecture & Admin · Branch: feature/admin, 
feature/architecture · Dependency Level: Low for admin feature work; High 
responsibility for integration/merge review · Estimated Workload: ~10% feature + ongoing 
integration/lead duties
Aspect
Detail
Pages
Admin Verification Queue, Admin Categories, 
Admin Analytics
Backend APIs
/api/admin/*, /api/health
MongoDB Collections
categories; cross-collection read for 
analytics
React Components
VendorReviewDrawer, ChartGrid, 
StatCards
Routes (Express)
routes/admin.routes.js
Middleware
Consumes + admin-only guard
Models
Category.js (owns writes)
Controllers/Services
admin.controller.js, aiService.js 
(shared), category.controller.js
Required Reusable Components (consumed)
Full ui/ kit + ChartCard
Deliverables
Repo scaffold, CI pipeline, AI Service Layer, 
admin tools, final integration/deploy


## Page 34

16.2 Suggested Timeline (illustrative, adjust to term length)
Week
Focus
1
Repo scaffold, CI, shared ui/ kit skeleton, AI 
Service Layer stub, Auth module APIs
2
Auth UI complete; design system 
components complete; Vendor/Buyer/RFQ 
modules start against seeded mock data
3–5
Parallel feature build-out per matrix above; 
integrate real AI Service Layer calls
6
Cross-module integration 
(RFQ↔Quote↔Order↔Notifications↔Chat 
events wired end-to-end)
7
Admin tools, analytics, polish, animations 
pass
8
Testing hardening, bug fixes, deployment, 
demo prep
17. Git Workflow
Branching model: simplified Git Flow.
main            → production-ready, tagged releases only
develop         → integration branch, always deployable to staging
feature/auth        (Dev 1)
feature/buyer        (Dev 2)
feature/vendor       (Dev 3)
feature/rfq          (Dev 4)
feature/chat         (Dev 5)
feature/design-system (Dev 5)
feature/admin        (Dev 6)
feature/architecture (Dev 6)
hotfix/*        → urgent production fixes, branched from main, merged 
to both main and develop
Pull Requests - Every feature branch → PR into develop (never direct commits to 
develop/main) - PR template requires: what changed, screenshots/GIF for UI changes, linked 
issue, checklist (tests pass, lint clean, no console.logs) - Minimum 1 approval required (Dev 6 as 
lead reviews all; peers cross-review where domains touch, e.g., Dev 4 reviews Dev 5’s event-bus 
contract changes)
Merge Strategy - Squash-and-merge into develop for a clean linear history - develop → 
main via a release PR at each milestone, merge commit (preserves the integration history)
Commit Convention (Conventional Commits)
feat(auth): add refresh token rotation
fix(rfq): prevent accepting a quote on a closed rfq
chore(ci): add lint step to github actions


## Page 35

docs(readme): update env var list
refactor(vendor): extract cloudinary upload into service
test(order): add status transition guard tests
Branch Protection - main and develop: no force-push, require PR + passing CI + 1 approval - 
Status checks required: lint, unit tests, build
Conflict Resolution - Because each developer owns a distinct set of files/collections/routes 
(per Section 16 matrix), file-level conflicts should be rare - Shared files (app.js route 
mounting, shared/constants.js, eventBus.js contract) are edited via small, frequent 
PRs rather than large batch changes to minimize conflict window - When conflicts do occur: 
the developer who opened the later PR resolves it by rebasing onto latest develop, not by 
force-pushing over the other person’s work
18. Coding Standards
Area
Standard
ESLint
Airbnb or Standard config as a base, extended 
with eslint-plugin-react-hooks, 
eslint-plugin-import; zero warnings 
policy in CI
Prettier
Enforced via lint-staged + husky pre-
commit hook; single quotes, no semicolons or 
with semicolons — team picks one and it’s 
non-negotiable once picked
Folder Naming
kebab-case for folders and non-component 
files, PascalCase for component 
files/directories under 
features/*/components
Component Naming
PascalCase, one component per file, 
filename matches component name 
(VendorCard.jsx)
API Naming
RESTful, plural nouns for collections 
(/api/vendors), kebab-case for multi-
word segments, no verbs in URLs (POST 
/api/quotes/:id/accept is the accepted 
exception for an explicit state-transition 
action)
Environment Variables
SCREAMING_SNAKE_CASE, never 
committed, .env.example kept in sync in 
every PR that adds a new var
Error Handling
Central errorHandler middleware; 
controllers use asyncHandler wrapper (no 
repeated try/catch boilerplate); all errors 
follow the standard error envelope (Section 


## Page 36

Area
Standard
6)
Validation
Joi/Zod schema per route input, colocated in 
validators/, never inline in controllers
Reusable Hooks
hooks/useAuth, useSocket, 
useDebounce, usePagination, 
useDisclosure (modal open/close) — new 
cross-feature logic should become a hook 
before it becomes copy-pasted
Reusable Components
Anything used in 2+ features moves to 
components/ui or components/shared 
with a one-line JSDoc description of props
End of Software Requirements Specification — VendorHub AI.
