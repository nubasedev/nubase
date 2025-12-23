--
-- Questlog Database Schema
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
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'questlog_app') THEN
    CREATE ROLE questlog_app WITH LOGIN PASSWORD 'questlog_app';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE questlog TO questlog_app;
GRANT USAGE ON SCHEMA public TO questlog_app;


SET default_tablespace = '';
SET default_table_access_method = heap;


-- ============================================================================
-- TABLES
-- ============================================================================

--
-- Tenants
--

CREATE TABLE public.tenants (
    id integer NOT NULL,
    slug character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

ALTER TABLE public.tenants ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tenants_id_seq
    START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
);

ALTER TABLE ONLY public.tenants ADD CONSTRAINT tenants_pk PRIMARY KEY (id);
ALTER TABLE ONLY public.tenants ADD CONSTRAINT tenants_slug_unique UNIQUE (slug);


--
-- Users (root-level, no tenant association - users can belong to multiple tenants)
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    username character varying(100) NOT NULL,
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
ALTER TABLE ONLY public.users ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- User-Tenant Association (links users to tenants - a user can belong to multiple tenants)
--

CREATE TABLE public.user_tenants (
    user_id integer NOT NULL,
    tenant_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);

ALTER TABLE ONLY public.user_tenants ADD CONSTRAINT user_tenants_pk PRIMARY KEY (user_id, tenant_id);
ALTER TABLE ONLY public.user_tenants ADD CONSTRAINT user_tenants_user_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.user_tenants ADD CONSTRAINT user_tenants_tenant_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Tickets
--

CREATE TABLE public.tickets (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description character varying(1000)
);

ALTER TABLE public.tickets ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tickets_id_seq
    START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
);

ALTER TABLE ONLY public.tickets ADD CONSTRAINT tickets_pk PRIMARY KEY (id);
ALTER TABLE ONLY public.tickets ADD CONSTRAINT tickets_tenant_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


-- ============================================================================
-- PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO questlog_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO questlog_app;


-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Tickets: only visible/modifiable for the current tenant
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY tickets_tenant_isolation ON public.tickets
    TO questlog_app
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer);


-- User-Tenants: only visible/modifiable for the current tenant
-- This allows users to see which users belong to their tenant
ALTER TABLE public.user_tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_tenants_tenant_isolation ON public.user_tenants
    TO questlog_app
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::integer);


-- Note: tenants table does NOT have RLS - it must be queried to look up tenant
-- by slug before the tenant context is established.

-- Note: users table does NOT have RLS - users exist at root level and can
-- belong to multiple tenants. Access control is managed through user_tenants.
