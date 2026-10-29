# MASO3 Vercel Blob API fix

- Removed redundant head() consistency comparison. Blob private get() uses useCache:false and supplies ETag for atomic conditional put().
- Retry count reduced from 12 to 5 to avoid long Vercel Functions timeouts. Concurrent-write safety is retained through ifMatch.
- Client-side API JSON parsing now reports HTTP status and the text returned by Vercel rather than `Unexpected token`.
- The server logs internal errors to Vercel Runtime Logs.

This update does not reset or migrate existing Vercel Blob data. Existing environment variables MASO3_READ_WRITE_TOKEN, SETUP_KEY, and CRON_SECRET are unchanged.

If HTTP 500 or 504 continues, inspect Vercel > Logs for the failing API route.
