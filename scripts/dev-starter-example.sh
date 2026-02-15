#!/bin/bash

# Script to run the starter example in development mode.
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

echo "========================================"
echo "Starting starter example (dev mode)"
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

# Step 0: Check Docker
echo "[0/4] Checking Docker..."
check_docker

cd "$STARTER_DIR"

# Step 1: Install dependencies
echo ""
echo "[1/4] Installing dependencies..."
npm install

# Step 2: Start the dev database
echo ""
echo "[2/4] Starting dev database..."
npm run db:up

# Step 3: Reset the dev database to ensure clean state with seed data
echo ""
echo "[3/4] Resetting dev database..."
npm run db:reset

# Step 4: Start dev servers
echo ""
echo "[4/4] Starting dev servers..."
echo ""
echo "========================================"
echo "Dev servers starting..."
echo "Frontend: http://localhost:3002"
echo "Backend:  http://localhost:3001"
echo "========================================"
echo ""
npm run dev
