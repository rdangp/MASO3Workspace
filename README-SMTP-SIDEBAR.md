# MASO3 Gmail SMTP + sidebar

Vercel Environment Variables (Production):
- SMTP_USER = your full Gmail/Google Workspace email address
- SMTP_APP_PASSWORD = a Google App Password (NOT the normal Gmail password)

Gmail SMTP: smtp.gmail.com, port 465 SSL. Enable Google 2-step verification and create an App Password if allowed by your Google Workspace policy. Deploy again after setting variables.

An administrator sees Gmail SMTP in the left sidebar and can check server configuration and send a test email. Credentials never appear in the frontend nor in Vercel Blob. SMTP is implemented for test delivery; automatic email notifications are NOT enabled by this change.

Sidebar: toggle the menu using the button at top. Preference is saved in localStorage.
