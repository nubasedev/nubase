#!/bin/bash

# Script to create examples/starter from local @nubase/create package
# This creates the starter example app without running npm install

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
STARTER_DIR="$ROOT_DIR/examples/starter"

echo "Creating starter example from local @nubase/create package..."

# Remove existing starter folder if it exists
if [ -d "$STARTER_DIR" ]; then
  echo "Removing existing examples/starter folder..."
  rm -rf "$STARTER_DIR"
fi

# Build the create package
echo "Building @nubase/create package..."
cd "$ROOT_DIR/packages/create"
npm run build

# Create the starter example
cd "$ROOT_DIR/examples"
echo "Creating nubase-app in examples/starter..."
node "$ROOT_DIR/packages/create/dist/index.js" starter --skip-install

echo ""
echo "Successfully created examples/starter"
echo ""
echo "To complete setup:"
echo "  cd examples/starter"
echo "  npm install"
echo "  npm run db:up"
echo "  npm run db:seed"
echo "  npm run dev"
