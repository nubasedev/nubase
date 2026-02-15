#!/bin/bash

# Script to create apps/starter using npx @nubase/create@dev (from npm registry)
# This creates the starter example app using @dev tagged @nubase/* packages for testing

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
STARTER_DIR="$ROOT_DIR/apps/starter"

echo "Creating starter example using npx @nubase/create@dev..."

# Remove existing starter folder if it exists
if [ -d "$STARTER_DIR" ]; then
  echo "Removing existing apps/starter folder..."
  rm -rf "$STARTER_DIR"
fi

# Clear npx cache to ensure we get the latest @nubase/create@dev
echo "Clearing npx cache..."
rm -rf ~/.npm/_npx

# Create the starter example using npx with @dev tag
cd "$ROOT_DIR/apps"
echo "Creating nubase-app in apps/starter..."
npx @nubase/create@dev starter --skip-install --tag dev

echo ""
echo "Successfully created apps/starter (using @nubase/*@dev packages)"
echo ""
echo "To complete setup:"
echo "  cd apps/starter"
echo "  npm install"
echo "  npm run db:up"
echo "  npm run db:seed"
echo "  npm run dev"
