# MASO3 Vercel Blob — Performance Update

Changes:
- User event reads now execute concurrently (maximum 12) instead of one-by-one.
- A 4-second in-memory per-function-instance user snapshot avoids repeatedly listing/downloading all account events for adjacent page/API requests.
- User cache is invalidated immediately after a successful account event write on the same function instance.
- Full-table reads no longer repeatedly download the same Blob in chunks of 1,000 rows.
- Several UI refresh intervals were increased from 4 to 12 seconds to reduce redundant network activity.

Existing Blob paths and user events are unchanged. Your MASO3_READ_WRITE_TOKEN remains the same.

Notes:
- Vercel Functions run in multiple separate instances; the cache is local to each instance, not globally synchronized. Cross-instance user changes can take up to approximately 4 seconds to become visible in a warm instance. This is NOT suitable for strict instant permission revocation.
- Existing event history remains O(number of user events) on cold starts. If event volume grows significantly, use compaction/indexing or a transactional database.
- No production performance benchmark or deployment-level test has been performed.
