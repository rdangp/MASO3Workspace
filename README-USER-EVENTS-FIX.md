# MASO3 — User storage fix (immutable events)

## Why this update
Vercel Blob overwrites can stay stale in cache. The earlier shared `maso3-db/v1/users.json` file caused repeated write conflicts when accounts were created or updated.

## What changed
- Existing `maso3-db/v1/users.json` is retained, and read as the original user snapshot.
- New user creates, updates, password changes and deletes are written as **new immutable private JSON events** under `maso3-db/v2/user-events/`.
- Each users read overlays these events in order onto the original snapshot.
- No existing user passwords, sessions, or data are intentionally cleared.
- `MASO3_READ_WRITE_TOKEN` remains supported.

## Deploy and test
1. Deploy the ZIP contents, preserving Vercel Blob store and all environment variables.
2. Login using the previous administrator account.
3. Create one test member, refresh, verify it appears in User Management and can login.
4. Check Vercel Runtime Logs if any request fails.

## Cautions
- Vercel Blob is object storage, not a transactional database. Concurrent registrations with the same email/username are not guaranteed to be serialized.
- Replaying many events may become slower and more expensive as your user count/edit history grows.
- This patch does not rebuild other tables (sessions, projects, tasks) which still use mutable JSON objects.
- The full production Blob integration could not be exercised here; local static verification only.
- Never delete v1/users.json or v2/user-events/ without taking a full backup.
