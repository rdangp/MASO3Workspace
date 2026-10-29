# MASO3 HTTP 500 startup hotfix

Fixed an invalid named import of `BlobAlreadyExistsError` from `@vercel/blob` in `api/index.js`. This symbol is not exported by the documented Vercel Blob SDK API, and the static import can prevent the serverless function from loading before request handling starts.

Retained `BlobPreconditionFailedError` checks plus message-based conflict detection. No data migration or reset. The store environment variable remains `MASO3_READ_WRITE_TOKEN` (with `BLOB_READ_WRITE_TOKEN` fallback).

Redeploy and retest. If HTTP 500 persists, inspect Vercel > Logs and share the stack trace, not credentials.
