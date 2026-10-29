# MASO3 — Task Save/Delete Conflict Fix

Task create/update/delete is now stored as append-only event files under `maso3-db/v2/task-events/` using the existing private Vercel Blob store.

- Existing `maso3-db/v1/tasks.json` is used as the baseline; **do not delete it**.
- Task changes append a new immutable Blob instead of overwriting `tasks.json`.
- Reads rebuild current task state from the baseline plus ordered events, with a 1.5-second per-instance cache.
- API request shape and permissions are unchanged. `MASO3_READ_WRITE_TOKEN` remains required.

## Deployment

Back up Blob content and deploy all files in this archive. Test create, edit, delete, refresh and re-login.

## Limitations

Vercel Blob is object storage, not a transactional database. Simultaneous updates to the *same* task can still be subject to last-event-wins behavior, and other shared JSON tables (e.g. projects and notifications) still use conditional overwrite. This change is scoped to resolving recurring `tasks` file write conflicts. It does not remove the need for a transactional database under high concurrency.
