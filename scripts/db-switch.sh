#!/bin/bash

# Script to switch between different nubase database environments.
# Stops all nubase-managed containers before starting the requested project's databases.

set -e

PROJECT=$1
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

if [ -z "$PROJECT" ]; then
  echo "Usage: $0 <nubase|starter|stop>"
  echo ""
  echo "Commands:"
  echo "  nubase    Start nubase databases (stops others first)"
  echo "  starter   Start starter databases (stops others first)"
  echo "  stop      Stop all nubase-managed databases"
  echo ""
  echo "Examples:"
  echo "  $0 nubase     # Switch to nubase development"
  echo "  $0 starter    # Switch to starter example testing"
  echo "  $0 stop       # Stop all databases"
  exit 1
fi

# Check if Docker daemon is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Cannot connect to Docker daemon."
  echo ""
  echo "Please ensure Docker is running and try again."
  exit 1
fi

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

if [ "$PROJECT" = "stop" ]; then
  echo "All nubase containers stopped."
  exit 0
fi

if [ "$PROJECT" = "nubase" ]; then
  echo "Starting nubase databases..."
  cd "$ROOT_DIR/apps/nubase/backend"
  npm run db:dev:up
  npm run db:test:up
elif [ "$PROJECT" = "starter" ]; then
  if [ ! -d "$ROOT_DIR/apps/starter" ]; then
    echo "Error: apps/starter does not exist."
    echo ""
    echo "Create it first with one of:"
    echo "  npm run examples:starter:create"
    exit 1
  fi
  echo "Starting starter databases..."
  cd "$ROOT_DIR/apps/starter/backend"
  npm run db:dev:up
  npm run db:test:up
else
  echo "Unknown project: $PROJECT"
  echo "Valid projects: nubase, starter, stop"
  exit 1
fi

echo ""
echo "Waiting for databases to be ready..."
sleep 3
echo "Done! $PROJECT databases are running."
echo ""
echo "Active nubase containers:"
docker ps --filter "label=com.nubase.managed=true" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
