# Issues Creation Checklist: Multi-Barbershop & Branch Management

**Feature:** Multi-Barbershop & Branch Management — Multi-Tenant Organization Switching  
**Epic:** Cukkr — Barbershop Management & Booking System  
**Project Plan:** [project-plan.md](./project-plan.md)  
**Date:** April 28, 2026

---

## Pre-Creation Preparation

- [ ] **PRD complete**: `docs/ways-of-work/plan/cukkr-barbershop-management/multi-barbershop/prd.md` ✅
- [ ] **Implementation plan complete**: `docs/ways-of-work/plan/cukkr-barbershop-management/multi-barbershop/implementation-plan.md` ✅
- [ ] **Project plan complete**: `docs/ways-of-work/plan/cukkr-barbershop-management/multi-barbershop/project-plan.md` ✅
- [ ] **Parent epic exists**: GitHub Epic issue created for "Cukkr — Barbershop Management & Booking System"
- [ ] **GitHub project board configured**: Columns (Backlog → Sprint Ready → In Progress → In Review → Testing → Done)
- [ ] **Required labels created** (see label table in project-plan.md): `epic`, `feature`, `user-story`, `enabler`, `test`, `priority-high`, `value-high`, `backend`, `barbershop`, `database`, `security`
- [ ] **Milestone created**: Target release version/date set on the parent epic

---

## Issue Creation Order

Create issues in the order below. Update `#{issue-number}` cross-references after each issue is created.

---

### Step 1 — Feature Issue

