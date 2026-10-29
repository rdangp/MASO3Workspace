# MASO3 SMTP Diagnostic v2

- Moves the Nodemailer dynamic import inside the SMTP-specific error handler.
- Reports missing SMTP module as a sanitized 503 error instead of generic HTTP 500.
- Reports Gmail authentication, timeout and connection errors without disclosing secrets.
- Avoids an exception during transport.close masking the real error.

Configure SMTP_USER and SMTP_APP_PASSWORD in Vercel Production environment, redeploy, then test as Admin. Review Vercel -> Logs for `MASO3 SMTP test failed` or `MASO3 SMTP dependency failed` if unsuccessful. The configured badge confirms variables exist, not that authentication works.
