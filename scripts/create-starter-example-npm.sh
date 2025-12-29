#!/bin/bash

# Script to create examples/starter using npx @nubase/create (from npm registry)
# This creates the starter example app without running npm install

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
STARTER_DIR="$ROOT_DIR/examples/starter"

echo "Creating starter example using npx @nubase/create..."

# Remove existing starter folder if it exists
if [ -d "$STARTER_DIR" ]; then
  echo "Removing existing examples/starter folder..."
  rm -rf "$STARTER_DIR"
fi

# Create the starter example using npx
cd "$ROOT_DIR/examples"
echo "Creating nubase-app in examples/starter..."
npx @nubase/create starter --skip-install

echo ""
echo "Successfully created examples/starter"
echo ""
echo "To complete setup:"
echo "  cd examples/starter"
echo "  npm install"
echo "  npm run db:up"
echo "  npm run db:seed"
echo "  npm run dev"
