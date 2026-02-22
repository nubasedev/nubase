--
-- Nubase Database Schema
-- This is the source of truth for the database structure.
-- Run `npm run db:schema-sync` to copy this to Docker init folders.
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Extensions
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;
COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Application user (non-superuser, subject to RLS)
--

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'nubase_app') THEN
    CREATE ROLE nubase_app WITH LOGIN PASSWORD 'nubase_app';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE nubase TO nubase_app;
GRANT USAGE ON SCHEMA public TO nubase_app;


SET default_tablespace = '';
SET default_table_access_method = heap;


-- ============================================================================
-- TABLES
-- ============================================================================

--
-- Workspaces
--

CREATE TABLE public.workspaces (
    id integer NOT NULL,
    slug character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

ALTER TABLE public.workspaces ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.workspaces_id_seq
    START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
);

ALTER TABLE ONLY public.workspaces ADD CONSTRAINT workspaces_pk PRIMARY KEY (id);
ALTER TABLE ONLY public.workspaces ADD CONSTRAINT workspaces_slug_unique UNIQUE (slug);


--
-- Users (root-level, no workspace association - users can belong to multiple workspaces)
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    display_name character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
);

ALTER TABLE ONLY public.users ADD CONSTRAINT users_pk PRIMARY KEY (id);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- User-Workspace Association (links users to workspaces - a user can belong to multiple workspaces)
--

CREATE TABLE public.user_workspaces (
    user_id integer NOT NULL,
    workspace_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);

ALTER TABLE ONLY public.user_workspaces ADD CONSTRAINT user_workspaces_pk PRIMARY KEY (user_id, workspace_id);
ALTER TABLE ONLY public.user_workspaces ADD CONSTRAINT user_workspaces_user_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.user_workspaces ADD CONSTRAINT user_workspaces_workspace_fk FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Tickets
--

CREATE TABLE public.tickets (
    id integer NOT NULL,
    workspace_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description character varying(1000),
    assignee_id integer
);

ALTER TABLE public.tickets ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tickets_id_seq
    START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
);

ALTER TABLE ONLY public.tickets ADD CONSTRAINT tickets_pk PRIMARY KEY (id);
ALTER TABLE ONLY public.tickets ADD CONSTRAINT tickets_workspace_fk FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id);
ALTER TABLE ONLY public.tickets ADD CONSTRAINT tickets_assignee_fk FOREIGN KEY (assignee_id) REFERENCES public.users(id);


-- ============================================================================
-- PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO nubase_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO nubase_app;


-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Tickets: only visible/modifiable for the current workspace
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY tickets_workspace_isolation ON public.tickets
    TO nubase_app
    USING (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::integer)
    WITH CHECK (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::integer);


-- User-Workspaces: only visible/modifiable for the current workspace
-- This allows users to see which users belong to their workspace
ALTER TABLE public.user_workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_workspaces_workspace_isolation ON public.user_workspaces
    TO nubase_app
    USING (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::integer)
    WITH CHECK (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::integer);


-- Note: workspaces table does NOT have RLS - it must be queried to look up workspace
-- by slug before the workspace context is established.

-- Note: users table does NOT have RLS - users exist at root level and can
-- belong to multiple workspaces. Access control is managed through user_workspaces.
