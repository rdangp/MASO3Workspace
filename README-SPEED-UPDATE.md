# MASO3 Performance Update

This update improves warm-function response times without modifying the Blob storage format or deleting data.

- Immutable user, project, task, and session events are cached in a bounded per-instance LRU (up to 1,200 objects); concurrent reads of one event are deduplicated.
- Users cache is now 8 seconds, tasks and projects 5 seconds, sessions 2 seconds.
- Writes still invalidate the corresponding collection cache within the same instance.

Important: A different Vercel function instance can briefly serve a slightly stale collection view. Cache resets on cold starts. This does not introduce database-wide transactions and cannot guarantee instant cross-instance consistency. Event listing still scales with history length; event compaction or a true database would be required for a larger application.

Verification: JavaScript syntax and build/package verification passed. npm test requires installing @vercel/blob, unavailable in the offline build environment. Production latency needs measuring via Vercel Logs.
