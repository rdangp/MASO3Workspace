# Timeline visibility and sidebar contrast fix

The previous global `X-Frame-Options: DENY` blocked `/timeline.html` from being embedded in the Workspace iframe. This release replaces that global header with `Content-Security-Policy: frame-ancestors 'self'`, permitting same-origin framing only.

Sidebar buttons and project items use white text on a Burgundy background. Project hover and selection use a contrasting Burgundy highlight.

After deployment, verify Timeline is loaded and inspect browser network response headers for /timeline.html if it remains blank.
