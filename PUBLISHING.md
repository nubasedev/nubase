# Publishing Nubase Packages

This document outlines the steps to publish the `@nubase/core` and `@nubase/react` packages to npm.

## Prerequisites

1. **npm Account**: Ensure you have an npm account and are logged in
   ```bash
   npm login
   ```

2. **Organization Setup**: Create the `@nubase` organization on npm (if not already created)
   - Go to https://www.npmjs.com/org/create
   - Create organization named `nubase`

## Publishing Steps

### 1. Build Packages
From the root of the repository:
```bash
# Build all packages
npm run build

# Or build individually
cd packages/core && npm run build
cd packages/react && npm run build
```

### 2. Version Management
Update version numbers in package.json files:
- `packages/core/package.json`
- `packages/react/package.json`

Follow semantic versioning (semver):
- Patch: `0.1.1` (bug fixes)
- Minor: `0.2.0` (new features, backward compatible)
- Major: `1.0.0` (breaking changes)

### 3. Publish Packages

**Publish Core Package First** (since React depends on it):
```bash
cd packages/core
npm publish
```

**Then Publish React Package**:
```bash
cd packages/react
npm publish
```

### 4. Automated Publishing (Recommended)

Add these scripts to the root `package.json`:
```json
{
  "scripts": {
    "publish:core": "cd packages/core && npm run build && npm publish",
    "publish:react": "cd packages/react && npm run build && npm publish",
    "publish:all": "npm run publish:core && npm run publish:react"
  }
}
```

### 5. CI/CD Publishing (Optional)

For automated publishing on version tags, you can set up GitHub Actions:

1. Add npm token to GitHub secrets
2. Create `.github/workflows/publish.yml`
3. Trigger on version tags

## Package Details

### @nubase/core
- **Description**: Core schema and types for nubase
- **Main exports**: Schema definitions, types, validation utilities
- **Dependencies**: zod

### @nubase/react  
- **Description**: React components and utilities for nubase
- **Main exports**: Form components, form controls, table components, utilities
- **Dependencies**: React ecosystem packages, @nubase/core

## Post-Publishing

1. **Verify Installation**:
   ```bash
   npm install @nubase/core @nubase/react
   ```

2. **Update Documentation**: Update README files with installation and usage instructions

3. **Tag Release**: Create git tags for the published versions
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

## Troubleshooting

- **Authentication Issues**: Run `npm login` and verify with `npm whoami`
- **Permission Issues**: Ensure you're a member of the `@nubase` organization
- **Build Failures**: Check TypeScript errors and missing dependencies
- **Version Conflicts**: Ensure version numbers are incremented properly
