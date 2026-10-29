# MASO3 – Create User conflict hotfix

- Removed periodic writes to `users.json` from `/api/presence`. Previously every open browser mutated the same users JSON file at 30-second intervals, contending with Create User and Edit User.
- Presence now uses non-expired sessions as an online approximation (users may show online for a short period after closing their tab).
- Retained conditional ETag writes to avoid lost updates. Increased bounded conflict retry attempts from 5 to 8.
- No schema or existing Blob data is deleted or migrated.
- Environment variables remain `MASO3_READ_WRITE_TOKEN`, `SETUP_KEY`, and `CRON_SECRET`.

After deploy, try to create a user. If HTTP 409 continues, inspect the detailed Vercel Runtime Logs for the `MASO3 Blob write conflict` line.
