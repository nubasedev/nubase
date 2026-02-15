#!/bin/bash

# Script to run npm install, typecheck, and E2E tests on apps/starter.
# Assumes apps/starter already exists (created via create:local or create:npm).

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
STARTER_DIR="$ROOT_DIR/apps/starter"

# Cross-platform timeout function (macOS doesn't have GNU timeout)
run_with_timeout() {
  local timeout_seconds=$1
  shift

  # Try GNU timeout first (Linux, or macOS with coreutils installed)
  if command -v timeout >/dev/null 2>&1; then
    timeout "$timeout_seconds" "$@"
    return $?
  fi

  # Fallback: use perl (available on macOS by default)
  perl -e '
    use strict;
    use warnings;

    my $timeout = shift @ARGV;
    my $pid = fork();

    if ($pid == 0) {
      exec(@ARGV) or exit(127);
    }

    eval {
      local $SIG{ALRM} = sub { die "timeout\n" };
      alarm($timeout);
      waitpid($pid, 0);
      alarm(0);
    };

    if ($@ eq "timeout\n") {
      kill(9, $pid);
      waitpid($pid, 0);
      exit(124);
    }

    exit($? >> 8);
  ' "$timeout_seconds" "$@"
}

# Check if Docker is running
check_docker() {
  echo "Checking Docker availability..."

  # Use timeout to prevent hanging if Docker is unresponsive
  if ! run_with_timeout 5 docker info >/dev/null 2>&1; then
    echo ""
    echo "Error: Docker is not running or not responding."
    echo ""
    echo "Please ensure Docker is running and try again."
    exit 1
  fi

  echo "Docker is running."
}

# Cleanup function to stop all nubase-managed docker containers
cleanup_docker() {
  echo "Stopping all nubase-managed containers..."

  # Stop containers with nubase label (macOS compatible - no xargs -r)
  # Use timeout to prevent hanging
  RUNNING=$(run_with_timeout 10 docker ps -q --filter "label=com.nubase.managed=true" 2>/dev/null || echo "")
  if [ -n "$RUNNING" ]; then
    echo "Found running containers: $RUNNING"
    echo "$RUNNING" | xargs docker stop 2>/dev/null || true
    echo "Stopped containers."
  else
    echo "No running nubase-managed containers found."
  fi

  # Remove stopped containers
  STOPPED=$(run_with_timeout 10 docker ps -aq --filter "label=com.nubase.managed=true" 2>/dev/null || echo "")
  if [ -n "$STOPPED" ]; then
    echo "Removing stopped containers: $STOPPED"
    echo "$STOPPED" | xargs docker rm 2>/dev/null || true
    echo "Removed containers."
  else
    echo "No stopped nubase-managed containers to remove."
  fi
}

echo "========================================"
echo "Testing starter example"
echo "========================================"
echo ""

# Check that apps/starter exists
if [ ! -d "$STARTER_DIR" ]; then
  echo "Error: apps/starter does not exist."
  echo ""
  echo "Create it first with one of:"
  echo "  npm run examples:starter:create:local"
  echo "  npm run examples:starter:create:npm"
  exit 1
fi

# Step 0: Check Docker and cleanup any existing containers
echo "[0/5] Checking Docker and cleaning up previous containers..."
check_docker
cleanup_docker
echo "Cleanup complete."

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
