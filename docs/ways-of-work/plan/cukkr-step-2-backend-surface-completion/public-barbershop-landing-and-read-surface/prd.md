# Feature PRD: Public Barbershop Landing And Read Surface

**Version:** 1.0
**Date:** April 28, 2026
**Status:** Draft

---

## 1. Feature Name

**Public Barbershop Landing And Read Surface**

Expose a customer-safe public barbershop surface by slug so web users can view branding, services, barbers, and open-hours-derived information before submitting a booking.

---

## 2. Epic

- **Parent Epic:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../epic.md)
- **Parent Step PRD:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../../../../PRD_STEP2.md)
- **Parent Architecture:** Not yet authored for this epic.

---

## 3. Goal

### Problem

The public customer web flow needs a read surface anchored by barbershop slug, but Step 2 does not yet provide the complete set of public-safe data needed to render that experience. Customers need branding, basic shop information, active services, customer-facing barbers, and open-hours information before they can decide to book. Without a stable slug-based read contract, the frontend cannot build the intended public experience and may over-fetch or expose internal data accidentally. Step 2 needs a clear public read boundary for customer-safe organization data.

### Solution

Expose a public detail endpoint by slug and supporting public read surfaces for active services, public barbers, and open-hours-derived scheduling information. Resolve the organization by slug and scope every downstream query to that organization. Return only customer-safe fields and exclude internal-only data such as notes, inactive entries, or sensitive membership details.

### Impact

- Enable the public web landing experience required for customer acquisition and booking.
- Reduce the risk of cross-organization or internal-data leakage.
- Standardize the public read contract used by both walk-in and appointment flows.
- Improve frontend delivery by providing one stable slug-based integration surface.

---

## 4. User Personas

| Persona | Role | Relevance |
|---|---|---|
| **Appointment Customer** | `customer` | Browses barbershop info before creating an appointment. |
| **Walk-In Customer** | `customer` | Browses shop info before validating a PIN and joining the queue. |
| **Frontend Integrator** | Internal | Needs a customer-safe, slug-based read contract for the public web flow. |

---

## 5. User Stories

- **US-01:** As a **Customer**, I want to open a public barbershop page by slug so that I can view the shop without being authenticated as staff.
- **US-02:** As a **Customer**, I want to see branding, basic details, active services, and public barbers so that I can decide whether and how to book.
- **US-03:** As a **Customer**, I want public open-hours information so that I can understand when the shop is available.
- **US-04:** As an **Engineering team member**, I want public reads to expose only safe customer-facing data so that internal information is not leaked.

---

## 6. Requirements

### Functional Requirements

- The backend must expose a public barbershop detail endpoint resolved by slug.
- Public detail responses must include at minimum barbershop name, description, address, slug, logo URL when present, and the open-status metadata needed by the UI.
- The backend must expose a public service list scoped to active services only.
- The backend must expose a public barber list scoped to active, customer-visible barbers only.
- The backend must expose public open-hours data or equivalent derived availability information sufficient for the public web calendar and landing page.
- All public read queries must resolve the organization from slug and then scope every downstream lookup to that resolved organization.
- Public responses must exclude internal notes, inactive services, sensitive membership metadata, and other non-customer-facing data.
- Invalid slugs must return an explicit not-found response.
- Integration tests must cover successful slug resolution, invalid slug behavior, active-only filtering, and cross-organization isolation.

### Non-Functional Requirements

- **Security:** Public reads must only expose explicitly safe customer-facing data.
- **Tenant Isolation:** Slug resolution and downstream queries must not leak data from another organization.
- **Reliability:** Public detail, barber, service, and open-hours responses must stay consistent for the same slug and dataset.
- **Maintainability:** Public read behavior should reuse existing modules and serializers where safe, instead of introducing a parallel public data model stack.
- **Performance:** Public landing responses must remain responsive for web-entry use.

---

## 7. Acceptance Criteria

### AC-01: Public Slug Detail

- [ ] A valid barbershop slug returns public barbershop detail including branding and basic metadata.
- [ ] An invalid slug returns a not-found response.

### AC-02: Public Service And Barber Data

- [ ] Public service responses include active services only.
- [ ] Public barber responses include only customer-visible barbers for the resolved organization.

### AC-03: Public Scheduling Data

- [ ] Public open-hours or equivalent scheduling data is available for the public web experience.

### AC-04: Safety And Isolation

- [ ] Public responses do not expose internal-only fields.
- [ ] Integration tests prove data from one organization cannot be fetched through another organization's slug.

---

## 8. Out of Scope

- Public reviews, ratings, or social proof widgets.
- SEO/content-management tooling beyond the required slug-based surface.
- Public editing of barbershop content.
- Customer-authenticated account dashboards.