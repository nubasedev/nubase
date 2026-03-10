#!/bin/bash

# Script to create apps/starter using local @nubase/create build
# This creates the starter example app using @dev tagged @nubase/* packages for testing

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
STARTER_DIR="$ROOT_DIR/apps/starter"

echo "Building @nubase/create from local source..."
cd "$ROOT_DIR/packages/create" && npm run build

# Remove existing starter folder if it exists
if [ -d "$STARTER_DIR" ]; then
  echo "Removing existing apps/starter folder..."
  rm -rf "$STARTER_DIR"
fi

# Create the starter example using the local build
cd "$ROOT_DIR/apps"
echo "Creating nubase-app in apps/starter..."
node "$ROOT_DIR/packages/create/dist/index.js" starter --skip-install --tag dev

echo ""
echo "Successfully created apps/starter (using @nubase/*@dev packages)"
echo ""
echo "To complete setup:"
echo "  cd apps/starter"
echo "  npm install"
echo "  npm run db:up"
echo "  npm run db:seed"
echo "  npm run dev"
