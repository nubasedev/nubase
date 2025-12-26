#!/bin/bash

# Script to create examples/external using npx @nubase/create (from npm)
# This creates the external example app without running npm install

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
EXTERNAL_DIR="$ROOT_DIR/examples/external"

echo "Creating external example using npx @nubase/create..."

# Remove existing external folder if it exists
if [ -d "$EXTERNAL_DIR" ]; then
  echo "Removing existing examples/external folder..."
  rm -rf "$EXTERNAL_DIR"
fi

# Create the external example using npx
cd "$ROOT_DIR/examples"
echo "Creating nubase-app in examples/external..."
npx @nubase/create external --skip-install

echo ""
echo "Successfully created examples/external"
echo ""
echo "To complete setup:"
echo "  cd examples/external"
echo "  npm install"
echo "  npm run db:up"
echo "  npm run db:seed"
echo "  npm run dev"
