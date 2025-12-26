#!/bin/bash

# Script to run npm install, typecheck, and E2E tests on examples/generated.
# Assumes examples/generated already exists (created via create:local or create:npm).

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
GENERATED_DIR="$ROOT_DIR/examples/generated"

# Cleanup function to stop docker containers
cleanup_docker() {
  echo "Stopping any existing test docker containers..."
  if [ -d "$GENERATED_DIR/backend/docker/test" ]; then
    cd "$GENERATED_DIR/backend"
    docker compose -f docker/test/docker-compose.yml down -v 2>/dev/null || true
  fi
}

echo "========================================"
echo "Testing generated example"
echo "========================================"
echo ""

# Check that examples/generated exists
if [ ! -d "$GENERATED_DIR" ]; then
  echo "Error: examples/generated does not exist."
  echo ""
  echo "Create it first with one of:"
  echo "  npm run examples:generated:create:local"
  echo "  npm run examples:generated:create:npm"
  exit 1
fi

# Step 0: Cleanup any existing docker containers from previous runs
echo "[0/5] Cleaning up previous docker containers..."
cleanup_docker

cd "$GENERATED_DIR"

# Step 1: Install dependencies
echo ""
echo "[1/5] Installing dependencies..."
npm install

# Step 2: Run typecheck
echo ""
echo "[2/5] Running typecheck..."
npm run typecheck

# Step 3: Start the test database
echo ""
echo "[3/5] Starting test database..."
npm run db:test:up

# Step 4: Reset the test database to ensure clean state
echo ""
echo "[4/5] Resetting test database..."
npm run db:test:reset

# Step 5: Install Playwright and run E2E tests
echo ""
echo "[5/5] Installing Playwright and running E2E tests..."
npm run e2e:install
npm run e2e

echo ""
echo "========================================"
echo "All tests passed!"
echo "========================================"
