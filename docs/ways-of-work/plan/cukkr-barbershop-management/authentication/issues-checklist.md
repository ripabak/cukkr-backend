# Issue Creation Checklist: Authentication & User Management

**Version:** 1.0
**Date:** April 26, 2026
**Status:** Draft
**Project Plan:** [project-plan.md](./project-plan.md)
**Feature PRD:** [prd.md](./prd.md)
**Implementation Plan:** [implementation-plan.md](./implementation-plan.md)

> Use this checklist to track GitHub issue creation and project board setup. Check each item
> once the corresponding issue is created and the issue number is recorded.

---

## Pre-Creation Preparation

- [ ] **Feature artifacts complete**: PRD, implementation plan, and project plan all reviewed
- [ ] **Epic issue created**: Parent epic issue exists with labels and milestone
- [ ] **GitHub project board configured**: Columns (Backlog → Done), custom fields (Priority, Value, Component, Estimate, Sprint, Epic), and automation rules set up
- [ ] **Required labels created** on the repository:
  - [ ] `epic`
  - [ ] `feature`
  - [ ] `user-story`
  - [ ] `enabler`
  - [ ] `priority-critical`
  - [ ] `priority-high`
  - [ ] `priority-medium`
  - [ ] `priority-low`
  - [ ] `value-high`
  - [ ] `value-medium`
  - [ ] `value-low`
  - [ ] `auth`
  - [ ] `database`
  - [ ] `backend`
  - [ ] `infrastructure`
  - [ ] `multi-tenant`
- [ ] **Milestone created**: e.g. `v1.0 — Authentication & User Management`

---

## Epic Level

| # | Issue Title | Labels | Estimate | Issue # | Done |
|---|---|---|---|---|---|
| E-01 | Epic: Cukkr — Barbershop Management & Booking System | `epic`, `priority-critical`, `value-high` | XL | — | [ ] |

### E-01 Checklist
- [ ] Epic issue body uses the Epic Issue Template from `project-plan.md §3`
- [ ] Epic issue assigned to the project board milestone
- [ ] Epic added to GitHub Project board in **Backlog** column
- [ ] Epic labels applied: `epic`, `priority-critical`, `value-high`

---

## Feature Level

| # | Issue Title | Labels | Estimate | Parent Epic | Issue # | Done |
|---|---|---|---|---|---|---|
| F-01 | Feature: Authentication & User Management | `feature`, `priority-critical`, `value-high`, `auth` | L | E-01 | — | [ ] |

