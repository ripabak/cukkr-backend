# Issues Creation Checklist: Walk-In PIN System

**Feature:** Walk-In PIN System
**Project Plan:** [project-plan.md](./project-plan.md)
**Epic:** Cukkr — Barbershop Management & Booking System

> After creating each issue in GitHub, record the assigned issue number in the **Issue #** column and update the corresponding placeholder (e.g., `#{ENA-01}`) in [project-plan.md](./project-plan.md).

---

## Pre-Creation Preparation

- [ ] Feature artifacts complete: PRD, implementation plan, and project plan all present
- [ ] Parent epic issue exists in GitHub (`#{EPIC}` known and filled in project-plan.md)
- [ ] GitHub project board configured with: Backlog, Sprint Ready, In Progress, In Review, Testing, Done columns
- [ ] Labels created in GitHub repo: `epic`, `feature`, `user-story`, `enabler`, `test`, `priority-critical`, `priority-high`, `priority-medium`, `value-high`, `value-medium`, `backend`, `database`, `security`, `infrastructure`
- [ ] Milestone created: _Walk-In PIN System_ with target release date
- [ ] `.env.example` entry for `WALK_IN_TOKEN_SECRET` drafted before ENA-01 is worked on

---

## Issue Creation Order

Issues must be created in the order below to allow correct blocking-issue references.

### Step 1 — Feature Issue

| Ref | Title | Labels | Issue # | Status |
|---|---|---|---|---|
| FEAT-01 | Feature: Walk-In PIN System | `feature`, `priority-high`, `value-high`, `backend`, `security` | | ☐ Not created |

### Step 2 — Technical Enablers (create all before stories)

| Ref | Title | Labels | Points | Issue # | Status |
|---|---|---|---|---|---|
| ENA-01 | Technical Enabler: Add jose Dependency + WALK_IN_TOKEN_SECRET Environment Variable | `enabler`, `priority-critical`, `backend`, `infrastructure` | 1 | | ✅ Implemented |
| ENA-02 | Technical Enabler: Create IpFailureGuard Utility | `enabler`, `priority-critical`, `backend`, `security` | 2 | | ✅ Implemented |
| ENA-03 | Technical Enabler: Create walk_in_pin Drizzle Schema + Migration | `enabler`, `priority-critical`, `backend`, `database` | 2 | | ✅ Implemented |

### Step 3 — User Stories (after enablers created)

| Ref | Title | Labels | Points | Issue # | Status |
|---|---|---|---|---|---|
| STY-01 | User Story: PIN Generation & Active Count API | `user-story`, `priority-high`, `value-high`, `backend` | 3 | | ✅ Implemented |
| STY-02 | User Story: PIN Validation API with IP Rate Limiting | `user-story`, `priority-high`, `value-high`, `backend`, `security` | 5 | | ✅ Implemented |
| STY-03 | User Story: Walk-In Booking Creation API | `user-story`, `priority-high`, `value-high`, `backend`, `security` | 5 | | ✅ Implemented |

### Step 4 — Test Issue (after all stories created)

| Ref | Title | Labels | Points | Issue # | Status |
|---|---|---|---|---|---|
| TST-01 | Test: Integration Tests — Walk-In PIN System (AC-01 through AC-12) | `test`, `priority-high`, `backend` | 5 | | ✅ Implemented — 12/12 tests passing |

---

## Dependency Cross-Reference

After all issues are created, verify each "Blocked by" reference is set correctly in GitHub:

| Issue | Must be blocked by | Verified |
|---|---|---|
| STY-01 (PIN Generation) | ENA-01, ENA-03 | ☐ |
| STY-02 (PIN Validation) | ENA-01, ENA-02, ENA-03 | ☐ |
| STY-03 (Walk-In Booking) | ENA-01, ENA-03, STY-02 | ☐ |
| TST-01 (Integration Tests) | STY-01, STY-02, STY-03 | ☐ |

---

## Project Board Setup

- [ ] All 8 issues added to the GitHub project board in **Backlog** column
- [ ] Custom fields set on each issue:
  - `Priority`: P0 for ENA-01/ENA-02/ENA-03; P1 for STY-01/STY-02/STY-03/TST-01
  - `Value`: High for all
  - `Component`: Infrastructure / Service / Handler / Testing as appropriate
  - `Estimate`: story points per summary table
  - `Sprint`: Sprint 1 = ENA-01, ENA-02, ENA-03, STY-01, STY-02 | Sprint 2 = STY-03, TST-01
- [ ] Feature issue (FEAT-01) linked to parent epic milestone

---

## Sprint Assignment Summary

| Sprint | Issues (Ref) | Points |
|---|---|---|
| Sprint 1 | ENA-01, ENA-02, ENA-03, STY-01, STY-02 | 13 pts |
| Sprint 2 | STY-03, TST-01 | 10 pts |
| **Total** | | **23 pts** |

---

## Post-Creation Checklist

- [ ] All placeholder refs in [project-plan.md](./project-plan.md) replaced with real issue numbers
- [ ] Each issue has correct labels, milestone, and project board column
- [ ] Blocking relationships configured in GitHub for all dependency pairs
- [ ] Sprint assignments set on the project board
- [ ] Team notified of Sprint 1 kickoff scope
