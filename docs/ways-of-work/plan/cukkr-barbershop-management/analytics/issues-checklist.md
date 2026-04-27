# Issues Creation Checklist: Analytics — Sales & Booking Performance Dashboard

**Version:** 1.0  
**Date:** April 27, 2026  
**Status:** Pending  
**Project Plan:** [project-plan.md](./project-plan.md)

Track each GitHub issue as it is created. Replace `#???` placeholders with the actual
issue numbers assigned by GitHub after creation. Update the project plan cross-references
once numbers are known.

---

## Pre-Creation Preparation

- [ ] Feature artifacts complete (PRD, implementation plan, project plan all present)
- [ ] Parent epic issue exists in GitHub with milestone assigned
- [ ] GitHub project board configured with columns: Backlog, Sprint Ready, In Progress, In Review, Testing, Done
- [ ] Custom fields configured: Priority (P0–P3), Value (High/Medium/Low), Component, Estimate, Sprint, Epic

---

## Issue Creation Order

Create issues in the order listed below. Dependency references (`#{E1}` etc.) must be
replaced with real issue numbers as each issue is created.

| Order | ID | Title | Labels | Priority | Points | Blocked By | Issue # |
|---|---|---|---|---|---|---|---|
| 1 | F | Analytics Dashboard Feature | `feature`, `priority-high`, `value-high`, `backend` | P1 | M | — | #??? |
| 2 | E1 | DB Composite Index Migration | `enabler`, `priority-high`, `value-medium`, `backend`, `database` | P1 | 1 | — | #??? |
| 3 | E2 | Analytics Model Definitions | `enabler`, `priority-high`, `value-medium`, `backend` | P1 | 1 | — | #??? |
| 4 | E3 | Analytics Service Implementation | `enabler`, `priority-critical`, `value-high`, `backend` | P0 | 5 | E1, E2 | #??? |
| 5 | E4 | Analytics Handler + App Registration | `enabler`, `priority-critical`, `value-high`, `backend` | P0 | 2 | E2, E3 | #??? |
| 6 | S1 | View Stat Cards with Period Comparison | `user-story`, `priority-high`, `value-high`, `backend` | P1 | 2 | E4 | #??? |
| 7 | S2 | Filter Analytics by Time Range | `user-story`, `priority-high`, `value-high`, `backend` | P1 | 1 | E4 | #??? |
| 8 | S3 | View Time-Bucketed Chart Data | `user-story`, `priority-high`, `value-high`, `backend` | P1 | 2 | E4 | #??? |
| 9 | T1 | Integration Tests for Analytics Endpoint | `test`, `priority-high`, `value-high`, `backend` | P1 | 3 | E4 | #??? |

**Total:** 17 story points (feature M + 14 pts for enablers/stories/tests)

---

## Epic Level

- [ ] **Epic issue exists** with parent epic for "Cukkr Barbershop Management & Booking System"
- [ ] **Epic milestone created** or verified with target release date
- [ ] **Epic labels applied:** `epic`, `priority-high`, `value-high`
- [ ] **Epic added to project board**

---

## Feature Level

- [ ] **Feature issue created** — `#F` (Analytics Dashboard)
  - [ ] Description matches [project-plan.md](./project-plan.md) feature template
  - [ ] Linked to parent epic in the `Epic` field
  - [ ] All enabler and story issue numbers filled in after creation
  - [ ] Acceptance criteria checklist complete (10 items)
  - [ ] Estimate set: M
  - [ ] Added to project board Backlog column
  - [ ] Labels applied: `feature`, `priority-high`, `value-high`, `backend`

---

## Enabler Level

- [ ] **E1 — DB Composite Index Migration** — `#???`
  - [ ] Title: `Technical Enabler: DB Composite Index for Analytics Queries`
  - [ ] Index name specified: `booking_organizationId_status_completedAt_idx`
  - [ ] Migration command documented: `bunx drizzle-kit generate --name add_analytics_completed_at_index`
  - [ ] Acceptance criteria: 4 items
  - [ ] Estimate: 1 pt · Labels: `enabler`, `priority-high`, `value-medium`, `backend`, `database`
  - [ ] Linked to Feature `#F`
  - [ ] Added to Sprint 1 on project board

- [ ] **E2 — Analytics Model Definitions** — `#???`
  - [ ] Title: `Technical Enabler: Analytics Model (TypeBox Schemas & TypeScript Types)`
  - [ ] All schemas listed: `AnalyticsRangeEnum`, `AnalyticsQueryParam`, `StatCardSchema`,
        `ChartBucketSchema`, `AnalyticsResponseSchema`
  - [ ] TypeScript exports listed: `AnalyticsRange`, `StatCard`, `ChartBucket`, `AnalyticsResponse`
  - [ ] Estimate: 1 pt · Labels: `enabler`, `priority-high`, `value-medium`, `backend`
  - [ ] Linked to Feature `#F`
  - [ ] Added to Sprint 1 on project board

