# MASO3 Workspace — Task & Navigation Update

## Changes
- A Burgundy sidebar replaces the light sidebar background.
- Project Timeline now opens inside the Workspace content area using an embedded same-origin view, rather than navigating the browser to another page. Navigation buttons close the embedded view.
- Board Share copies a URL that resolves the selected project by name when another permitted user opens it. Sharing a URL does not bypass project permissions.
- Task cards and task management titles display comment counts when the task can be matched unambiguously.
- Task editing includes a compact inline comments section with a simple thread and comment composer instead of WhatsApp-style chat bubbles.
- New tasks automatically include the creator as the first assignee. Existing task edit UI has an Additional assignees control for the creator, administrator, and manager. The backend enforces the corresponding permissions.
- New assignee notifications and new comment notifications use the existing notification interface. Backend comments and notification records now use immutable Blob events, avoiding overwrite conflicts. Existing JSON files remain readable.

## Limitations & deployment
- The current prebuilt application bundle has not been recompiled; newer controls are progressive enhancements inserted by `public/assets/task-extras.js` and `maso-enhancements.js`.
- New task creator assignment and multi-assignee support are handled by the backend; original one-person assignee dropdown remains in the base editor.
- The inline task panels locate tasks by title. If more than one task has the same title, the panel may require more specific lookup; verify task selection carefully.
- The Timeline uses a same-origin iframe inside Workspace, not a native React route.
- Concurrent updates to exactly the same task still use a version check and may be rejected with a refresh instruction.
- The application runs on private Vercel Blob; no SQL database was added.
- Always back up your private Blob store before deployment. Verify create/edit/delete, notifications, comments, sessions, and Board sharing in a staging project before promoting to production.

## Local checks
- `node --check api/index.js`
- `node --check public/assets/maso-enhancements.js`
- `node --check public/assets/task-extras.js`
- `npm run build` performs package verification only, not a full React rebuild.
