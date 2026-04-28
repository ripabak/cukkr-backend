# Feature PRD: Booking List Sorting And Barber Search

**Version:** 1.0
**Date:** April 28, 2026
**Status:** Draft

---

## 1. Feature Name

**Booking List Sorting And Barber Search**

Add explicit booking-list sort options and server-side barber search so schedule and booking-creation screens match the intended Step 2 UX.

---

## 2. Epic

- **Parent Epic:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../epic.md)
- **Parent Step PRD:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../../../../PRD_STEP2.md)
- **Parent Architecture:** Not yet authored for this epic.

---

## 3. Goal

### Problem

The current booking list and barber-picking flows do not expose the sort and search semantics needed by the Step 2 UI. Without explicit booking sorting, clients can only rely on implicit backend ordering, which is fragile and hard to document. Without server-side barber search, larger organizations force the client to fetch and filter full lists locally. This creates inconsistent UX and unnecessary coupling between screens and data volume.

### Solution

Add explicit booking-list sort options and define the default order contract for `GET /api/bookings`. Add server-side search support to `GET /api/barbers` so booking and management forms can query organization-scoped barber data by name or other supported search fields. Cover both behaviors with integration tests to lock the contract.

### Impact

- Align booking list behavior with the Step 2 schedule UI.
- Reduce client-side filtering and sorting logic.
- Improve scalability for larger barber teams.
- Make list behavior explicit and test-backed.

---

## 4. User Personas

| Persona | Role | Relevance |
|---|---|---|
| **Barbershop Owner** | `owner` | Views and sorts booking lists; searches barbers while managing bookings. |
| **Barber** | `barber` | Uses sorted booking lists and barber search in daily workflow. |
| **Frontend Integrator** | Internal | Needs explicit contract semantics for list ordering and search filtering. |

---

## 5. User Stories

- **US-01:** As a **Barber or Owner**, I want explicit booking sort options so that I can view bookings in the order expected by the schedule UI.
- **US-02:** As a **Frontend Integrator**, I want a documented default booking order so that screens behave predictably even when no sort query is passed.
- **US-03:** As a **Barber or Owner**, I want to search barbers server-side so that I can quickly find a specific barber in organization-scoped flows.
- **US-04:** As an **Engineering team member**, I want sorting and search covered by integration tests so that contract drift is caught early.

---

## 6. Requirements

### Functional Requirements

- `GET /api/bookings` must support explicit sort options at minimum for `recently_added` and `oldest_first`.
- The backend must define and document the default sort applied when the client does not provide a sort parameter.
- The sort contract must apply consistently to organization-scoped booking lists.
- `GET /api/barbers` must support a search query for server-side filtering.
- Barber search results must remain scoped to the active organization.
- Barber search must support partial-match behavior for the fields chosen by engineering, at minimum matching the Step 2 barber-selection UX.
- Search requests that return no matches must succeed with an empty result rather than an error.
- Integration tests must verify default booking ordering, both explicit sort modes, positive search matches, and empty-result search behavior.

### Non-Functional Requirements

- **Security:** Both endpoints remain protected by authenticated session and organization scoping.
- **Tenant Isolation:** No sort or search request may reveal barbers or bookings from another organization.
- **Performance:** Sorting and search must be efficient enough for owner/barber interactive use and supported by appropriate indexes where necessary.
- **Contract Consistency:** Sort names and search semantics must be documented and stable for Step 2 clients.
- **Maintainability:** Search implementation should extend existing list/query patterns rather than introducing a separate lookup service.

---

## 7. Acceptance Criteria

### AC-01: Booking Sort Contract

- [ ] `GET /api/bookings` supports `recently_added` and `oldest_first` query values.
- [ ] The default booking order is documented and validated by integration tests.
- [ ] Sort results are deterministic for the same dataset.

### AC-02: Barber Search Contract

- [ ] `GET /api/barbers` accepts a search query and returns matching organization-scoped barbers.
- [ ] Search requests with no matches return a successful empty list.
- [ ] Search results never include barbers from another organization.

### AC-03: Test Coverage

- [ ] Integration tests verify ascending and descending list behavior for bookings.
- [ ] Integration tests verify barber search match and non-match cases.

---

## 8. Out of Scope

- Multi-field advanced filtering beyond the Step 2 sort and search needs.
- Full-text search infrastructure.
- Public barber search for customer-facing surfaces.
- Personalized or role-specific default sort variants.