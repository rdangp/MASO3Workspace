# MASO3 dark mode + Groq AI

## Set GROQ_API_KEY in Vercel Settings > Environment Variables and redeploy

Model: openai/gpt-oss-20b through https://api.groq.com/openai/v1/chat/completions.

AI Chatbot appears in left sidebar for authenticated users. Chats use in-browser state (not saved to Blob); prompt is sent to Groq and no workspace data is sent automatically.

Dark mode changes use html[data-theme="dark"] CSS, preserving light mode Burgundy.

Security: backend validates session before Groq API; key remains on server. For production, consider quotas/rate limits per user.
