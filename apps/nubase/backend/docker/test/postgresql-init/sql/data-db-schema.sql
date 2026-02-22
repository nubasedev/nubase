--
-- Nubase Data Database Schema (data_db)
-- This is the source of truth for the customer data database structure.
-- Contains: tickets (application data)
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
-- Application user (no RLS on data_db - the entire database belongs to the customer)
--

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'data_db') THEN
    CREATE ROLE data_db WITH LOGIN PASSWORD 'data_db';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE data_db TO data_db;
GRANT USAGE ON SCHEMA public TO data_db;


SET default_tablespace = '';
SET default_table_access_method = heap;


-- ============================================================================
-- TABLES
-- ============================================================================

--
-- Tickets (application data - no FKs to nubase_db, no RLS)
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


-- ============================================================================
-- PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO data_db;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO data_db;
