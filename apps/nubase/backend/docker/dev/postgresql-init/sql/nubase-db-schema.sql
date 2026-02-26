--
-- Nubase System Database Schema (nubase_db)
-- This is the source of truth for the system database structure.
-- Contains: workspaces, users, user_workspaces
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
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'nubase_db') THEN
    CREATE ROLE nubase_db WITH LOGIN PASSWORD 'nubase_db';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE nubase_db TO nubase_db;
GRANT USAGE ON SCHEMA public TO nubase_db;


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
-- App Deployments (stores uploaded JS bundles per workspace)
--

CREATE TABLE public.app_deployments (
    id integer NOT NULL,
    workspace_id integer NOT NULL,
    version integer NOT NULL DEFAULT 1,
    schema_version character varying(64) NOT NULL,
    bundle text NOT NULL,
    source_map text,
    manifest jsonb NOT NULL DEFAULT '{}',
    checksum character varying(64) NOT NULL,
    is_active boolean NOT NULL DEFAULT false,
    deployed_by integer NOT NULL,
    deployed_at timestamp without time zone DEFAULT now()
);

ALTER TABLE public.app_deployments ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.app_deployments_id_seq
    START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
);

ALTER TABLE ONLY public.app_deployments ADD CONSTRAINT app_deployments_pk PRIMARY KEY (id);
ALTER TABLE ONLY public.app_deployments ADD CONSTRAINT app_deployments_workspace_fk FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.app_deployments ADD CONSTRAINT app_deployments_deployed_by_fk FOREIGN KEY (deployed_by) REFERENCES public.users(id);


--
-- Hook Registrations (denormalized from manifest for fast CRUD lookup)
--

CREATE TABLE public.hook_registrations (
    id integer NOT NULL,
    workspace_id integer NOT NULL,
    deployment_id integer NOT NULL,
    hook_key character varying(255) NOT NULL,
    entity_name character varying(100) NOT NULL,
    hook_type character varying(50) NOT NULL
);

ALTER TABLE public.hook_registrations ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.hook_registrations_id_seq
    START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
);

ALTER TABLE ONLY public.hook_registrations ADD CONSTRAINT hook_registrations_pk PRIMARY KEY (id);
ALTER TABLE ONLY public.hook_registrations ADD CONSTRAINT hook_registrations_workspace_fk FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.hook_registrations ADD CONSTRAINT hook_registrations_deployment_fk FOREIGN KEY (deployment_id) REFERENCES public.app_deployments(id) ON DELETE CASCADE;


--
-- Custom Endpoint Registrations (denormalized from manifest for route registration)
--

CREATE TABLE public.custom_endpoint_registrations (
    id integer NOT NULL,
    workspace_id integer NOT NULL,
    deployment_id integer NOT NULL,
    method character varying(10) NOT NULL,
    path character varying(255) NOT NULL
);

ALTER TABLE public.custom_endpoint_registrations ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.custom_endpoint_registrations_id_seq
    START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
);

ALTER TABLE ONLY public.custom_endpoint_registrations ADD CONSTRAINT custom_endpoint_registrations_pk PRIMARY KEY (id);
ALTER TABLE ONLY public.custom_endpoint_registrations ADD CONSTRAINT custom_endpoint_registrations_workspace_fk FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.custom_endpoint_registrations ADD CONSTRAINT custom_endpoint_registrations_deployment_fk FOREIGN KEY (deployment_id) REFERENCES public.app_deployments(id) ON DELETE CASCADE;


--
-- Entity Metadata (UI metadata for entities: display names, icons, field labels, layouts)
--

CREATE TABLE public.entity_metadata (
    id integer NOT NULL,
    workspace_id integer NOT NULL,
    table_name character varying(100) NOT NULL,
    display_name character varying(255),
    description text,
    icon character varying(100),
    metadata jsonb NOT NULL DEFAULT '{}'
);

ALTER TABLE public.entity_metadata ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.entity_metadata_id_seq
    START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
);

ALTER TABLE ONLY public.entity_metadata ADD CONSTRAINT entity_metadata_pk PRIMARY KEY (id);
ALTER TABLE ONLY public.entity_metadata ADD CONSTRAINT entity_metadata_workspace_table_unique UNIQUE (workspace_id, table_name);
ALTER TABLE ONLY public.entity_metadata ADD CONSTRAINT entity_metadata_workspace_fk FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


-- ============================================================================
-- PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO nubase_db;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO nubase_db;


-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- User-Workspaces: only visible/modifiable for the current workspace
-- This allows users to see which users belong to their workspace
ALTER TABLE public.user_workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_workspaces_workspace_isolation ON public.user_workspaces
    TO nubase_db
    USING (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::integer)
    WITH CHECK (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::integer);

-- App Deployments: workspace-scoped
ALTER TABLE public.app_deployments ENABLE ROW LEVEL SECURITY;

CREATE POLICY app_deployments_workspace_isolation ON public.app_deployments
    TO nubase_db
    USING (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::integer)
    WITH CHECK (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::integer);

-- Hook Registrations: workspace-scoped
ALTER TABLE public.hook_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY hook_registrations_workspace_isolation ON public.hook_registrations
    TO nubase_db
    USING (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::integer)
    WITH CHECK (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::integer);

-- Custom Endpoint Registrations: workspace-scoped
ALTER TABLE public.custom_endpoint_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY custom_endpoint_registrations_workspace_isolation ON public.custom_endpoint_registrations
    TO nubase_db
    USING (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::integer)
    WITH CHECK (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::integer);

-- Entity Metadata: workspace-scoped
ALTER TABLE public.entity_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY entity_metadata_workspace_isolation ON public.entity_metadata
    TO nubase_db
    USING (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::integer)
    WITH CHECK (workspace_id = NULLIF(current_setting('app.current_workspace_id', true), '')::integer);


-- Note: workspaces table does NOT have RLS - it must be queried to look up workspace
-- by slug before the workspace context is established.

-- Note: users table does NOT have RLS - users exist at root level and can
-- belong to multiple workspaces. Access control is managed through user_workspaces.
