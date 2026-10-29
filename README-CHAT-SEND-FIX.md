Chat send hotfix:
- Immutable message event storage, while retaining original messages.json as read-only baseline.
- Enter submits; Shift+Enter inserts newline; IME composition is respected.
- Only API and chat source/bundle changed; Blob configuration unchanged.
- Existing legacy messages remain readable.
