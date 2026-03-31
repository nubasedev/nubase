-- __PROJECT_NAME_PASCAL__ Database Schema
-- This file is the source of truth for database structure

-- Create app user with restricted permissions (for RLS)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '__DB_NAME___app') THEN
        CREATE ROLE __DB_NAME___app WITH LOGIN PASSWORD '__DB_PASSWORD__';
    END IF;
END
$$;

-- Enable RLS on the database
ALTER DATABASE __DB_NAME__ SET row_security = on;

-- ============================================================
-- WORKSPACES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS workspaces (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant permissions to app user
GRANT SELECT, INSERT, UPDATE, DELETE ON workspaces TO __DB_NAME___app;
GRANT USAGE, SELECT ON SEQUENCE workspaces_id_seq TO __DB_NAME___app;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant permissions to app user
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO __DB_NAME___app;
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO __DB_NAME___app;

-- ============================================================
-- USER_WORKSPACES TABLE (Association with RLS)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_workspaces (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, workspace_id)
);

-- Enable RLS on user_workspaces
ALTER TABLE user_workspaces ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own workspace associations
CREATE POLICY user_workspaces_isolation ON user_workspaces
    USING (workspace_id = COALESCE(current_setting('app.current_workspace_id', true)::INTEGER, workspace_id));

-- Grant permissions to app user
GRANT SELECT, INSERT, UPDATE, DELETE ON user_workspaces TO __DB_NAME___app;

-- ============================================================
-- TICKETS TABLE (with RLS)
-- ============================================================
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see tickets in their current workspace
CREATE POLICY tickets_workspace_isolation ON tickets
    USING (workspace_id = current_setting('app.current_workspace_id', true)::INTEGER);

-- Grant permissions to app user
GRANT SELECT, INSERT, UPDATE, DELETE ON tickets TO __DB_NAME___app;
GRANT USAGE, SELECT ON SEQUENCE tickets_id_seq TO __DB_NAME___app;

-- ============================================================
-- DEFAULT DATA
-- ============================================================
-- Create default workspace
INSERT INTO workspaces (slug, name) VALUES ('default', 'Default Workspace')
ON CONFLICT (slug) DO NOTHING;
