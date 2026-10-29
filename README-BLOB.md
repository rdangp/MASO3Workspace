# MASO-3 — Vercel Blob edition

This version removes **Supabase, Postgres and all external database dependencies**. Workspace records are stored in private JSON objects (`maso3-db/v1/*.json`) in Vercel Blob, and shared files are stored under `maso3-files/`.

## Deploy
1. Import this repository to Vercel, set Framework Preset to **Other**. `npm install` will install `@vercel/blob`.
2. In Vercel > Storage, create and connect a **PRIVATE** Blob store. Connect it to all deployment environments you use; verify the env variable `MASO3_READ_WRITE_TOKEN` exists (custom Vercel store prefix). The API automatically maps this to the default SDK variable internally; `BLOB_READ_WRITE_TOKEN` is still supported as a fallback..
3. Set `SETUP_KEY` to a **random secret at least 24 characters**. Set `CRON_SECRET` to another random secret of at least 16 characters. Do not expose them in the browser.
4. Deploy. Visit `/setup.html` to create the initial administrator account.
5. Remove old `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` from Vercel environment variables; they are unused.

## Important caveats
- **Existing Supabase data is not automatically migrated.** Back up/export the old database and files first. This deployment starts with a fresh Blob workspace unless data is imported separately.
- Blob is **object storage, not a relational database**. Every table is a JSON Blob; reads and writes can be slower and more expensive as usage grows. Conditional ETags/retries reduce lost updates on one table but cannot provide ACID transactions or foreign-key guarantees. Best for small teams and modest workloads, not a high-concurrency application.
- Database content, password hashes, sessions, and files MUST be in a **private** Blob store. Do not use a public store.
- Direct browser uploads use `@vercel/blob/client` through `esm.sh` so the frontend can be deployed without rebuilding its precompiled React bundle. The site needs network access to that CDN for file uploads. App records use only Vercel Blob.
- 20 MB maximum per file and 100 MB of active files per owner are enforced by the server. Expired files and sessions are removed via the Vercel Cron endpoint.
- Clients retain their built-in periodic polling; realtime Supabase notifications are disabled.

## Login conflict fix (2026-10-27)
Earlier versions incorrectly read the ETag as `result.etag` rather than `result.blob.etag`. Repeated updates to `login_attempts` and `sessions` could fail with `Concurrent changes detected`. The fix reads the correct ETag and disables caching for database reads (`useCache:false`). Existing administrator accounts and stored Blob data are preserved; simply redeploy.

### User creation and Blob write conflicts (27 October 2026)

This revision verifies each table's latest Blob ETag using `head()` before conditional writes, retries transient conflicts with backoff, and displays an explicit error if Vercel's cached content cannot yet be refreshed. No existing Blob data needs to be deleted. IMPORTANT: Vercel Blob has eventual cache propagation for overwritten JSON objects; it is not a transactional multi-user database. If conflicts persist, use an actual transactional store for user/session/workspace records and reserve Blob for attachments. `npm run test` requires `npm install` first.