### F-01 Checklist
- [ ] Feature issue body uses the Feature Issue Template from `project-plan.md §3`
- [ ] Feature issue references parent epic (#E-01)
- [ ] Feature issue lists all 8 user stories and 3 enablers as sub-items (with `#TBD` placeholders until stories are created)
- [ ] Feature issue added to project board in **Backlog** column
- [ ] All labels applied

---

## Technical Enabler Issues

| # | Issue Title | Labels | Estimate | Blocked By | Blocks | Issue # | Done |
|---|---|---|---|---|---|---|---|
| EN-01 | Technical Enabler: Schema Extension — phone + bio fields | `enabler`, `priority-critical`, `backend`, `database` | 2 pts | — | S-05, S-07 | — | [ ] |
| EN-02 | Technical Enabler: Better Auth Configuration Hardening | `enabler`, `priority-critical`, `backend`, `auth` | 2 pts | EN-01 | S-01, S-02, S-03, S-04, S-06, S-08 | — | [ ] |
| EN-03 | Technical Enabler: SMTP Retry Logic | `enabler`, `priority-high`, `backend`, `infrastructure` | 2 pts | — | S-01, S-03 | — | [ ] |

### EN-01 Checklist
- [ ] Issue created with Technical Enabler Template
- [ ] Tasks listed: T-01 (schema columns), T-02 (migration)
- [ ] Stories enabled: S-05 (Phone Change), S-07 (Profile Update) referenced
- [ ] Sprint 1 assigned
- [ ] Component field: `Schema`

### EN-02 Checklist
- [ ] Issue created with Technical Enabler Template
- [ ] Tasks listed: T-03 (emailOTP options), T-04 (rateLimit + password + additionalFields)
- [ ] Stories enabled: S-01, S-02, S-03, S-04, S-06, S-08 referenced
- [ ] Blocked by: EN-01 noted
- [ ] Sprint 1 assigned
- [ ] Component field: `auth`

### EN-03 Checklist
- [ ] Issue created with Technical Enabler Template
- [ ] Task listed: T-05 (retry wrapper in mail.ts)
- [ ] Stories enabled: S-01, S-03 referenced
- [ ] Sprint 1 assigned
- [ ] Component field: `Infrastructure`

---

## User Story Issues

| # | Issue Title | Labels | Estimate | Blocked By | Sprint | Issue # | Done |
|---|---|---|---|---|---|---|---|
| S-01 | User Story: Registration + OTP Verification (US-01–04) | `user-story`, `priority-critical`, `auth` | 3 pts | EN-01, EN-02, EN-03 | Sprint 1 | — | [ ] |
| S-02 | User Story: Login, Session & Logout (US-05–07) | `user-story`, `priority-critical`, `auth` | 2 pts | EN-02 | Sprint 1 | — | [ ] |
| S-03 | User Story: Forgot Password Flow (US-08–11) | `user-story`, `priority-high`, `auth` | 2 pts | EN-02, EN-03 | Sprint 2 | — | [ ] |
| S-04 | User Story: Email Change (US-12) | `user-story`, `priority-high`, `auth` | 2 pts | EN-02 | Sprint 2 | — | [ ] |
| S-05 | User Story: Phone Change (US-13) | `user-story`, `priority-high`, `auth` | 5 pts | EN-01, EN-02, EN-03 | Sprint 2 | — | [ ] |
| S-06 | User Story: Password Change — Authenticated (US-14) | `user-story`, `priority-medium`, `auth` | 1 pt | EN-02 | Sprint 2 | — | [ ] |
| S-07 | User Story: Profile Update (US-15) | `user-story`, `priority-high`, `auth` | 3 pts | EN-01 | Sprint 2 | — | [ ] |
| S-08 | User Story: Multi-Tenant Organization Context (US-16–17) | `user-story`, `priority-high`, `auth`, `multi-tenant` | 2 pts | EN-02 | Sprint 3 | — | [ ] |

### Per-Story Checklist Template

#### S-01 — Registration + OTP Verification
- [ ] Issue created with User Story Template
- [ ] Story statement (As a … I want … so that …) present
- [ ] All 7 acceptance criteria from `project-plan.md §3` listed as checkboxes
- [ ] Tasks: T-03, T-04 cross-referenced
- [ ] Test task cross-referenced (T-10)
- [ ] Blocked by: EN-01, EN-02, EN-03 noted
- [ ] Sprint 1 assigned; Component: `auth`

#### S-02 — Login, Session & Logout
- [ ] Issue created with User Story Template
- [ ] 5 acceptance criteria listed
- [ ] Tasks: T-04 (rateLimit) cross-referenced
- [ ] Test task cross-referenced (T-10)
- [ ] Blocked by: EN-02 noted
- [ ] Sprint 1 assigned; Component: `auth`

#### S-03 — Forgot Password Flow
- [ ] Issue created with User Story Template
- [ ] 5 acceptance criteria listed
- [ ] Test task cross-referenced (T-10)
- [ ] Blocked by: EN-02, EN-03 noted
- [ ] Sprint 2 assigned; Component: `auth`

#### S-04 — Email Change
- [ ] Issue created with User Story Template
- [ ] 5 acceptance criteria listed
- [ ] Test task cross-referenced (T-10)
- [ ] Blocked by: EN-02 noted
- [ ] Sprint 2 assigned; Component: `auth`

#### S-05 — Phone Change
- [ ] Issue created with User Story Template
- [ ] 8 acceptance criteria listed
- [ ] Tasks: T-06 (model), T-07 (service), T-08 (handler), T-09 (app.ts) cross-referenced
- [ ] Test task cross-referenced (T-10)
- [ ] Blocked by: EN-01, EN-02, EN-03 noted
- [ ] Sprint 2 assigned; Component: `Service`, `Handler`

#### S-06 — Password Change
- [ ] Issue created with User Story Template
- [ ] 5 acceptance criteria listed
- [ ] Test task cross-referenced (T-10)
- [ ] Blocked by: EN-02 noted
- [ ] Sprint 2 assigned; Component: `auth`

#### S-07 — Profile Update
- [ ] Issue created with User Story Template
- [ ] 5 acceptance criteria listed
- [ ] Tasks: T-06 (model), T-07 (service), T-08 (handler) cross-referenced
- [ ] Test task cross-referenced (T-10)
- [ ] Blocked by: EN-01 noted
- [ ] Sprint 2 assigned; Component: `Handler`, `Service`

#### S-08 — Multi-Tenant Org Context
- [ ] Issue created with User Story Template
- [ ] 5 acceptance criteria listed
- [ ] Test task cross-referenced (T-10)
- [ ] Blocked by: EN-02 noted
- [ ] Sprint 3 assigned; Component: `auth`, `multi-tenant`

---

## Implementation Task Issues

| # | Task Title | File | Parent | Estimate | Sprint | Issue # | Done |
|---|---|---|---|---|---|---|---|
| T-01 | Task: Add phone + bio columns to auth schema | `src/modules/auth/schema.ts` | EN-01 | 1 pt | Sprint 1 | — | [ ] |
| T-02 | Task: Generate and apply Drizzle migration | CLI | EN-01 | 1 pt | Sprint 1 | — | [ ] |
| T-03 | Task: Update emailOTP plugin options | `src/lib/auth.ts` | EN-02 | 1 pt | Sprint 1 | — | [ ] |
| T-04 | Task: Add rateLimit + password.minLength + requireEmailVerification + additionalFields | `src/lib/auth.ts` | EN-02 | 1 pt | Sprint 1 | — | [ ] |
| T-05 | Task: Wrap sendMail in exponential-backoff retry loop | `src/lib/mail.ts` | EN-03 | 2 pts | Sprint 1 | — | [ ] |
| T-06 | Task: Create model.ts — UpdateProfileBody, PhoneSendOtpBody, PhoneVerifyOtpBody | `src/modules/auth/model.ts` | S-05, S-07 | 1 pt | Sprint 2 | — | [ ] |
| T-07 | Task: Create service.ts — updateProfile, sendPhoneOtp, verifyPhoneOtp | `src/modules/auth/service.ts` | S-05, S-07 | 3 pts | Sprint 2 | — | [ ] |
| T-08 | Task: Create handler.ts — PATCH /profile, POST /phone/send-otp, POST /phone/verify-otp | `src/modules/auth/handler.ts` | S-05, S-07 | 3 pts | Sprint 2 | — | [ ] |
| T-09 | Task: Register authHandler in app.ts | `src/app.ts` | S-05, S-07 | 1 pt | Sprint 2 | — | [ ] |
| T-10 | Task: Expand auth.test.ts — full PRD user story coverage | `tests/modules/auth.test.ts` | All Stories | 5 pts | Sprint 3 | — | [ ] |
| T-11 | Task: Run lint:fix + format — quality gate | CLI | Feature | 0 pts | Sprint 3 | — | [ ] |

### Per-Task Checklist

#### T-01 — Add phone + bio columns
- [ ] Issue created; body references EN-01
- [ ] Acceptance criteria: columns added, nullable, phone unique
- [ ] Sprint 1 assigned; Component: `Schema`

#### T-02 — Generate and apply migration
- [ ] Issue created; body references EN-01 and T-01 (blocked by T-01)
- [ ] Acceptance criteria: migration file committed, `drizzle-kit migrate` runs cleanly
- [ ] Sprint 1 assigned; Component: `Schema`

#### T-03 — emailOTP plugin options
- [ ] Issue created; body references EN-02
- [ ] Acceptance criteria: `otpLength: 4`, `expiresIn: 300`, `maxAttempts: 5`, `sendVerificationOnSignUp: true` set
- [ ] Sprint 1 assigned; Component: `auth`

#### T-04 — rateLimit + password config + additionalFields
- [ ] Issue created; body references EN-02
- [ ] Acceptance criteria: `rateLimit.enabled`, `password.minLength: 8`, `requireEmailVerification: true`, `additionalFields` for phone and bio
- [ ] Sprint 1 assigned; Component: `auth`

#### T-05 — SMTP retry logic
- [ ] Issue created; body references EN-03
- [ ] Acceptance criteria: max 3 attempts, exponential back-off, transient error detection, non-transient fails immediately
- [ ] Sprint 1 assigned; Component: `Infrastructure`

#### T-06 — Create model.ts
- [ ] Issue created; body references S-05, S-07
- [ ] Acceptance criteria: TypeBox schemas for `UpdateProfileBody`, `PhoneSendOtpBody`, `PhoneVerifyOtpBody` per implementation plan §API Design
- [ ] Sprint 2 assigned; Component: `Service`

#### T-07 — Create service.ts
- [ ] Issue created; body references S-05, S-07, blocked by T-06
- [ ] Acceptance criteria: `updateProfile`, `sendPhoneOtp`, `verifyPhoneOtp` implemented; in-memory rate-limit map for phone OTP
- [ ] Sprint 2 assigned; Component: `Service`

#### T-08 — Create handler.ts
- [ ] Issue created; body references S-05, S-07, blocked by T-06, T-07
- [ ] Acceptance criteria: three routes wired, `requireAuth` macro on all, OTP resend rate-limit guard (3/userId/15min)
- [ ] Sprint 2 assigned; Component: `Handler`

#### T-09 — Register authHandler in app.ts
- [ ] Issue created; blocked by T-08
- [ ] Acceptance criteria: `authHandler` imported and `.use()`d under `/api` group; existing module registrations unaffected
- [ ] Sprint 2 assigned; Component: `Handler`

#### T-10 — Expand auth.test.ts
- [ ] Issue created; blocked by all stories
- [ ] Acceptance criteria: `describe` blocks for each of the 8 story groups; all 17 PRD acceptance criteria covered; 401 and 429 cases included
- [ ] Sprint 3 assigned; Component: `Testing`

#### T-11 — Lint + format quality gate
- [ ] Issue created (or tracked as a PR checklist item)
- [ ] Acceptance criteria: `bun run lint:fix` exits 0, `bun run format` exits 0, no console.log or dead code
- [ ] Sprint 3 assigned; Component: `Testing`

---

## Issue Update Pass (After All Issues Created)

Once all issues have GitHub issue numbers, perform a second pass to update cross-references:

- [ ] **Epic E-01**: Update "Features in this Epic" with actual feature issue number (F-01 #N)
- [ ] **Feature F-01**: Update all story and enabler issue references with actual numbers
- [ ] **Enabler EN-01**: Update "User Stories Enabled" with S-05 #N, S-07 #N
- [ ] **Enabler EN-02**: Update "User Stories Enabled" with all six story issue numbers
- [ ] **Enabler EN-03**: Update "User Stories Enabled" with S-01 #N, S-03 #N
- [ ] **All Stories**: Update "Feature" field with F-01 #N; update task cross-references with actual #N
- [ ] **All Tasks**: Update "Parent" field with actual enabler/story #N

---

## Project Board Setup

- [ ] Project board created in GitHub (Projects → New Project → Board)
- [ ] Columns added: Backlog, Sprint Ready, In Progress, In Review, Testing, Done
- [ ] Custom fields configured: Priority, Value, Component, Estimate, Sprint, Epic
- [ ] All Epic, Feature, Enabler, Story, and Task issues added to the board
- [ ] Issues placed in the correct initial column (**Backlog** for all)
- [ ] Sprint 1 issues moved to **Sprint Ready** after Sprint 1 planning meeting
- [ ] Automation configured: PR merged → move linked issue to Testing or Done

---

## Post-Sprint Completion Verification

### Sprint 1 Done Criteria
- [ ] EN-01, EN-02, EN-03 issues marked Done
- [ ] T-01 through T-05 issues marked Done
- [ ] S-01 and S-02 integration tests passing
- [ ] Migration applied in staging environment

### Sprint 2 Done Criteria
- [ ] S-03 through S-07 issues marked Done
- [ ] T-06 through T-09 issues marked Done
- [ ] All credential-change and profile endpoints returning correct responses

### Sprint 3 Done Criteria
- [ ] S-08 issue marked Done
- [ ] T-10 — all 17 PRD user stories covered by passing integration tests
- [ ] T-11 — `bun run lint:fix` and `bun run format` exit 0
- [ ] Feature F-01 issue marked Done
- [ ] Zero open issues blocking downstream features

---

## Issue Count Summary

| Type | Count | Total Story Points |
|---|---|---|
| Epic | 1 | — |
| Feature | 1 | L (34 pts) |
| Technical Enablers | 3 | 6 pts |
| User Stories | 8 | 20 pts |
| Implementation Tasks | 11 | 14 pts |
| **Total Issues** | **24** | **34 pts** |

---

*Issue creation checklist maintained by the Cukkr engineering team.*
