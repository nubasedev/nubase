#!/bin/bash
set -e

TAG="${1:-latest}"

echo "Publishing @nubase/* packages with tag: $TAG"
echo ""

# Build all packages first
echo "Building all packages..."
npm run build
echo ""

# Publish order matters: dependencies first
PACKAGES=(
  "packages/core"
  "packages/pg"
  "packages/backend"
  "packages/frontend"
  "packages/cli"
  "packages/create"
)

for pkg in "${PACKAGES[@]}"; do
  NAME=$(node -p "require('./$pkg/package.json').name")
  VERSION=$(node -p "require('./$pkg/package.json').version")

  # Check if this version is already published
  PUBLISHED=$(npm view "$NAME@$VERSION" version 2>/dev/null || echo "")
  if [ "$PUBLISHED" = "$VERSION" ]; then
    echo "⏭  $NAME@$VERSION already published, skipping"
    continue
  fi

  echo "📦 Publishing $NAME@$VERSION (tag: $TAG)..."
  (cd "$pkg" && npm publish --access public --tag "$TAG")
  echo "✅ $NAME@$VERSION published"
  echo ""
done

echo "🎉 All packages published!"
