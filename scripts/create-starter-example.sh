#!/bin/bash

# Script to create apps/starter using local @nubase/create build.
# apps/starter is a workspace member, so @nubase/* deps resolve to local sources.

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
node "$ROOT_DIR/packages/create/dist/index.js" starter --skip-install

# Reinstall at root so apps/starter is wired up as a workspace.
echo ""
echo "Linking apps/starter into the workspace..."
cd "$ROOT_DIR"
npm install

# Format-fix the scaffolded starter so its output matches the local Biome
# version (project-name-driven layout differences would otherwise fail lint).
echo ""
echo "Formatting apps/starter with Biome..."
npx biome check --write apps/starter

echo ""
echo "Successfully created apps/starter (linked to local @nubase/* sources)"
echo ""
echo "To run it:"
echo "  cd apps/starter"
echo "  npm run db:up"
echo "  npm run db:seed"
echo "  npm run dev"
