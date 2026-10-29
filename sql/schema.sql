-- Run this once in Supabase SQL Editor (new / empty project recommended).
-- No anon or authenticated application table policies are provided: only
-- Vercel server-side service-role access is allowed. NEVER expose service key.
CREATE TABLE IF NOT EXISTS public.users (
 email text PRIMARY KEY, username text NOT NULL UNIQUE, name text NOT NULL,
 password text NOT NULL, role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin','manager','member')),
 active boolean NOT NULL DEFAULT true, deleted boolean NOT NULL DEFAULT false,
 version integer NOT NULL DEFAULT 1, auth_source text NOT NULL DEFAULT 'local',
 last_seen bigint NOT NULL DEFAULT 0, email_reminders boolean NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS public.sessions (
 token text PRIMARY KEY, email text NOT NULL REFERENCES public.users(email) ON DELETE CASCADE,
 expires bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_expire ON public.sessions(expires);
CREATE TABLE IF NOT EXISTS public.projects (
 id text PRIMARY KEY, name text NOT NULL, description text NOT NULL DEFAULT '',
 color text NOT NULL DEFAULT 'burgundy', version integer NOT NULL DEFAULT 1,
 created text NOT NULL, owner_email text NOT NULL DEFAULT '', shared_with text NOT NULL DEFAULT '[]'
);
CREATE TABLE IF NOT EXISTS public.tasks (
 id text PRIMARY KEY, title text NOT NULL, description text NOT NULL DEFAULT '',
 status text NOT NULL DEFAULT 'todo', priority text NOT NULL DEFAULT 'medium',
 assignee text NOT NULL DEFAULT '', due text NOT NULL DEFAULT '',
 version integer NOT NULL DEFAULT 1, updated text NOT NULL, editor text NOT NULL,
 project_id text NOT NULL REFERENCES public.projects(id), owner_email text NOT NULL DEFAULT '',
 shared_with text NOT NULL DEFAULT '[]', assignee_email text NOT NULL DEFAULT '',
 reminder_days text NOT NULL DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS tasks_by_project ON public.tasks(project_id);
CREATE TABLE IF NOT EXISTS public.comments (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, task_id text NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
 sender text NOT NULL, sender_name text NOT NULL, body text NOT NULL, created text NOT NULL
);
CREATE TABLE IF NOT EXISTS public.messages (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 sender text NOT NULL, sender_name text NOT NULL, recipient text NOT NULL DEFAULT '',
 body text NOT NULL, created text NOT NULL
);
CREATE TABLE IF NOT EXISTS public.chat_reads (
 email text NOT NULL REFERENCES public.users(email) ON DELETE CASCADE,
 peer text NOT NULL, last_id bigint NOT NULL DEFAULT 0, PRIMARY KEY(email,peer)
);
CREATE TABLE IF NOT EXISTS public.task_notifications (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 recipient text NOT NULL, actor_name text NOT NULL, task_id text NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
 kind text NOT NULL, created text NOT NULL, is_read boolean NOT NULL DEFAULT false,
 reminder_key text UNIQUE
);
CREATE TABLE IF NOT EXISTS public.shared_files (
 id text PRIMARY KEY, owner_email text NOT NULL, name text NOT NULL,
 size integer NOT NULL, shared_with text NOT NULL DEFAULT '[]',
 created bigint NOT NULL, expires bigint NOT NULL, uploaded boolean NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS public.login_attempts (
 id text PRIMARY KEY, count integer NOT NULL DEFAULT 0, until bigint NOT NULL DEFAULT 0
);
-- The service role bypasses RLS; public clients must NOT read these tables.
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['users','sessions','projects','tasks','comments','messages','chat_reads','task_notifications','shared_files','login_attempts'] LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
 END LOOP;
END $$;
-- Run on a new Supabase project and keep bucket private. Signed URLs authorize uploads/downloads.
INSERT INTO storage.buckets (id,name,public,file_size_limit)
VALUES ('maso-files','maso-files',false,20971520)
ON CONFLICT (id) DO UPDATE SET public=false,file_size_limit=20971520;
