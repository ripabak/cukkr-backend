# Feature PRD: Unified Profile Contract

**Version:** 1.0
**Date:** April 28, 2026
**Status:** Draft

---

## 1. Feature Name

**Unified Profile Contract**

Standardize all authenticated profile read and write operations under the `/api/me` contract family so mobile profile flows no longer depend on overlapping auth-profile routes.

---

## 2. Epic

- **Parent Epic:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../epic.md)
- **Parent Step PRD:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../../../../PRD_STEP2.md)
- **Parent Architecture:** Not yet authored for this epic.

---

## 3. Goal

### Problem

Profile management is currently fragmented across `/api/me` and legacy auth-profile surfaces, which creates ambiguity for mobile integration and increases the risk of frontend drift. The profile screen needs a single authoritative contract for reading and mutating user data, including related flows such as avatar updates and phone changes. As long as `PATCH /api/auth/profile` remains part of the active surface, engineering teams can continue wiring against competing endpoints with inconsistent ownership. This creates avoidable maintenance cost and weakens Step 2 contract consolidation.

### Solution

Make `/api/me` the single owner for profile read and mutation contracts. Keep all profile-adjacent actions within the same contract family, including avatar upload and phone change verification flows. Remove `PATCH /api/auth/profile` from the supported Step 2 surface and update tests so profile write coverage depends only on `/api/me` endpoints.

### Impact

- Eliminate profile contract ambiguity for mobile integration.
- Reduce the risk of frontend workarounds or dual-write implementations.
- Improve maintainability by centralizing ownership inside the user-profile module.
- Create a clearer migration boundary for removing legacy profile mutation usage.

---

## 4. User Personas

| Persona | Role | Relevance |
|---|---|---|
| **Barbershop Owner** | `owner` | Reads and updates personal profile data through the mobile app. |
| **Barber** | `barber` | Reads and updates personal profile data through the mobile app. |
| **Frontend Integrator** | Internal | Needs one stable contract family for profile screens and related actions. |

---

## 5. User Stories

- **US-01:** As a **Frontend Integrator**, I want all profile reads and writes to go through `/api/me` so that profile state is implemented against one authoritative backend contract.
- **US-02:** As an **Owner or Barber**, I want to update my basic profile through `/api/me` so that my name and bio stay current.
- **US-03:** As an **Owner or Barber**, I want avatar and phone-change actions to remain under the same `/api/me` contract family so that the profile area behaves consistently.
- **US-04:** As a **Frontend Integrator**, I want the legacy `PATCH /api/auth/profile` route removed from supported Step 2 usage so that new frontend work does not bind to a deprecated surface.
- **US-05:** As a **QA/Engineering team member**, I want integration tests to cover the final `/api/me` contract family so that regressions are caught before delivery.

---

## 6. Requirements

### Functional Requirements

- `GET /api/me` must remain the authoritative authenticated profile read endpoint for Step 2.
- `PATCH /api/me` must be the authoritative profile mutation endpoint for editable personal fields used by the mobile profile screen.
- `/api/me/avatar`, `/api/me/change-phone`, and `/api/me/change-phone/verify` must remain part of the same supported profile contract family.
- The supported Step 2 contract must not require `PATCH /api/auth/profile` for any mobile profile flow.
- Existing editable fields currently used by the mobile profile screen must be writable through `/api/me` without requiring a secondary profile endpoint.
- The `/api/me` response model must expose the fields required to render the current mobile profile screen after a successful mutation.
- The backend documentation for Step 2 must treat `/api/me` as the canonical profile surface.
- Integration tests must validate profile updates through `/api/me` and verify that related profile sub-actions continue to work under the same contract family.

### Non-Functional Requirements

- **Security:** All `/api/me` endpoints must remain protected by Better Auth session middleware.
- **Contract Consistency:** No duplicate supported mutation contract may exist for the same editable profile fields in Step 2 documentation.
- **Backward Risk Control:** Removal of the legacy supported route must be paired with regression coverage for all required mobile profile fields.
- **Maintainability:** Profile ownership must stay inside the user-profile module rather than split across auth and profile modules.
- **Validation:** Server-side validation for editable fields must remain explicit and deterministic.

---

## 7. Acceptance Criteria

### AC-01: Canonical Profile Read and Write

- [ ] `GET /api/me` returns the authenticated user's profile data required by the mobile profile screen.
- [ ] `PATCH /api/me` updates the supported editable profile fields and returns the updated profile payload.
- [ ] No current mobile profile write flow requires `PATCH /api/auth/profile`.

### AC-02: Related Profile Actions Stay Under `/api/me`

- [ ] Avatar upload remains available under `/api/me/avatar`.
- [ ] Phone change initiation remains available under `/api/me/change-phone`.
- [ ] Phone change verification remains available under `/api/me/change-phone/verify`.

### AC-03: Legacy Surface Removal from Step 2

- [ ] `PATCH /api/auth/profile` is removed from Step 2 supported backend surface documentation.
- [ ] Integration tests for profile mutation use `/api/me` rather than the legacy auth-profile route.

### AC-04: Regression Safety

- [ ] Automated integration coverage proves the current mobile profile edit flow can complete using only `/api/me` contract family endpoints.
- [ ] Unauthenticated access to protected profile routes returns the expected auth error.

---

## 8. Out of Scope

- Replacing or redesigning the Better Auth session model.
- Adding new profile capabilities beyond Step 2 screen requirements.
- Email-change redesign outside the existing supported profile family.
- New social identity providers or account-linking workflows.