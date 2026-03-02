# campusX

## Current State

The app stores all student profile data (name, email, mobile, course, year, division, rollNumber, role, avatarUrl, bio, department) in browser **localStorage** only. Each browser has its own isolated localStorage, so Student A (Browser 1) and Student B (Browser 2) cannot see each other in the Admin Panel or Student Directory. The Motoko backend only stores a minimal `UserProfile` with `name`, `avatarUrl`, and `rollNumber` -- it is not used as the source of truth for profiles.

## Requested Changes (Diff)

### Add
- Full student profile stored in Motoko backend stable storage (email, mobile, name, course, yearOfDegree, division, rollNumber, department, bio, avatarUrl, role)
- Backend query: `getAllProfiles()` -- returns all registered profiles (admin only)
- Backend query: `getAllProfilesPublic()` -- returns all profiles for directory (any authenticated user)
- Backend mutation: `registerUser(profile)` -- saves a full profile for the caller
- Backend mutation: `updateProfile(profile)` -- updates caller's own profile
- Backend query: `getMyProfile()` -- returns the caller's own profile
- Frontend: on signup/profile setup, write to backend canister (not just localStorage)
- Frontend: on profile update, write to backend canister
- Frontend: Student Directory reads from backend canister (`getAllProfilesPublic`)
- Frontend: Admin Panel reads from backend canister (`getAllProfiles`)
- Frontend: On app load, fetch caller's profile from backend and sync to local state

### Modify
- `saveUserProfile` in storage.ts: also writes to backend canister
- `getAllUserProfiles` in storage.ts: reads from backend canister (with localStorage fallback for offline)
- AppContext: on init, calls `getMyProfile()` from backend to hydrate `currentUser`
- DirectoryPage: fetches profiles from backend on mount
- AdminPanelPage: fetches profiles from backend on mount

### Remove
- Dependency on localStorage as the primary source of truth for profiles across users

## Implementation Plan

1. Regenerate Motoko backend with full `StudentProfile` type including all profile fields, `registerUser`, `updateProfile`, `getMyProfile`, `getAllProfilesPublic`, `getAllProfiles` (admin-gated) endpoints
2. Update `backend.d.ts` bindings to match
3. Update `AppContext` to call `getMyProfile()` on init and use backend as source of truth
4. Update `ProfileSetupPage` and profile save logic to call `registerUser`/`updateProfile` on the backend
5. Update `DirectoryPage` to call `getAllProfilesPublic()` on mount and show real results
6. Update `AdminPanelPage` to call `getAllProfiles()` on mount
7. Keep localStorage as a fast local cache for the current user's own profile (for instant UI on reload), but always treat the backend as the source of truth for multi-user data
