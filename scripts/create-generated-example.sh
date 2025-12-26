#!/bin/bash

# Script to create examples/generated from local @nubase/create package
# This creates the generated example app without running npm install

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
GENERATED_DIR="$ROOT_DIR/examples/generated"

echo "Creating generated example from local @nubase/create package..."

# Remove existing generated folder if it exists
if [ -d "$GENERATED_DIR" ]; then
  echo "Removing existing examples/generated folder..."
  rm -rf "$GENERATED_DIR"
fi

# Build the create package
echo "Building @nubase/create package..."
cd "$ROOT_DIR/packages/create"
npm run build

# Create the generated example
cd "$ROOT_DIR/examples"
echo "Creating nubase-app in examples/generated..."
node "$ROOT_DIR/packages/create/dist/index.js" generated --skip-install

echo ""
echo "Successfully created examples/generated"
echo ""
echo "To complete setup:"
echo "  cd examples/generated"
echo "  npm install"
echo "  npm run db:up"
echo "  npm run db:seed"
echo "  npm run dev"
