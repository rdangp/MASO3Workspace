# MASO3 Chat Input Fix

Fixes chat composer textarea collapsing into a tiny box on the right and the Send button falling onto a separate row.

Root cause: previous `maso-enhancements.css` overrode `display` and alignment but did not override `.message-form { flex-direction: column }` from `style.css`. In addition, `textarea` had no explicit `width:100%` and label text was intentionally hidden.

The new rules explicitly use a horizontal flex composer and make the textarea stretch across available width, preserving message submission code and data. Also normalizes message header inheritance.

Deploy updated project and hard-refresh the application. No Blob data migrations or environment variable changes required.
