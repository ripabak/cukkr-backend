# Issues Checklist: User Profile

**Feature:** User Profile
**Epic:** Cukkr — Barbershop Management & Booking System
**Date:** April 27, 2026

---

## Pre-Creation Preparation

- [ ] **Feature artifacts complete**: PRD (`prd.md`), implementation plan (`implementation-plan.md`) and project plan (`project-plan.md`) all finalized
- [ ] **Epic exists**: Parent epic issue (#E-01) created with proper labels and milestone `v1.0 — Cukkr MVP`
- [ ] **Project board configured**: Columns (Backlog → Sprint Ready → In Progress → In Review → Testing → Done), custom fields (Priority, Value, Component, Estimate, Sprint, Epic), and automation rules set up
- [ ] **Team capacity assessed**: Sprint 1 (13 pts) and Sprint 2 (15 pts) fit within team velocity

---

## Epic Level

- [ ] **#E-01 — Epic: Cukkr — Barbershop Management & Booking System** created
  - Labels: `epic`, `priority-high`, `value-high`
  - Milestone: `v1.0 — Cukkr MVP`
  - Estimate: XL
- [ ] Epic milestone created with target release date
- [ ] Epic labels applied
- [ ] Epic added to project board → **Backlog**

---

## Feature Level

- [ ] **#F-01 — Feature: User Profile** created and linked to #E-01
  - Labels: `feature`, `priority-high`, `value-high`, `backend`
  - Estimate: L (28 pts)
  - Blocked by: Better Auth session pre-existing
- [ ] Feature dependencies documented (none blocking — Better Auth already configured)
- [ ] Feature estimation completed using t-shirt sizing (L)
- [ ] Feature acceptance criteria defined and measurable
- [ ] Feature added to project board → **Backlog**

---

## Technical Enabler Level

- [x] **#EN-01 — Technical Enabler: Storage Client Abstraction (S3-Compatible)**
  - Labels: `enabler`, `priority-high`, `backend`, `infrastructure`
  - Estimate: 3 pts
  - Linked to: #F-01
  - Blocks: #US-03
  - Sprint: Sprint 1
  - Board column: **Backlog**
  - Implemented in: `src/lib/storage.ts`, `src/lib/env.ts`, `.env.example`

- [x] **#EN-02 — Technical Enabler: user-profile Module Scaffold**
  - Labels: `enabler`, `priority-critical`, `backend`, `scaffold`
  - Estimate: 2 pts
  - Linked to: #F-01
  - Blocks: #US-01, #US-02, #US-03, #US-04, #US-05, #US-06
  - Sprint: Sprint 1 (do first)
  - Board column: **Backlog**
  - Implemented in: `src/modules/user-profile/model.ts`, `src/modules/user-profile/handler.ts`, `src/modules/user-profile/service.ts`, `src/app.ts`

- [x] **#EN-03 — Technical Enabler: Phone OTP Helper**
  - Labels: `enabler`, `priority-high`, `backend`, `security`
  - Estimate: 3 pts
  - Linked to: #F-01
  - Blocks: #US-06
  - Sprint: Sprint 1
  - Board column: **Backlog**
  - Implemented in: `src/utils/otp.ts`, `tests/utils/otp.test.ts`

---

## User Story Level

- [x] **#US-01 — User Story: View Profile**
  - Labels: `user-story`, `priority-high`, `backend`
  - Estimate: 2 pts
  - Blocked by: #EN-02
  - Sprint: Sprint 1
  - AC: `GET /api/me` returns full profile (200); unauthenticated returns 401
  - Board column: **Backlog**
  - Implemented in: `src/modules/user-profile/service.ts`, `src/modules/user-profile/handler.ts`
  - Verified in: `tests/modules/user-profile.test.ts` (T-01, T-02)

- [x] **#US-02 — User Story: Edit Name & Bio**
  - Labels: `user-story`, `priority-high`, `backend`
  - Estimate: 2 pts
  - Blocked by: #EN-02, #US-01
  - Sprint: Sprint 1
  - AC: `PATCH /api/me` with validation (422 on empty name, name >100 chars, bio >300 chars)
  - Board column: **Backlog**
  - Implemented in: `src/modules/user-profile/service.ts`, `src/modules/user-profile/handler.ts`
  - Verified in: `tests/modules/user-profile.test.ts` (T-03 to T-07)

- [x] **#US-03 — User Story: Upload Avatar**
  - Labels: `user-story`, `priority-high`, `backend`, `storage`
  - Estimate: 5 pts
  - Blocked by: #EN-01, #EN-02
  - Sprint: Sprint 2
  - AC: `POST /api/me/avatar` valid file → 200; bad MIME → 422; >5 MB → 422
  - Board column: **Backlog**
  - Implemented in: `src/modules/user-profile/service.ts`, `src/modules/user-profile/handler.ts`, `src/lib/storage.ts`
  - Verified in: `tests/modules/user-profile.test.ts` (T-08 to T-10)

- [x] **#US-04 — User Story: Change Password**
  - Labels: `user-story`, `priority-high`, `backend`, `security`
  - Estimate: 1 pt
  - Blocked by: Better Auth (pre-existing)
  - Sprint: Sprint 2
  - AC: Correct password → 200; wrong password → 400; <8 chars → 422; session stays active
  - Board column: **Backlog**
  - Verified via mounted Better Auth route in: `tests/modules/user-profile.test.ts` (T-16, T-17)

- [x] **#US-05 — User Story: Change Email**
  - Labels: `user-story`, `priority-medium`, `backend`, `security`
  - Estimate: 1 pt
  - Blocked by: Better Auth email OTP plugin (pre-existing)
  - Sprint: Sprint 2
  - AC: OTP sent → 202; duplicate email → 409; bad OTP → 400; 6th attempt → 429
  - Board column: **Backlog**
  - Delegated to Better Auth; project-side verification confirmed existing config in `src/lib/auth.ts` and endpoint reachability in `tests/modules/user-profile.test.ts`

- [x] **#US-06 — User Story: Change Phone (OTP)**
  - Labels: `user-story`, `priority-high`, `backend`, `security`
  - Estimate: 5 pts
  - Blocked by: #EN-02, #EN-03
  - Sprint: Sprint 2
  - AC: Valid phone → 202; duplicate phone → 409; correct OTP → 200; bad OTP → 400; expired OTP → 400; 6th attempt → 429
  - Board column: **Backlog**
  - Implemented in: `src/modules/user-profile/service.ts`, `src/modules/user-profile/handler.ts`, `src/utils/otp.ts`
  - Verified in: `tests/modules/user-profile.test.ts` (T-11 to T-15)

- [x] **#US-07 — User Story: Logout**
  - Labels: `user-story`, `priority-medium`, `backend`
  - Estimate: 1 pt
  - Blocked by: Better Auth (pre-existing)
  - Sprint: Sprint 2
  - AC: Sign-out → 200, cookie cleared; subsequent calls → 401
  - Board column: **Backlog**
  - Verified via mounted Better Auth route in: `tests/modules/user-profile.test.ts` (T-18)

---

## Test Level

- [x] **#TE-01 — Test: User Profile Integration Test Suite** (`tests/modules/user-profile.test.ts`)
  - Labels: `test`, `priority-high`, `backend`
  - Estimate: 5 pts total (partial Sprint 1, full Sprint 2)
  - Covers: 18 test cases (T-01 to T-18)
  - Blocked by: All stories above
  - Board column: **Backlog**

  ### Test Case Checklist

  #### Sprint 1 — Profile View & Edit (T-01 to T-07)
  - [x] T-01: `GET /api/me` authenticated → 200, full profile shape
  - [x] T-02: `GET /api/me` unauthenticated → 401
  - [x] T-03: `PATCH /api/me` update name → 200, name updated
  - [x] T-04: `PATCH /api/me` update bio → 200, bio updated
  - [x] T-05: `PATCH /api/me` empty name → 422
  - [x] T-06: `PATCH /api/me` name > 100 chars → 422
  - [x] T-07: `PATCH /api/me` bio > 300 chars → 422

  #### Sprint 2 — Avatar, Phone OTP & Auth (T-08 to T-18)
  - [x] T-08: `POST /api/me/avatar` valid JPEG ≤ 5 MB → 200, avatarUrl returned
  - [x] T-09: `POST /api/me/avatar` invalid MIME type → 422
  - [x] T-10: `POST /api/me/avatar` file > 5 MB → 422
  - [x] T-11: `POST /api/me/change-phone` valid phone → 202
  - [x] T-12: `POST /api/me/change-phone` phone already taken → 409
  - [x] T-13: `POST /api/me/change-phone/verify` correct OTP → 200, phone updated
  - [x] T-14: `POST /api/me/change-phone/verify` wrong OTP → 400
  - [x] T-15: `POST /api/me/change-phone/verify` expired OTP → 400
  - [x] T-16: `POST /auth/api/change-password` correct password → 200
  - [x] T-17: `POST /auth/api/change-password` wrong current password → 400
  - [x] T-18: `POST /auth/api/sign-out` → 200, session cleared

---

## Implementation Task Checklist

### Sprint 1 Tasks

- [x] **#T-01** — Create `src/lib/storage.ts` with `StorageClient` interface + implementation
- [x] **#T-02** — Update `src/lib/env.ts` to expose storage env vars (`STORAGE_ENDPOINT`, `STORAGE_BUCKET`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`)
- [x] **#T-03** — Add storage vars to `.env.example`
- [x] **#T-04** — Scaffold `src/modules/user-profile/model.ts` (all TypeBox DTOs)
- [x] **#T-05** — Scaffold `src/modules/user-profile/handler.ts` (Elysia group `/api/me`)
- [x] **#T-06** — Scaffold `src/modules/user-profile/service.ts` (`UserProfileService` class)
- [x] **#T-07** — Register `userProfileHandler` in `src/app.ts`
- [x] **#T-08** — Implement OTP helper in `src/utils/otp.ts`
- [x] **#T-09** — Write unit tests for OTP helper
- [x] **#T-10** — Implement `UserProfileService.getProfile(userId, activeOrgId)`
- [x] **#T-11** — Implement `GET /api/me` handler
- [x] **#T-12** — Implement `UserProfileService.updateProfile(userId, input)`
- [x] **#T-13** — Implement `PATCH /api/me` handler

### Sprint 2 Tasks

- [x] **#T-14** — Implement `UserProfileService.uploadAvatar(userId, file)` (validate → upload → update `user.image`)
- [x] **#T-15** — Implement `POST /api/me/avatar` handler (multipart/form-data)
- [x] **#T-16** — Verify Better Auth `change-password` endpoint reachable; document flow
- [x] **#T-17** — Confirm `updateEmailWithoutVerification: true` + `sendChangeEmailConfirmation` in `src/lib/auth.ts`
- [x] **#T-18** — Implement `UserProfileService.initiatePhoneChange(userId, newPhone)`
- [x] **#T-19** — Implement `POST /api/me/change-phone` handler
- [x] **#T-20** — Implement `UserProfileService.verifyPhoneChange(userId, phone, otp)`
- [x] **#T-21** — Implement `POST /api/me/change-phone/verify` handler
- [x] **#T-22** — Verify Better Auth `sign-out` endpoint reachable
- [x] **#T-23** — Create `tests/modules/user-profile.test.ts` with `beforeAll` auth setup
- [x] **#T-24** — Implement T-01 to T-07 (profile view & edit tests)
- [x] **#T-25** — Implement T-08 to T-10 (avatar upload tests)
- [x] **#T-26** — Implement T-11 to T-15 (phone OTP flow tests)
- [x] **#T-27** — Implement T-16 to T-18 (delegated auth endpoint tests)

---

## Definition of Done — Feature Completion

- [x] All 27 implementation tasks completed
- [x] All 18 test cases passing: `bun test user-profile`
- [x] `bun run lint:fix` passes — no lint errors
- [x] `bun run format` applied — code is formatted
- [x] `bun run build` succeeds — TypeScript compiles cleanly
- [x] No `console.log` or dead code in committed files
- [x] `.env.example` updated with storage environment variables
- [ ] PR description references #F-01 and all related story issues
