# MASO3 automatic Gmail email notifications

The existing Gmail SMTP test verifies transport only; it did not send task emails. This version sends email when:

- A new task is created (to its creator and assignees).
- A teammate is newly assigned to an existing task.
- A comment is posted (to related active task participants except the author).

Configure SMTP_USER and SMTP_APP_PASSWORD in Vercel Production environment, then redeploy. The recipient must be a MASO3 user with the correct email address.

SMTP failures are logged to Vercel Runtime Logs but do not roll back saved tasks/comments. Vercel Functions await these sends, so large recipient lists can increase request latency; for high volume use an async mail queue/service. A maximum of 20 recipients are attempted for each event. Re-sending prior notifications is not automatic.
