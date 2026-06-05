# Security Specification & Database Integrity Rules (Supabase RLS)

This document specifies the data invariants, Row-Level Security (RLS) rules, table constraints, and database triggers that protect client identity, data integrity, and privacy on FlowerLove.

---

## 1. Core Data Invariants & Database Schema

### Profiles (`public.profiles`)
- Stores the shared configuration for the couple.
- **Created By**: Handed by the authenticated creator on onboarding setup.
- **URL Check Constraint**: The `image_url` field is strictly verified at the database layer to be either null, empty, or a valid HTTP/HTTPS URL:
  `CONSTRAINT check_profile_image_url CHECK (image_url IS NULL OR image_url = '' OR image_url ~* '^https?://[^\s/$.?#].[^\s]*$')`

### Users (`public.users`)
- Links individual registers and login sessions to shared profiles.
- Any user authenticated in Supabase Auth can create their own public record holding an identical UUID.
- Privilege escalation is globally prevented; promotion to admin is protected.

### Memories (`public.memories`)
- Stores romantic milestones. Must belong to the user's active `profile_id`.
- **URL Check Constraint**:
  `CONSTRAINT check_memory_image_url CHECK (image_url IS NULL OR image_url = '' OR image_url ~* '^https?://[^\s/$.?#].[^\s]*$')`

### Photos (`public.photos`)
- Wall Polaroids.
- **URL Check Constraint**:
  `CONSTRAINT check_photo_url CHECK (url ~* '^https?://[^\s/$.?#].[^\s]*$')`
- **Server-Side Limit constraints (5 Photos Ceiling)**: Checked via database trigger `trigger_check_photos_limit` on `BEFORE INSERT` checks.

---

## 2. Row Level Security (RLS) Policies

All tables reside within the `public` schema in PostgreSQL with RLS strictly enabled:

### A. Profiles policies
- **Select / Update**: Restricted to the owner user (`created_by = auth.uid()::text`) or their assigned partner (whose `assigned_profile_id` matches, checked via subquery), or if the user is a system administrator (`public.is_admin(auth.uid()::text) = true`).
- **Insert**: Allowed only if the document's creator matches the authenticated UID or if the user is an admin.
- **Delete**: Exclusively allowed for the profile creator or an admin.

### B. Users policies
- **Select**: Allowed for the user themselves, their paired partner, or an admin.
- **Insert**: Restrictive check matching the authenticated user's ID (`auth.uid()::text = id`).
- **Update**: Restricted to the users themselves or admins. Prevents privilege escalation.

### C. Memories policies
- **Select / Insert / Update / Delete**: Restricted to users whose active `assigned_profile_id` matches the memory's `profile_id`, or system administrators.

### D. Photos policies
- **Select**: Users can read photos belonging to their couple profile, or if they are an admin.
- **Insert**: Users can upload into their couple profile with their own `user_id` authenticated ID, or if they are an admin.
- **Delete**: Allowed for the author of the photo, any partner in the couple profile, or an admin.

---

## 3. Server-Side Limits & Integrity Constraints

### Photo Flood Prevention
To prevent storage abuse and enforce the strict maximum of 5 polaroid cards printed on the wall, the following trigger is executed synchronously on every insertion:

```sql
CREATE OR REPLACE FUNCTION public.check_photos_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT count(*) FROM public.photos WHERE profile_id = NEW.profile_id) >= 5 THEN
        RAISE EXCEPTION 'Limite de 5 fotos por casal atingido para este perfil!';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### URL Safety Check
The regex `^https?://[^\s/$.?#].[^\s]*$` enforces that URLs are clean, secure external or Supabase storage web links, weeding out malformed payloads, file paths, or inline executable scripts.

### Recursive Check Resolution (`is_admin` bypassing)
To bypass table scan cycles and prevent infinite loops when querying users within the user select policy, the `public.is_admin(user_uid)` helper is configured as a `SECURITY DEFINER` function, executing with bypassed privilege loops.
