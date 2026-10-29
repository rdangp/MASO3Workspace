# SMTP test troubleshooting update

- `Configured` only means SMTP_USER and SMTP_APP_PASSWORD exist, not that Gmail has accepted them.
- SMTP test now provides categorized errors for Gmail authentication (535/EAUTH), timeouts and recipient rejection.
- Gmail App Password: enable 2-Step Verification and create an App Password (16 characters), not your normal password.
- Set SMTP_USER to the Gmail account that owns that App Password.
- After changing Vercel Environment Variables, redeploy.
- On failures, inspect Vercel Logs for `MASO3 SMTP test failed` without sharing secrets.
- SMTP port 465 uses implicit TLS.

This update does not change Blob data.
