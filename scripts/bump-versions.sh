#!/bin/bash

# Script to bump patch versions of all @nubase/* packages

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

PACKAGES=(
  "packages/core"
  "packages/pg"
  "packages/cli"
  "packages/frontend"
  "packages/backend"
)

echo "Bumping patch version for all @nubase/* packages..."
echo ""

for pkg in "${PACKAGES[@]}"; do
  PKG_PATH="$ROOT_DIR/$pkg"
  if [ -f "$PKG_PATH/package.json" ]; then
    cd "$PKG_PATH"
    OLD_VERSION=$(node -p "require('./package.json').version")
    npm version patch --no-git-tag-version > /dev/null
    NEW_VERSION=$(node -p "require('./package.json').version")
    PKG_NAME=$(node -p "require('./package.json').name")
    echo "  $PKG_NAME: $OLD_VERSION -> $NEW_VERSION"
  fi
done

echo ""
echo "Done! All packages bumped."
echo ""
echo "Next steps:"
echo "  git add -A && git commit -m 'Bump versions'"
echo "  npm run publish:dev   # or npm run publish"
