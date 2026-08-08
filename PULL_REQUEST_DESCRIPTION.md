# Pull Request: Full-Stack Authentication Suite & Soft Delete Lifecycle

## 📌 PR Overview
- **Target Branch**: `develop`
- **Source Branch**: `feature/auth`
- **Type of Change**: `feat` (New Feature & Architecture Hardening)

---

## 🚀 Summary of Changes

This Pull Request introduces the complete **Full-Stack Authentication & Account Lifecycle Suite** for **VendorHub AI**. It links the Node.js/Express backend (`server`) with the React/Redux Toolkit frontend (`client`) using shared type contracts (`shared/constants.js`).

---

## ⚡ Key Capabilities Added

### 1. Soft Delete User Account Lifecycle (Phase 1 & 2 Directive)
- **Database Schema**: Added `isDeleted: Boolean` (indexed) and `deletedAt: Date` fields to Mongoose `User` model.
- **Backend Enforcements**:
  - `DELETE /api/users/me` marks account as soft-deleted, invalidates `refreshTokenFamily`, and revokes cookies.
  - `POST /api/auth/login` and `POST /api/auth/refresh` block soft-deleted users with `401 ACCOUNT_DELETED`.
  - `POST /api/users/me/restore` enables self-service account restoration upon valid credentials.
- **Frontend Interception**:
  - `LoginPage.jsx` intercepts `ACCOUNT_DELETED` response code and displays a dedicated restoration banner.
  - `DeactivateModal.jsx` provides an interactive confirmation dialog with type-to-confirm protection (`deactivate`).

### 2. Secure Token Management & Session Security
- **In-Memory JWT Access Tokens**: Short-lived access tokens (15-min TTL) are stored exclusively in Redux in-memory state (`authSlice.js`), eliminating XSS token extraction vulnerabilities.
- **HTTP-Only Refresh Cookies**: Refresh tokens (7-day TTL) are stored in `httpOnly`, `SameSite=Strict`, `Secure` cookies.
- **Token Family Rotation & Theft Detection**: Upon refresh, token family rotates. Reused tokens trigger automatic revocation of the entire `refreshTokenFamily`.
- **Mutex-Locked Token Queue**: `axiosBaseQuery.js` handles `401 Unauthorized` token expiry with an Async Mutex to prevent request storms.

### 3. User Profile Management & Cloudinary Avatars
- **Profile Updates**: Endpoint `PATCH /api/users/me` allows updating name and company name (vendor role).
- **Cloudinary Avatar Upload**: Endpoint `POST /api/users/me/avatar` accepts `multipart/form-data` with 5MB file caps and image mimetype filtering.
- **Key-Based Component State**: `SettingsPage.jsx` refactored using `key={user.id}` for state initialization, eliminating cascading re-renders.

### 4. Input Boundary Validation & Rate Limiting
- Zod schemas (`auth.validator.js`) validate all registration, login, and password reset requests.
- `express-mongo-sanitize` strips NoSQL operator injections.
- Express rate limiters applied on auth routes (`loginLimiter`: 5 req/15 min; `forgotPasswordLimiter`: 1 req/5 min).

---

## 🧪 Verification & Testing Results

| Verification Axis | Command | Result |
| :--- | :--- | :--- |
| **Backend Integration Suite** | `npm test` in `VendorHub-AI/server` | **PASS**: 3 test suites, 15 tests passed (`16.39s`) |
| **Dependency Security Audit** | `npm audit` in `VendorHub-AI/server` | **PASS**: `0 vulnerabilities` |
| **Frontend Production Build** | `npm run build` in `VendorHub-AI/client` | **PASS**: Built in `852ms` (514 modules transformed, 0 warnings/errors) |
| **Browser Runtime Verification** | Chrome DevTools MCP | Verified visual layout, role toggles, and zero console errors. |

---

## 🔍 Checklist for Reviewers

- [x] Code adheres to Conventional Commits and project guidelines
- [x] Soft delete implementation handles account deactivation and restoration cleanly
- [x] Access tokens stored in-memory; refresh tokens in HTTP-only cookies
- [x] All boundary inputs validated with Zod schemas
- [x] Automated integration test suite passing (15/15)
- [x] Supply-chain dependencies audited with zero vulnerabilities
- [x] Keyboard focus management and WCAG 2.1 AA accessibility standards verified
