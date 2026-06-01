# Security Specification & "Dirty Dozen" Attack Payloads

## 1. Data Invariants

- **Users**: Users can only modify their own profile information (`request.auth.uid == userId`). An admin conceptual block allows users with `is_admin == true` (verified via checking their doc in `/users/{userId}`) to read list-wide values. However, users are strictly banned from changing their own `is_admin` status.
- **Profiles**: A profile can be created by any registered user. Only people associated with the profile (either matching `profile.created_by == request.auth.uid`, or having their user document's `assigned_profile_id == profile.id`) can read and write to this profile.
- **Memories**: Memories must belong to a valid Profile. Users can only write/read memories for their assigned profile (`request.auth.token.email_verified == true` is required if standard write occurs, and the user's `assigned_profile_id` must match the memory's `profile_id`). No recursive costs in list queries.
- **Photos**: Up to 5 polaroids are allowed per couple on the wall. A user can only write a polaroid containing their own UID as the `user_id`, or as an admin.

---

## 2. The Dirty Dozen Attack Payloads

We simulate 12 malicious payloads aiming to compromise Identity, Integrity, or State.

### Case 1: ID Spoofing in User Profile Creation
- **Action**: Creating a `/users/attackerUID` document but setting `id` as `targetUID` to impersonate another partner.
- **Expectation**: `PERMISSION_DENIED` - UID in document must match authenticated request UID.

### Case 2: Self-Promotion to Administrator
- **Action**: Updating `/users/attackerUID` setting `is_admin: true` to bypass administrative checks.
- **Expectation**: `PERMISSION_DENIED` - Administrative fields are immutable or can only be managed by trusted roles.

### Case 3: Unauthorized Profile Reading (PII Leak)
- **Action**: Querying another couple's `/profiles/{someProfileId}` when the current user is not associated.
- **Expectation**: `PERMISSION_DENIED` - Reads are constrained to associated partner IDs.

### Case 4: Profile Theft (Modifying `created_by`)
- **Action**: Updating a `/profiles/{coupleId}` but changing the owner metadata field `created_by` to the attacker.
- **Expectation**: `PERMISSION_DENIED` - Owner fields are immutable.

### Case 5: Temporal Contamination (Fake Start Date)
- **Action**: Sending client-provided dates bypassing formatting or injecting future timestamps without verification.
- **Expectation**: `PERMISSION_DENIED` - Immutable or strictly validated format fields.

### Case 6: Memory Injection into Other Couples
- **Action**: Creating a `/memories/{newId}` with `profile_id: "victim_profile"`.
- **Expectation**: `PERMISSION_DENIED` - `profile_id` must match the active user's `assigned_profile_id`.

### Case 7: Ghost Field Injection in Memory Update (Shadow Update)
- **Action**: Updating a memory with `is_hacked: true` where `affectedKeys` shouldn't allow extension.
- **Expectation**: `PERMISSION_DENIED` - Reject via `affectedKeys().hasOnly()` or matching schema validate.

### Case 8: Memory Metadata Corruption (`created_at` Spoofing)
- **Action**: Sending a fake chronological timestamp in `created_at` instead of the system request time.
- **Expectation**: `PERMISSION_DENIED` - Must match `request.time`.

### Case 9: Photo Flooding (Bypassing the Polaroid Ceiling)
- **Action**: Spamming the `/photos` collection with unbounded uploads past the limits.
- **Expectation**: `PERMISSION_DENIED` - Blocked once active counts are validated.

### Case 10: Stealing Polaroid ID ownership
- **Action**: Setting `user_id` to a victim's user ID while uploading a photo from an attacker's account.
- **Expectation**: `PERMISSION_DENIED` - Document `user_id` must match `request.auth.uid`.

### Case 11: Modifying someone else's Polaroid
- **Action**: Deleting or updating a polaroid card registered under other couples' profiles.
- **Expectation**: `PERMISSION_DENIED` - Users can only delete their own polaroids.

### Case 12: Blanket Reading of other couples' photo streams
- **Action**: Querying `/photos` without owner-restricted filters to scrape private couple images.
- **Expectation**: `PERMISSION_DENIED` - Enforced rule-side query restriction requiring user ownership constraints on streams.

---

## 3. Test Runner Definition (Verification Checklist)

The following schema tests are validated during compile blocks of Firestore Rules to ensure protection.
- All requests require `request.auth != null`.
- Verified emails `request.auth.token.email_verified == true` protect core write scopes.
