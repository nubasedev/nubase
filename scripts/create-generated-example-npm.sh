#!/bin/bash

# Script to create examples/generated using npx @nubase/create (from npm registry)
# This creates the generated example app without running npm install

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
GENERATED_DIR="$ROOT_DIR/examples/generated"

echo "Creating generated example using npx @nubase/create..."

# Remove existing generated folder if it exists
if [ -d "$GENERATED_DIR" ]; then
  echo "Removing existing examples/generated folder..."
  rm -rf "$GENERATED_DIR"
fi

# Create the generated example using npx
cd "$ROOT_DIR/examples"
echo "Creating nubase-app in examples/generated..."
npx @nubase/create generated --skip-install

echo ""
echo "Successfully created examples/generated"
echo ""
echo "To complete setup:"
echo "  cd examples/generated"
echo "  npm install"
echo "  npm run db:up"
echo "  npm run db:seed"
echo "  npm run dev"
