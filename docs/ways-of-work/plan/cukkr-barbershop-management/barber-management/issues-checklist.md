# Issues Checklist: Barber Management

**Feature:** Barber Management
**Epic:** Cukkr — Barbershop Management & Booking System
**Date:** April 27, 2026

> Use this checklist to track GitHub issue creation status. Check off each item once
> the corresponding GitHub issue has been created with the correct template, labels,
> and dependencies.

---

## Pre-Creation Preparation

- [ ] **Feature artifacts complete**: PRD (`prd.md`), Implementation Plan (`implementation-plan.md`), Project Plan (`project-plan.md`) all finalized
- [ ] **Epic exists**: Parent epic issue `#EP-01` created with labels and milestone
- [ ] **Project board configured**: Columns (Backlog → Sprint Ready → In Progress → In Review → Testing → Done), custom fields, and automation set up
- [ ] **Team capacity assessed**: Sprint 1 (7 pts) and Sprint 2 (19 pts) capacity confirmed
- [ ] **GitHub Labels created**: All labels from `project-plan.md` Labels Configuration section created

---

## Epic Level Issues

- [ ] **#EP-01 created** — `Epic: Cukkr — Barbershop Management & Booking System`
  - Labels: `epic`, `priority-high`, `value-high`
  - Milestone: v1.0 — Cukkr MVP
  - Estimate: XL
  - Acceptance criteria: all 5 high-level criteria added

---

## Feature Level Issues

- [ ] **#F-01 created** — `Feature: Barber Management`
  - Labels: `feature`, `priority-high`, `value-high`, `backend`, `barber-management`
  - Epic: #EP-01
  - Estimate: M (26 pts)
  - Dependencies documented: Blocks Schedule & Booking; Blocked by Auth module
  - All 6 acceptance criteria added
  - All story + enabler issue references added to body (after story/enabler issues created)

---

## Enabler Level Issues

- [ ] **#EN-01 created** — `Technical Enabler: DB Index Migration — Composite Index on invitation`
  - Labels: `enabler`, `priority-critical`, `value-high`, `backend`, `database`, `barber-management`
  - Feature: #F-01
  - Estimate: 2 points
  - Technical requirements: composite index definition + migration steps documented
  - Acceptance criteria: 3 criteria added

- [ ] **#EN-02 created** — `Technical Enabler: BarberService — Core Methods`
  - Labels: `enabler`, `priority-critical`, `value-high`, `backend`, `service`, `barber-management`
  - Feature: #F-01
  - Blocked by: #EN-01
  - Estimate: 5 points
  - 4 methods documented: `listBarbers`, `cancelInvitation`, `removeBarber`, updated `inviteBarber`
  - Acceptance criteria: 5 criteria added

- [ ] **#EN-03 created** — `Technical Enabler: Barber Module — Handler & Model Update`
  - Labels: `enabler`, `priority-high`, `value-high`, `backend`, `handler`, `barber-management`
  - Feature: #F-01
  - Blocked by: #EN-02
  - Estimate: 3 points
  - Files: `model.ts` + `handler.ts` updates documented
  - Acceptance criteria: 4 criteria added

---

## Story Level Issues

- [ ] **#S-01 created** — `User Story: List Barbers (Active + Pending)`
  - Labels: `user-story`, `priority-high`, `value-high`, `backend`, `barber-management`
  - Feature: #F-01
  - Blocked by: #EN-01, #EN-02, #EN-03
  - Estimate: 3 points
  - Story statement (As a…/I want…/so that…) added
  - 5 acceptance criteria added
  - Test references: T-01, T-02, T-03

- [ ] **#S-02 created** — `User Story: Invite Barber by Email or Phone`
  - Labels: `user-story`, `priority-high`, `value-high`, `backend`, `barber-management`
  - Feature: #F-01
  - Blocked by: #EN-02, #EN-03
  - Estimate: 3 points
  - Story statement added
  - 6 acceptance criteria added
  - Test references: T-04, T-05, T-06, T-07, T-08

- [ ] **#S-03 created** — `User Story: Cancel Pending Invitation`
  - Labels: `user-story`, `priority-high`, `value-medium`, `backend`, `barber-management`
  - Feature: #F-01
  - Blocked by: #EN-02, #EN-03
  - Estimate: 2 points
  - Story statement added
  - 5 acceptance criteria added
  - Test references: T-09, T-10, T-11

