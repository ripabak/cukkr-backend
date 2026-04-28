# Feature PRD: Service Thumbnail Upload

**Version:** 1.0
**Date:** April 28, 2026
**Status:** Draft

---

## 1. Feature Name

**Service Thumbnail Upload**

Add optional image upload for individual services so owner-facing and public service surfaces can render consistent visual thumbnails.

---

## 2. Epic

- **Parent Epic:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../epic.md)
- **Parent Step PRD:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](../../../../PRD_STEP2.md)
- **Parent Architecture:** Not yet authored for this epic.

---

## 3. Goal

### Problem

Services currently have no supported backend media field for thumbnails, which prevents the UI from rendering service cards as designed and encourages frontend-only image handling. Because services appear in both owner-facing management flows and public booking surfaces, image support must be modeled as part of the service contract rather than as a display-only concern. The lack of validation also leaves MIME-type and file-size behavior undefined. Step 2 needs a reusable, test-backed media contract for service thumbnails.

### Solution

Add a service-level image field such as `imageUrl`, expose a dedicated thumbnail upload endpoint in the services module, and return the stored image URL from service list and detail contracts. Enforce the same upload validation rules as barbershop logo upload: JPEG, PNG, or WebP up to 5 MB. Keep service creation and editing compatible with services that have no image.

### Impact

- Enable the designed service-card presentation for owner and public surfaces.
- Remove ad hoc asset workarounds in the frontend.
- Standardize media validation across branding and services.
- Improve contract completeness for public booking flows.

---

## 4. User Personas

| Persona | Role | Relevance |
|---|---|---|
| **Barbershop Owner** | `owner` | Uploads or replaces service thumbnails. |
| **Appointment Customer** | `customer` | Sees service images on public service-selection surfaces. |
| **Walk-In Customer** | `customer` | Sees service images where public walk-in service choices are shown. |
| **Frontend Integrator** | Internal | Needs a stable media contract for service list and detail screens. |

---

## 5. User Stories

- **US-01:** As a **Barbershop Owner**, I want to upload an image for a service so that service cards match the intended UI.
- **US-02:** As a **Frontend Integrator**, I want list and detail responses to include the stored service image URL so that the UI can render thumbnails without extra lookups.
- **US-03:** As an **Engineering team member**, I want invalid image types and oversized uploads rejected so that storage behavior is safe and predictable.
- **US-04:** As a **Barbershop Owner**, I want services without images to remain valid so that image upload is optional.

---

## 6. Requirements

### Functional Requirements

- The services module must persist an optional image field such as `imageUrl` for each service.
- The backend must expose a dedicated upload endpoint for service thumbnails.
- The upload contract must accept only `image/jpeg`, `image/png`, and `image/webp`.
- The maximum accepted upload size must be 5 MB.
- A successful upload must update the targeted service record with the final image URL.
- `GET /api/services` must include the image URL when present.
- `GET /api/services/:id` must include the image URL when present.
- Service creation and update flows must continue to support services with no image.
- Upload attempts must verify that the target service belongs to the caller's active organization.
- Integration tests must cover success, invalid MIME, oversized upload, and list/detail serialization including the image URL.

### Non-Functional Requirements

- **Security:** Only authenticated users with access to the active organization may upload or replace a service thumbnail.
- **Tenant Isolation:** Service image upload and reads must remain scoped to the owning organization.
- **Upload Safety:** MIME and size validation must be enforced server-side before file persistence.
- **Contract Consistency:** Service list and detail contracts must use the same media field semantics.
- **Maintainability:** Upload implementation should reuse the existing storage abstraction and match the barbershop-logo validation rules.

---

## 7. Acceptance Criteria

### AC-01: Successful Thumbnail Upload

- [ ] The service thumbnail upload endpoint accepts a valid JPEG, PNG, or WebP file up to 5 MB.
- [ ] A successful upload stores the final image URL on the service record.

### AC-02: Validation Rules

- [ ] Uploading an unsupported MIME type returns a validation error.
- [ ] Uploading a file larger than 5 MB returns a validation error.
- [ ] Uploading against a service outside the active organization is rejected.

### AC-03: Read Model Support

- [ ] `GET /api/services` includes the image URL for services that have one.
- [ ] `GET /api/services/:id` includes the image URL for services that have one.
- [ ] Services without images remain readable and valid.

### AC-04: Test Coverage

- [ ] Integration tests cover upload success, invalid MIME, oversized upload, and list/detail response behavior.

---

## 8. Out of Scope

- Service image galleries or multiple images per service.
- Image editing, cropping, or transformation beyond upload.
- Video uploads or other non-image media.
- Automatic AI-generated thumbnails.