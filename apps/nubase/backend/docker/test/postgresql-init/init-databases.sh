#!/bin/bash
set -e

# This script is run by Docker's entrypoint during container initialization.
# POSTGRES_DB=nubase_db auto-creates the first database.
# This script:
#   1. Applies nubase-db-schema.sql to nubase_db
#   2. Creates the data_db database
#   3. Applies data-db-schema.sql to data_db
#
# SQL files are in a sql/ subdirectory so Docker doesn't auto-execute them.

SCRIPT_DIR="$(dirname "$0")"

echo "==> Applying nubase_db schema..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname nubase_db -f "$SCRIPT_DIR/sql/nubase-db-schema.sql"

echo "==> Creating data_db database..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -c "CREATE DATABASE data_db;"

echo "==> Applying data_db schema..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname data_db -f "$SCRIPT_DIR/sql/data-db-schema.sql"

echo "==> Database initialization complete."
