#!/bin/bash

# Script to run npm install, typecheck, and E2E tests on examples/starter.
# Assumes examples/starter already exists (created via create:local or create:npm).

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
STARTER_DIR="$ROOT_DIR/examples/starter"

# Cleanup function to stop all nubase-managed docker containers
cleanup_docker() {
  echo "Stopping all nubase-managed containers..."

  # Stop containers with nubase label (macOS compatible - no xargs -r)
  RUNNING=$(docker ps -q --filter "label=com.nubase.managed=true" 2>/dev/null)
  if [ -n "$RUNNING" ]; then
    echo "$RUNNING" | xargs docker stop 2>/dev/null || true
  fi

  # Remove stopped containers
  STOPPED=$(docker ps -aq --filter "label=com.nubase.managed=true" 2>/dev/null)
  if [ -n "$STOPPED" ]; then
    echo "$STOPPED" | xargs docker rm 2>/dev/null || true
  fi
}

echo "========================================"
echo "Testing starter example"
echo "========================================"
echo ""

# Check that examples/starter exists
if [ ! -d "$STARTER_DIR" ]; then
  echo "Error: examples/starter does not exist."
  echo ""
  echo "Create it first with one of:"
  echo "  npm run examples:starter:create:local"
  echo "  npm run examples:starter:create:npm"
  exit 1
fi

# Step 0: Cleanup any existing docker containers from previous runs
echo "[0/5] Cleaning up previous docker containers..."
cleanup_docker

cd "$STARTER_DIR"

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