- [ ] **E3 — Analytics Service Implementation** — `#???`
  - [ ] Title: `Technical Enabler: Analytics Service (Time Windows, Aggregation, Cache)`
  - [ ] Blocked-by field references E1 and E2
  - [ ] Time window boundary table included for all 5 ranges
  - [ ] All 5 private methods listed with specifications
  - [ ] Acceptance criteria covers all bucket counts and cache behaviour
  - [ ] Estimate: 5 pts · Labels: `enabler`, `priority-critical`, `value-high`, `backend`
  - [ ] Linked to Feature `#F`
  - [ ] Added to Sprint 1 on project board

- [ ] **E4 — Analytics Handler + App Registration** — `#???`
  - [ ] Title: `Technical Enabler: Analytics Handler and App Registration`
  - [ ] Blocked-by field references E2 and E3
  - [ ] Resolved API path documented: `/api/analytics`
  - [ ] Four status codes listed in acceptance criteria (200, 400, 401, 403)
  - [ ] Estimate: 2 pts · Labels: `enabler`, `priority-critical`, `value-high`, `backend`
  - [ ] Linked to Feature `#F`
  - [ ] Added to Sprint 1 on project board

---

## Story Level

- [ ] **S1 — View Stat Cards with Period Comparison** — `#???`
  - [ ] Story statement in As/I want/so that format
  - [ ] Blocked-by field references E4
  - [ ] Acceptance criteria covers all 4 stat cards, null-change edge case, direction logic,
        IDR integers, completed-only filter
  - [ ] Testing requirements reference T-1 through T-4 and T-6
  - [ ] Estimate: 2 pts · Labels: `user-story`, `priority-high`, `value-high`, `backend`
  - [ ] Linked to Feature `#F`
  - [ ] Added to Sprint 2 on project board

- [ ] **S2 — Filter Analytics by Time Range** — `#???`
  - [ ] Story statement in As/I want/so that format
  - [ ] Blocked-by field references E4
  - [ ] Acceptance criteria covers all 5 ranges, 400 on invalid range, previous-period alignment
  - [ ] Testing requirements reference T-8, T-12, T-13, T-14
  - [ ] Estimate: 1 pt · Labels: `user-story`, `priority-high`, `value-high`, `backend`
  - [ ] Linked to Feature `#F`
  - [ ] Added to Sprint 2 on project board

- [ ] **S3 — View Time-Bucketed Chart Data** — `#???`
  - [ ] Story statement in As/I want/so that format
  - [ ] Blocked-by field references E4
  - [ ] Acceptance criteria specifies exact bucket counts and label format per range
  - [ ] Zero-activity buckets explicitly included (not omitted)
  - [ ] Testing requirements reference T-5, T-12, T-13, T-14
  - [ ] Estimate: 2 pts · Labels: `user-story`, `priority-high`, `value-high`, `backend`
  - [ ] Linked to Feature `#F`
  - [ ] Added to Sprint 2 on project board

---

## Test Level

- [ ] **T1 — Integration Tests for Analytics Endpoint** — `#???`
  - [ ] All 14 test cases listed with description and linked AC
  - [ ] Seeding strategy documented (explicit `completedAt` WIB timestamps, both periods)
  - [ ] Cleanup strategy documented (`afterAll` with `db.delete`)
  - [ ] T-7 (org isolation) setup described (second user + org)
  - [ ] T-9 (cache hit) verification strategy described
  - [ ] Blocked-by field references E4
  - [ ] Estimate: 3 pts · Labels: `test`, `priority-high`, `value-high`, `backend`
  - [ ] Linked to Feature `#F`
  - [ ] Added to Sprint 2 on project board

---

## Post-Creation Validation

- [ ] All `#???` placeholders replaced with real GitHub issue numbers in this checklist
- [ ] All cross-references in [project-plan.md](./project-plan.md) updated with real issue numbers
- [ ] Dependency (blocked-by) links set on E3, E4, S1, S2, S3, T1 in GitHub
- [ ] Feature issue updated with all story/enabler/test issue numbers
- [ ] All issues visible on the GitHub project board in the Backlog column
- [ ] Sprint 1 issues (E1–E4) moved to Sprint Ready column
- [ ] Sprint 2 issues (S1–S3, T1) remain in Backlog pending Sprint 1 completion

---

## Implementation Status Tracking

Update this table as work progresses. Mirror state into GitHub issue status.

| ID | Issue # | Status | PR | Notes |
|---|---|---|---|---|
| E1 | #??? | completed | — | `src/modules/bookings/schema.ts` + `drizzle/20260427150416_add_analytics_completed_at_index.sql` |
| E2 | #??? | completed | — | `src/modules/analytics/model.ts` |
| E3 | #??? | completed | — | `src/modules/analytics/service.ts` |
| E4 | #??? | completed | — | `src/modules/analytics/handler.ts`, `src/app.ts` updated |
| S1 | #??? | completed | — | Delivered via E3+E4; verified by T-1, T-2, T-3, T-4, T-6 |
| S2 | #??? | completed | — | Delivered via E3+E4; verified by T-8 |
| S3 | #??? | completed | — | Delivered via E3+E4; verified by T-5, T-12, T-13, T-14 |
| T1 | #??? | completed | — | `tests/modules/analytics.test.ts` — 14/14 pass |
