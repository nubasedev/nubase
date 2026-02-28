#!/usr/bin/env bash
set -euo pipefail

echo "=== @nubase/create E2E Test ==="
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

echo "→ Building packages..."
cd "$REPO_ROOT"
npm run build --workspace=@nubase/sdk
npm run build --workspace=@nubase/cli
npm run build --workspace=@nubase/create

echo ""
echo "→ Packing @nubase/sdk..."
SDK_TARBALL=$(cd packages/sdk && npm pack --pack-destination "$TEMP_DIR" 2>/dev/null | tail -1)

echo "→ Packing @nubase/cli..."
CLI_TARBALL=$(cd packages/cli && npm pack --pack-destination "$TEMP_DIR" 2>/dev/null | tail -1)

echo ""
echo "→ Scaffolding test app..."
cd "$TEMP_DIR"
node "$REPO_ROOT/packages/create/dist/index.js" test-app \
  --url http://localhost:3001 \
  --workspace test \
  --token dummy-token \
  --skip-install

echo ""
echo "→ Patching package.json to use tarballs..."
cd "$TEMP_DIR/test-app"

# Use node to patch package.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
pkg.dependencies['@nubase/sdk'] = 'file:$TEMP_DIR/$SDK_TARBALL';
pkg.devDependencies['@nubase/cli'] = 'file:$TEMP_DIR/$CLI_TARBALL';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"

echo ""
echo "→ Installing dependencies..."
npm install

echo ""
echo "→ Running typecheck..."
npx tsc --noEmit

echo ""
echo "✓ @nubase/create E2E test passed!"
