# [Developer 1: Authentication & User Management Implementation Plan] (v2)

This plan outlines the contract-first technical implementation for **Developer 1** (Authentication & User Management module) as specified in the VendorHub AI SRS. Developer 1 is responsible for building the core foundational slice: user registration/login, email verification, password reset, profile management, Cloudinary avatar uploading, and the shared JWT/RBAC middleware suite consumed by all other team members.

The implementation is explicitly structured into **2 Sequential Phases**:
- **Phase 1**: Backend Foundation, Data Models, Services, Middleware & Integration Testing
- **Phase 2**: Frontend Auth UI Pages, Redux Store, RTK Query API Integration & E2E Testing

---

## Rule Compliance Reference

- [api-and-interface-design](file:///C:/Users/moham/.gemini/config/skills/api-and-interface-design/SKILL.md) - Contract-first API design, strict input boundary validation, consistent standard error envelope, and clear RESTful resource definitions.
- [agent-planning](file:///C:/Users/moham/.gemini/config/rules/agent-planning.md) - Goal-oriented versioning, literal detail, and structured task breakdown.
- [typescript-rules](file:///C:/Users/moham/.gemini/config/rules/typescript-rules.md) - Industrial standard strict type safety for contract definitions.
- [git-commit-message-generation](file:///C:/Users/moham/.gemini/config/rules/git-commit-message-generation.md) - Conventional commits format (`feat(auth)`, `fix(auth)`, `chore(auth)`).

---

## User Review Required

> [!IMPORTANT]
> **Key Architecture Decisions for Dev 1:**
> 1. **JWT Storage**: Access tokens (15-minute TTL) are kept **in-memory only** (Redux store) to defend against XSS. Refresh tokens (7-day TTL) are issued as `httpOnly`, `SameSite=Strict`, `Secure` cookies.
> 2. **Token Rotation & Reuse Detection**: Upon refreshing via `/api/auth/refresh`, the refresh token is rotated. If an old/reused refresh token is presented (potential token theft), the entire `refreshTokenFamily` is invalidated immediately, forcing re-authentication.
> 3. **Unverified Vendor Protection**: Vendors with `isVerified: false` cannot publish storefront profiles or log in if restricted by business rules. Buyers can browse immediately.
> 4. **Shared Middleware Responsibility**: Dev 1 implements `authenticate`, `authorize`, `rateLimit`, and standard `errorHandler` middleware that all other developers (Dev 2–6) will import.

---

## Open Questions

> [!NOTE]
> None currently. All requirements are derived directly from Section 3.1, Section 5, Section 7, and Section 12 of `VendorHub_AI_SRS.md`.

---

## REST API Contracts (Contract-First Design)

### Standard Envelopes

#### Success Envelope (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2026-08-04T09:25:00.000Z"
  }
}
```

#### Error Envelope (`400`, `401`, `403`, `404`, `409`, `422`, `429`, `500`)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid registration data",
    "fields": {
      "email": "Email must be a valid email address",
      "password": "Password must contain at least 1 uppercase letter and 1 symbol"
    }
  }
}
```

### Endpoints Specification

| Method | Endpoint | Access | Purpose | Request Body / Params | Response Data |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Create account | `{ name, email, password, role, companyName? }` | `{ user: UserPayload }` |
| `POST` | `/api/auth/verify-email/:token` | Public | Verify email link | Params: `token` | `{ message: string }` |
| `POST` | `/api/auth/login` | Public | Authenticate user | `{ email, password }` | `{ user: UserPayload, accessToken: string }` (Set-Cookie: `refreshToken`) |
| `POST` | `/api/auth/refresh` | Cookie | Rotate access & refresh tokens | Cookie: `refreshToken` | `{ accessToken: string }` (Set-Cookie: new `refreshToken`) |
| `POST` | `/api/auth/logout` | Bearer | Revoke refresh token | Headers: `Authorization: Bearer <token>` | `{ message: string }` (Clears Cookie) |
| `POST` | `/api/auth/forgot-password` | Public | Request reset email | `{ email }` | `{ message: string }` |
| `POST` | `/api/auth/reset-password/:token` | Public | Set new password | Params: `token`, Body: `{ password }` | `{ message: string }` |
| `GET` | `/api/users/me` | Bearer | Get current user profile | Headers: `Authorization: Bearer <token>` | `{ user: UserPayload }` |
| `PATCH` | `/api/users/me` | Bearer | Update user profile | `{ name?, companyName? }` | `{ user: UserPayload }` |
| `POST` | `/api/users/me/avatar` | Bearer | Upload avatar image | Multipart Form: `file` | `{ avatarUrl: string, avatarPublicId: string }` |
| `DELETE` | `/api/users/me` | Bearer | Soft delete/deactivate user account | Headers: `Authorization: Bearer <token>` | `{ message: string }` (Clears Cookie) |
| `POST` | `/api/users/me/restore` | Bearer | Restore soft-deleted account | Headers: `Authorization: Bearer <token>` | `{ user: UserPayload }` |

---

## Phased Implementation Roadmap

---

### PHASE 1: Backend Foundation & Shared Middleware (`server/`)

Phase 1 establishes the database collection, data models, boundary input schemas, business logic controllers, email/cloud services, soft delete lifecycle, and the team-wide middleware suite.

#### 1. Database Schema & Mongoose Model
- #### [NEW] [User.js](file:///c:/Users/moham/Desktop/projects/codecelix/vendor-hub/server/src/models/User.js)
  - Mongoose schema for `users` collection:
    - `_id: ObjectId`
    - `name: { type: String, required: true, trim: true }`
    - `email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true }`
    - `passwordHash: { type: String, required: true, select: false }`
    - `role: { type: String, enum: ['buyer', 'vendor', 'admin'], required: true }`
    - `isVerified: { type: Boolean, default: false }`
    - `isDeleted: { type: Boolean, default: false, index: true }`
    - `deletedAt: { type: Date, default: null }`
    - `verificationTokenHash: String`, `verificationTokenExpiresAt: Date`
    - `resetPasswordTokenHash: String`, `resetPasswordExpiresAt: Date`
    - `avatarUrl: String`, `avatarPublicId: String`
    - `companyName: String` (required validation if `role === 'vendor'`)
    - `refreshTokenFamily: String` (UUID for rotation tracking)
    - `plan: { type: String, enum: ['free', 'pro', 'business', 'enterprise'], default: 'free' }`
    - `provider: String`, `providerId: String` (nullable, for future OAuth stubbing)
    - Timestamps (`createdAt`, `updatedAt`)
  - Methods: `toUserPayload()`, `softDelete()`, `restore()`

#### 2. Team-Wide Middleware Suite
- #### [NEW] [authenticate.js](file:///c:/Users/moham/Desktop/projects/codecelix/vendor-hub/server/src/middleware/authenticate.js)
  - Verifies JWT in `Authorization: Bearer <token>`, attaches `req.user = { id, role, email }`.
- #### [NEW] [authorize.js](file:///c:/Users/moham/Desktop/projects/codecelix/vendor-hub/server/src/middleware/authorize.js)
  - Role guard `authorize(...allowedRoles)` verifying `req.user.role`.
- #### [NEW] [validate.js](file:///c:/Users/moham/Desktop/projects/codecelix/vendor-hub/server/src/middleware/validate.js)
  - Validates `req.body`, `req.params`, or `req.query` against Zod schemas.
- #### [NEW] [rateLimiter.js](file:///c:/Users/moham/Desktop/projects/codecelix/vendor-hub/server/src/middleware/rateLimiter.js)
  - Rate limiting for `/api/auth/login` (5 attempts / 15 min per IP+email) and `/api/auth/forgot-password` (1 req / 5 min).
- #### [NEW] [errorHandler.js](file:///c:/Users/moham/Desktop/projects/codecelix/vendor-hub/server/src/middleware/errorHandler.js)
  - Centralized error handler returning the standard error envelope.

#### 3. Validation Schemas & Services
- #### [NEW] [auth.validator.js](file:///c:/Users/moham/Desktop/projects/codecelix/vendor-hub/server/src/validators/auth.validator.js)
  - Zod schemas for register, login, forgotPassword, resetPassword, profileUpdate.
- #### [NEW] [services/emailService.js](file:///c:/Users/moham/Desktop/projects/codecelix/vendor-hub/server/src/services/emailService.js)
  - Sends email verification and password reset emails via Nodemailer/SMTP.
- #### [NEW] [services/cloudinaryService.js](file:///c:/Users/moham/Desktop/projects/codecelix/vendor-hub/server/src/services/cloudinaryService.js)
  - Uploads avatar images to Cloudinary and deletes old avatars.

#### 4. Controllers & Express Routes
- #### [NEW] [controllers/auth.controller.js](file:///c:/Users/moham/Desktop/projects/codecelix/vendor-hub/server/src/controllers/auth.controller.js)
  - Implements `register`, `verifyEmail`, `login`, `refresh`, `logout`, `forgotPassword`, `resetPassword`. Rejects authentication for soft-deleted users.
- #### [NEW] [controllers/user.controller.js](file:///c:/Users/moham/Desktop/projects/codecelix/vendor-hub/server/src/controllers/user.controller.js)
  - Implements `getMe`, `updateProfile`, `uploadAvatar`, `deleteMe` (Soft delete), `restoreMe`.
- #### [NEW] [routes/auth.routes.js](file:///c:/Users/moham/Desktop/projects/codecelix/vendor-hub/server/src/routes/auth.routes.js)
  - Mounts `/api/auth/*` routes.
- #### [NEW] [routes/user.routes.js](file:///c:/Users/moham/Desktop/projects/codecelix/vendor-hub/server/src/routes/user.routes.js)
  - Mounts `/api/users/*` routes.

#### 5. Phase 1 Verification (Backend Tests)
- `auth.controller.test.js`: Password hashing, token generation, payload sanitization.
- `authenticate.test.js` & `authorize.test.js`: JWT header parsing, role checks.
- `auth.integration.test.js`: Complete Supertest integration testing against MongoDB In-Memory Server.

---

### PHASE 2: Frontend Auth Pages, State & Integration (`VendorHub-AI/client/src/`)

Phase 2 builds the user interface, connects Redux Toolkit and RTK Query with silent refresh interceptors, Cloudinary avatar uploader, and soft delete UI lifecycle workflows in `VendorHub-AI/client`.

#### 1. Redux Store & API Interceptors
- #### [NEW] [axiosBaseQuery.js](file:///c:/Users/moham/Desktop/projects/codecelix/VendorHub-AI/client/src/lib/axiosBaseQuery.js)
  - Custom base query for RTK Query that handles automatic `401 Unauthorized` token refresh retries seamlessly.
- #### [NEW] [store/slices/authSlice.js](file:///c:/Users/moham/Desktop/projects/codecelix/VendorHub-AI/client/src/store/slices/authSlice.js)
  - Redux slice holding in-memory `accessToken`, `user` object, `isAuthenticated`, and `isInitialized` status.
- #### [NEW] [store/api/authApi.js](file:///c:/Users/moham/Desktop/projects/codecelix/VendorHub-AI/client/src/store/api/authApi.js)
  - RTK Query endpoints for auth, user profile, avatar upload, `deleteAccount` (Soft delete), and `restoreAccount`.
- #### [NEW] [store/index.js](file:///c:/Users/moham/Desktop/projects/codecelix/VendorHub-AI/client/src/store/index.js)
  - Redux store configuration combining `authSlice` and `authApi`.

#### 2. Reusable Components & Layout
- #### [NEW] [AuthCard.jsx](file:///c:/Users/moham/Desktop/projects/codecelix/VendorHub-AI/client/src/features/auth/components/AuthCard.jsx)
  - Framer-motion entrance animation container with glassmorphism styling.
- #### [NEW] [RoleToggle.jsx](file:///c:/Users/moham/Desktop/projects/codecelix/VendorHub-AI/client/src/features/auth/components/RoleToggle.jsx)
  - Buyer/Vendor segmented role selector button group.
- #### [NEW] [DeactivateModal.jsx](file:///c:/Users/moham/Desktop/projects/codecelix/VendorHub-AI/client/src/features/auth/components/DeactivateModal.jsx)
  - Soft-delete confirmation modal with warning & action trigger.
- #### [NEW] [ProtectedRoute.jsx](file:///c:/Users/moham/Desktop/projects/codecelix/VendorHub-AI/client/src/components/ProtectedRoute.jsx)
  - Authenticated route guard with role checks.
- #### [NEW] [Navbar.jsx](file:///c:/Users/moham/Desktop/projects/codecelix/VendorHub-AI/client/src/components/Navbar.jsx)
  - Global navigation bar with avatar dropdown, settings, and logout.

#### 3. Auth Pages & Router
- #### [NEW] [pages/RegisterPage.jsx](file:///c:/Users/moham/Desktop/projects/codecelix/VendorHub-AI/client/src/features/auth/pages/RegisterPage.jsx) (`/register`)
- #### [NEW] [pages/LoginPage.jsx](file:///c:/Users/moham/Desktop/projects/codecelix/VendorHub-AI/client/src/features/auth/pages/LoginPage.jsx) (`/login`) with `ACCOUNT_DELETED` restore banner.
- #### [NEW] [pages/VerifyEmailPage.jsx](file:///c:/Users/moham/Desktop/projects/codecelix/VendorHub-AI/client/src/features/auth/pages/VerifyEmailPage.jsx) (`/verify-email/:token`)
- #### [NEW] [pages/ForgotPasswordPage.jsx](file:///c:/Users/moham/Desktop/projects/codecelix/VendorHub-AI/client/src/features/auth/pages/ForgotPasswordPage.jsx) (`/forgot-password`)
- #### [NEW] [pages/ResetPasswordPage.jsx](file:///c:/Users/moham/Desktop/projects/codecelix/VendorHub-AI/client/src/features/auth/pages/ResetPasswordPage.jsx) (`/reset-password/:token`)
- #### [NEW] [pages/SettingsPage.jsx](file:///c:/Users/moham/Desktop/projects/codecelix/VendorHub-AI/client/src/features/auth/pages/SettingsPage.jsx) (`/settings`) Profile, Cloudinary avatar uploader & Danger Zone soft-delete triggers.
- #### [NEW] [pages/DashboardPage.jsx](file:///c:/Users/moham/Desktop/projects/codecelix/VendorHub-AI/client/src/pages/DashboardPage.jsx) (`/dashboard`)
- #### [MODIFY] [App.jsx](file:///c:/Users/moham/Desktop/projects/codecelix/VendorHub-AI/client/src/App.jsx) Initial silent refresh session boot and router configuration.

#### 4. Phase 2 Verification (End-to-End & Manual Testing)
- Manual workflow check: Register (Buyer & Vendor) -> Verification Email -> Login -> Token Refresh -> Profile Update -> Avatar Upload -> Soft Delete -> Account Restore -> Reset Password -> Logout.

---

## Verification Plan Summary

### Phase 1 Verification (Automated Backend Tests)
- `npm run test` executing:
  - Unit tests for password hashing (`bcrypt`), JWT sign/verify, and rate limiters.
  - Integration tests for registration, email verification, cookie setting, silent token rotation, and reuse detection token family revocation.

### Phase 2 Verification (Frontend & E2E)
- E2E flow testing: User registration, receiving activation link, logging in, managing profile in `/settings`, uploading avatar image to Cloudinary, and logging out.