- [ ] **#1 — Feature: Multi-Barbershop & Branch Management**
  - Labels: `feature`, `priority-high`, `value-high`, `backend`, `barbershop`
  - Epic: `#{epic-issue-number}`
  - Estimate: M (17 story points)
  - Status: Add to **Backlog** column on project board
  - Template: See [project-plan.md → Issue #1](./project-plan.md#issue-1--feature-multi-barbershop--branch-management)
  - Post-creation: Update parent epic issue to link `#1`

---

### Step 2 — Technical Enablers (can be created in parallel)

- [ ] **#2 — Enabler: Database Migration — Composite Member Index**
  - Labels: `enabler`, `priority-high`, `backend`, `database`
  - Feature: `#1`
  - Estimate: 1 point
  - Status: Add to **Sprint Ready** (no dependencies)
  - Template: See [project-plan.md → Issue #2](./project-plan.md#issue-2--enabler-database-migration--composite-member-index)
  - Post-creation: Update Feature #1 to link `#2`

- [ ] **#3 — Enabler: BarbershopModel — Multi-Barbershop TypeBox Types**
  - Labels: `enabler`, `priority-high`, `backend`, `barbershop`
  - Feature: `#1`
  - Estimate: 1 point
  - Status: Add to **Sprint Ready** (no dependencies)
  - Template: See [project-plan.md → Issue #3](./project-plan.md#issue-3--enabler-barbershopmodel--multi-barbershop-typebox-types)
  - Post-creation: Update Feature #1 to link `#3`

- [ ] **#4 — Enabler: BarbershopService — Extract validateAndCheckSlug Helper**
  - Labels: `enabler`, `priority-high`, `backend`, `barbershop`
  - Feature: `#1`
  - Estimate: 1 point
  - Status: Add to **Sprint Ready** (no dependencies)
  - Template: See [project-plan.md → Issue #4](./project-plan.md#issue-4--enabler-barbershopservice--extract-validateandcheckslug-helper)
  - Post-creation: Update Feature #1 to link `#4`

---

### Step 3 — User Stories (create after enablers)

- [ ] **#5 — Story: Create New Barbershop Organization**
  - Labels: `user-story`, `priority-high`, `backend`, `barbershop`
  - Feature: `#1`
  - Estimate: 3 points
  - Status: Add to **Backlog** (blocked by #2, #3, #4)
  - Dependencies: Blocked by `#2`, `#3`, `#4`
  - Template: See [project-plan.md → Issue #5](./project-plan.md#issue-5--story-create-new-barbershop-organization)
  - Post-creation: Update Feature #1 to link `#5`; update #2, #3, #4 "Blocks" field with `#5`

- [ ] **#6 — Story: List All User's Barbershops**
  - Labels: `user-story`, `priority-high`, `backend`, `barbershop`
  - Feature: `#1`
  - Estimate: 2 points
  - Status: Add to **Backlog** (blocked by #3)
  - Dependencies: Blocked by `#3`
  - Template: See [project-plan.md → Issue #6](./project-plan.md#issue-6--story-list-all-users-barbershops)
  - Post-creation: Update Feature #1 to link `#6`; update #3 "Blocks" field with `#6`

- [ ] **#7 — Story: Leave Organization**
  - Labels: `user-story`, `priority-high`, `backend`, `barbershop`
  - Feature: `#1`
  - Estimate: 2 points
  - Status: Add to **Backlog** (blocked by #2, #3)
  - Dependencies: Blocked by `#2`, `#3`
  - Template: See [project-plan.md → Issue #7](./project-plan.md#issue-7--story-leave-organization)
  - Post-creation: Update Feature #1 to link `#7`; update #2, #3 "Blocks" field with `#7`

- [ ] **#8 — Story: Cross-Tenant Data Isolation Validation**
  - Labels: `user-story`, `priority-high`, `value-high`, `backend`, `security`
  - Feature: `#1`
  - Estimate: 2 points
  - Status: Add to **Backlog** (blocked by #5, #6)
  - Dependencies: Blocked by `#5`, `#6`
  - Template: See [project-plan.md → Issue #8](./project-plan.md#issue-8--story-cross-tenant-data-isolation-validation)
  - Post-creation: Update Feature #1 to link `#8`; update #5, #6 "Blocks" field with `#8`

---

### Step 4 — Test Issue (create after all stories)

- [ ] **#9 — Test: Integration Tests — Multi-Barbershop & Branch Management**
  - Labels: `test`, `priority-high`, `backend`, `barbershop`
  - Feature: `#1`
  - Estimate: 5 points
  - Status: Add to **Backlog** (blocked by #5, #6, #7, #8)
  - Dependencies: Blocked by `#5`, `#6`, `#7`, `#8`
  - Template: See [project-plan.md → Issue #9](./project-plan.md#issue-9--test-integration-tests-for-multi-barbershop-feature)
  - Post-creation:
    - Update Feature #1 to link `#9`
    - Update stories #5–#8 to reference `#9` in their Testing Requirements sections
    - Update #5–#8 "Blocks" field with `#9`

---

## Cross-Reference Update Checklist

After all 9 issues are created, verify all cross-references are correct:

- [ ] Feature #1 lists all issues: #2, #3, #4 (enablers) + #5, #6, #7, #8 (stories)
- [ ] Enabler #2 "Blocks" includes: #5, #7
- [ ] Enabler #3 "Blocks" includes: #5, #6, #7
- [ ] Enabler #4 "Blocks" includes: #5
- [ ] Story #5 "Blocked by" includes: #2, #3, #4 — "Blocks" includes: #8, #9
- [ ] Story #6 "Blocked by" includes: #3 — "Blocks" includes: #8, #9
- [ ] Story #7 "Blocked by" includes: #2, #3 — "Blocks" includes: #9
- [ ] Story #8 "Blocked by" includes: #5, #6 — "Blocks" includes: #9
- [ ] Test #9 "Blocked by" includes: #5, #6, #7, #8

---

## Project Board Setup Checklist

- [ ] Feature #1 added to project board under **Backlog**
- [ ] Enablers #2, #3, #4 moved to **Sprint Ready** (no blockers)
- [ ] Stories #5, #6, #7, #8 added under **Backlog**
- [ ] Test #9 added under **Backlog**
- [ ] Custom fields set for all issues:
  - [ ] `Priority`: P1 (all issues in this feature)
  - [ ] `Value`: High (all issues in this feature)
  - [ ] `Component`: See per-issue labels
  - [ ] `Estimate`: Story points per issue
  - [ ] `Epic`: `#{epic-issue-number}` on all issues
- [ ] Sprint assignment: All issues assigned to the current sprint after sprint planning
- [ ] Assignee set for each issue

---

## Implementation Progress Tracking

Update status here as issues are implemented:

| # | Title | Status | PR |
|---|-------|--------|-----|
| #1 | Feature: Multi-Barbershop & Branch Management | `open` | — |
| #2 | Enabler: Database Migration — Composite Member Index | `open` | — |
| #3 | Enabler: BarbershopModel — Multi-Barbershop TypeBox Types | `open` | — |
| #4 | Enabler: BarbershopService — Extract validateAndCheckSlug Helper | `open` | — |
| #5 | Story: Create New Barbershop Organization | `open` | — |
| #6 | Story: List All User's Barbershops | `open` | — |
| #7 | Story: Leave Organization | `open` | — |
| #8 | Story: Cross-Tenant Data Isolation Validation | `open` | — |
| #9 | Test: Integration Tests — Multi-Barbershop | `open` | — |

---

## Definition of Done — Feature Level

Before closing Feature #1, confirm:

- [ ] All 9 issues closed
- [ ] `tests/modules/multi-barbershop.test.ts` created with all 13 test cases passing
- [ ] `bun test` full suite passes with zero regressions
- [ ] `bun run lint:fix && bun run format` passes cleanly
- [ ] Migration applied and verified in staging
- [ ] No `console.log` or commented-out code in any changed file
- [ ] PR description references Feature #1 and all closed sub-issues