- [ ] **#S-04 created** — `User Story: Remove Active Barber`
  - Labels: `user-story`, `priority-high`, `value-high`, `backend`, `barber-management`
  - Feature: #F-01
  - Blocked by: #EN-02, #EN-03
  - Estimate: 3 points
  - Story statement added
  - 5 acceptance criteria added
  - Test references: T-12, T-13, T-14, T-15

---

## Test Level Issues

- [ ] **#T-01 created** — `Test: Integration Tests — barbers.test.ts`
  - Labels: `test`, `priority-high`, `value-high`, `backend`, `barber-management`
  - Feature: #F-01
  - Blocked by: #S-01, #S-02, #S-03, #S-04
  - Estimate: 5 points
  - All 15 test cases documented in issue body
  - Setup requirements documented (owner, barber, second org, booking)
  - 3 acceptance criteria added

---

## Post-Creation Verification

- [ ] **Issue numbers back-filled**: All placeholder issue references (`#EP-01`, `#F-01`, etc.) replaced with actual GitHub issue numbers in all issue bodies
- [ ] **Dependency links active**: All "Blocked by" and "Blocks" references verified in GitHub
- [ ] **All issues added to project board** in the `Backlog` column
- [ ] **Sprint 1 issues moved to Sprint Ready**: #EN-01, #EN-02
- [ ] **Milestone assigned to all issues**: v1.0 — Cukkr MVP
- [ ] **Issue count verified**: 1 epic + 1 feature + 3 enablers + 4 stories + 1 test = **10 issues total**

---

## Issue Summary Table

| Issue  | Type     | Title                               | Priority | Points | Sprint |
|--------|----------|-------------------------------------|----------|--------|--------|
| #EP-01 | Epic     | Cukkr Barbershop Mgmt & Booking     | P1       | XL     | —      |
| #F-01  | Feature  | Barber Management                   | P1       | M      | —      |
| #EN-01 | Enabler  | DB Index Migration                  | P0       | 2      | 1      |
| #EN-02 | Enabler  | BarberService Core Methods          | P0       | 5      | 1      |
| #EN-03 | Enabler  | Handler & Model Update              | P1       | 3      | 2      |
| #S-01  | Story    | List Barbers (Active + Pending)     | P1       | 3      | 2      |
| #S-02  | Story    | Invite Barber by Email or Phone     | P1       | 3      | 2      |
| #S-03  | Story    | Cancel Pending Invitation           | P1       | 2      | 2      |
| #S-04  | Story    | Remove Active Barber                | P1       | 3      | 2      |
| #T-01  | Test     | Integration Tests — barbers.test.ts | P1       | 5      | 2      |

**Total story points: 26 | Sprint 1: 7 pts | Sprint 2: 19 pts**

---

## Local Implementation Status

- [x] **#F-01 implemented locally** — merged barber management surface shipped in `src/modules/barbers/handler.ts`, `src/modules/barbers/service.ts`, `src/modules/barbers/model.ts`, with coverage in `tests/modules/barbers.test.ts`
- [x] **#EN-01 implemented locally** — invitation composite index added in `src/modules/auth/schema.ts`; migration generated in `drizzle/20260427094550_add-invitation-composite-idx.sql`
- [x] **#EN-02 implemented locally** — `listBarbers`, `inviteBarber`, `cancelInvitation`, and `removeBarber` implemented in `src/modules/barbers/service.ts`
- [x] **#EN-03 implemented locally** — barber DTO and route updates completed in `src/modules/barbers/model.ts` and `src/modules/barbers/handler.ts`
- [x] **#S-01 implemented locally** — `GET /api/barbers` returns active barbers plus non-expired pending invitations; covered by T-01 to T-03 in `tests/modules/barbers.test.ts`
- [x] **#S-02 implemented locally** — `POST /api/barbers/invite` accepts email or phone input; phone invitations resolve an existing user by phone and create the underlying org invitation against that user email for Better Auth compatibility; covered by T-04 to T-08 in `tests/modules/barbers.test.ts`
- [x] **#S-03 implemented locally** — `DELETE /api/barbers/invite/:invitationId` implemented and covered by T-09 to T-11 in `tests/modules/barbers.test.ts`
- [x] **#S-04 implemented locally** — `DELETE /api/barbers/:memberId` implemented with self-removal guard and booking preservation via existing FK behavior; covered by T-12 to T-15 in `tests/modules/barbers.test.ts`
- [x] **#T-01 implemented locally** — `tests/modules/barbers.test.ts` now covers all 15 planned integration scenarios

---

*Update this checklist as issues are created in GitHub. Reference actual issue numbers once assigned.*
