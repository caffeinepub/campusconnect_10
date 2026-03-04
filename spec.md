# campusX

## Current State

Full-stack campus social app with:
- Student profiles, login, friend requests, chat (backend-synced)
- Posts/feed (backend-synced via createPost/getAllPosts)
- Polls, Notices, Activities (localStorage only — NOT backend-synced)
- Admin Panel with role toggle (calls `assignCallerUserRole` but passing wrong args)
- Settings page with "Make me Admin" button (localStorage only, not backend-synced)
- No account deletion feature

## Requested Changes (Diff)

### Add
- Backend storage for Polls (create, get all, vote)
- Backend storage for Notices (create, get all)
- Backend storage for Activities (create, get all)
- Account deletion: user can permanently delete their own account from Settings (with confirmation dialog), removes profile + friend requests from backend; frontend logs out
- Admin can delete any user account from Admin Panel
- Proper role assignment: admin promotes/demotes user via backend `assignCallerUserRole` correctly by passing target user's Principal

### Modify
- AppContext: load polls, notices, activities from backend on mount (poll every 30s), write to backend on create
- AdminPanelPage: fix `handleToggleRole` — the current code calls `assignCallerUserRole(principal, role)` but the backend function signature may differ; ensure admin-only role changes persist across browsers
- SettingsPage: "Make me Admin" should also call backend to persist the role change (not only localStorage)
- PollsPage: `addPoll` must call backend; votes must persist to backend
- NoticesPage: `addNotice` must call backend
- ActivitiesPage: `addActivity` must call backend

### Remove
- Nothing removed

## Implementation Plan

1. **Backend (main.mo)**: Add Motoko types and CRUD for:
   - `BackendNotice` with id, title, content, authorName, authorRole, priority, department, timestamp
   - `BackendActivity` with id, name, description, date, time, organizer, category, location, registrations
   - `BackendPoll` with id, question, options (id+text+votes), authorId, authorName, deadline, active, timestamp
   - `BackendPollVote` map (pollId+principalId → optionId)
   - Account deletion: `deleteMyAccount()` — removes own profile and friend requests; admin `deleteProfile` already exists
   - Expose: createNotice, getAllNotices, createActivity, getAllActivities, createPoll, getAllPolls, votePoll (idempotent), deleteMyAccount

2. **AppContext**: 
   - Add backend-fetch for notices, activities, polls on actor ready (interval 30s)
   - Replace `addNotice`/`addActivity`/`addPoll` to write to backend, then refresh
   - `votePoll` to call backend votePoll then refresh
   - Add `deleteMyAccount` action that calls backend and logs out

3. **SettingsPage**: 
   - "Make me Admin" also calls `assignCallerUserRole(myPrincipal, admin)` 
   - Add "Delete Account Permanently" section with confirm dialog
   
4. **AdminPanelPage**: Fix role toggle — the function is called `assignCallerUserRole` which only lets the CALLER set their OWN role. Since admin needs to set another user's role, a new backend function `setUserRole(target: Principal, role: UserRole)` (admin-only) is needed.

5. **PollsPage / NoticesPage / ActivitiesPage**: Wire to backend context actions.
