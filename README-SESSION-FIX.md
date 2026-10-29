# MASO3 Session & Timeline hotfix

- Session writes now append immutable events under `maso3-db/v2/session-events/` instead of overwriting `maso3-db/v1/sessions.json`.
- Existing sessions remain readable through the old snapshot. Do not delete the snapshot.
- Session refresh only writes when the session has less than five minutes remaining.
- Timeline navigation uses the same 14px normal-weight sidebar typography and an SVG icon.

Deploy with the existing `MASO3_READ_WRITE_TOKEN`; preserve all Blob data.

**Caveat:** Event collections are not a transactional database. The event history grows with use, making log compaction a future optimization.
