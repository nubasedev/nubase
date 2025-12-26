#!/bin/bash

# Script to create examples/external from local @nubase/create package
# This creates the external example app without running npm install

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
EXTERNAL_DIR="$ROOT_DIR/examples/external"

echo "Creating external example from local @nubase/create package..."

# Remove existing external folder if it exists
if [ -d "$EXTERNAL_DIR" ]; then
  echo "Removing existing examples/external folder..."
  rm -rf "$EXTERNAL_DIR"
fi

# Build the create package
echo "Building @nubase/create package..."
cd "$ROOT_DIR/packages/create"
npm run build

# Create the external example
cd "$ROOT_DIR/examples"
echo "Creating nubase-app in examples/external..."
node "$ROOT_DIR/packages/create/dist/index.js" external --skip-install

echo ""
echo "Successfully created examples/external"
echo ""
echo "To complete setup:"
echo "  cd examples/external"
echo "  npm install"
echo "  npm run db:up"
echo "  npm run db:seed"
echo "  npm run dev"
