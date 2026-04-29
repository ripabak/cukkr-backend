# Feature PRD: Barbershop Logo Upload

**Version:** 1.0
**Date:** April 28, 2026
**Status:** Draft

---

## 1. Feature Name

**Barbershop Logo Upload**

Add a dedicated logo upload contract for the active organization so branding can be managed once and reused across private and public barbershop surfaces.

---

## 2. Epic

- **Parent Epic:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../epic.md)
- **Parent Step PRD:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../../../../PRD_STEP2.md)
- **Parent Architecture:** Not yet authored for this epic.

---

## 3. Goal

### Problem

The product currently lacks a server-backed contract for barbershop logo upload, which forces frontend teams to rely on temporary assets or incomplete onboarding behavior. Branding is needed in both owner-facing settings and public customer-facing barbershop pages, so the asset cannot remain a frontend-only concern. Without a validated upload flow, image rules and persistence behavior can drift between screens. This leaves Step 2 without a reliable branding surface.

### Solution

Introduce a dedicated active-organization logo upload endpoint in the barbershop module, persist a stable `logoUrl` on the barbershop entity, and return that URL from both private and public read contracts. Enforce MIME-type and file-size validation server-side before storage. Use the same contract for onboarding and settings so the frontend does not need separate branding flows.

### Impact

- Enable end-to-end branding flow for onboarding and settings.
- Remove frontend asset workarounds for barbershop identity.
- Improve consistency between internal and public barbershop views.
- Add testable validation for upload safety and reliability.

---

## 4. User Personas

| Persona | Role | Relevance |
|---|---|---|
| **Barbershop Owner** | `owner` | Uploads or replaces the active barbershop logo. |
| **Appointment Customer** | `customer` | Sees the logo on the public barbershop page. |
| **Walk-In Customer** | `customer` | Sees the logo on the public walk-in flow. |
| **Frontend Integrator** | Internal | Needs one branding upload contract reused across onboarding and settings. |

---

## 5. User Stories

- **US-01:** As a **Barbershop Owner**, I want to upload a logo for the active organization so that the brand is visible in onboarding and settings.
- **US-02:** As a **Frontend Integrator**, I want the upload response to return a final stable URL so that the UI can render the logo immediately.
- **US-03:** As a **Customer**, I want public barbershop pages to show the same logo used in internal settings so that the brand feels consistent.
- **US-04:** As an **Engineering team member**, I want invalid image types and oversized uploads rejected server-side so that storage misuse is prevented.

---

## 6. Requirements

### Functional Requirements

- The barbershop module must expose a dedicated logo upload endpoint for the active organization.
- The upload contract must accept only `image/jpeg`, `image/png`, and `image/webp` files.
- The maximum accepted upload size must be 5 MB.
- A successful upload must persist the final asset and update the active barbershop record with a stable `logoUrl` or equivalent media field.
- The upload response must return the resolved logo URL needed by the frontend.
- `GET /api/barbershop` must include the current `logoUrl` when present.
- The public slug-based barbershop detail surface must include the same `logoUrl` when present.
- The same upload contract must be reusable from onboarding and settings; the backend must not require separate endpoints for those flows.
- Upload attempts must validate organization ownership before persisting a file.
- Integration tests must cover valid upload, invalid MIME, oversized file, and read-model propagation.

### Non-Functional Requirements

- **Security:** Only authenticated users with access to the active organization may upload or replace a logo.
- **Tenant Isolation:** A logo upload must only mutate branding for the caller's active organization.
- **Upload Safety:** MIME type and size validation must happen server-side before storage.
- **Reliability:** Private and public read models must return the same current logo URL after a successful upload.
- **Maintainability:** Branding media ownership must remain in the barbershop module and use existing storage abstractions.

---

## 7. Acceptance Criteria

### AC-01: Successful Upload

- [ ] The logo upload endpoint accepts a valid JPEG, PNG, or WebP file up to 5 MB and returns success with the final `logoUrl`.
- [ ] The active barbershop record stores the new `logoUrl` after upload.

### AC-02: Validation Rules

- [ ] Uploading an unsupported MIME type returns a validation error.
- [ ] Uploading a file larger than 5 MB returns a validation error.
- [ ] Upload requests for organizations the caller cannot manage are rejected.

### AC-03: Read Surface Propagation

- [ ] `GET /api/barbershop` returns the new `logoUrl` after upload.
- [ ] Public slug-based barbershop detail returns the same `logoUrl` for the resolved organization.

### AC-04: Cross-Screen Reuse

- [ ] The onboarding flow can use the same upload contract as the settings flow without backend branching.
- [ ] Integration tests cover onboarding/settings-compatible usage semantics.

---

## 8. Out of Scope

- Image editing, cropping, or transformation workflows beyond basic upload.
- Multiple logo variants per organization.
- Video or document uploads.
- CDN strategy redesign outside the current storage abstraction.