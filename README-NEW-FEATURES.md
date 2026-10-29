# MASO3 — Project Timeline / Local Login / Compact Chat

## Changes
- **Project Timeline**: new `/timeline.html` page, linked from the main sidebar. Uses existing `/api/workspace` and existing cookie session. Month, project and status filters, due date calendar, task summary and list. Only accessible tasks are displayed. No invented task start dates.
- **LDAP**: the unsupported `/api/ad/*` endpoints now return 404; Active Directory admin widgets are hidden by the enhancements script. Existing users are not deleted. Local login remains. Any previously provisioned AD accounts are not migrated automatically: create local accounts if they need access.
- **Chat**: compact message bubbles, smaller timestamps, scrollable conversation and concise composer. Existing conversation APIs and messages unchanged.
- **Data**: Vercel Blob storage and MASO3_READ_WRITE_TOKEN are unchanged; no migration or reset needed.

## Deploy
1. Upload all package contents (including `public/timeline.html` and `public/assets/maso-enhancements.*` and `public/assets/timeline.js`).
2. Redeploy on Vercel and hard-refresh the app.
3. Open `/timeline.html` after login. Verify chat, local account management and timeline filtering.

## Limitation
Tasks currently have due dates, but not explicit planned start dates. Timeline therefore shows deadline milestones rather than a duration-based Gantt chart. Current deployment uses prebuilt `public/assets/app.js`; the sidebar link, LDAP UI removal and chat styles are applied using `maso-enhancements.js`. If you rebuild `src` with another pipeline, carry those enhancements forward or integrate them into the components.
