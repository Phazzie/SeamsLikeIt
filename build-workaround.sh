#!/bin/bash

echo "Starting build workaround..."

# Create dist directory if it doesn't exist
mkdir -p dist

# Try to compile TypeScript files manually with minimal checking
echo "Compiling TypeScript files..."

# Use npx to run tsc with looser settings
npx -p typescript@5.8.3 tsc \
  --outDir dist \
  --module commonjs \
  --target es2020 \
  --esModuleInterop \
  --skipLibCheck \
  --allowJs \
  --noEmit false \
  --moduleResolution node \
  --resolveJsonModule \
  --allowSyntheticDefaultImports \
  --noImplicitAny false \
  src/**/*.ts || echo "TypeScript compilation had errors but continuing..."

# Copy necessary files
echo "Copying additional files..."
cp package.json dist/ 2>/dev/null || true
cp -r src/prompts dist/ 2>/dev/null || true

echo "Build workaround complete!"
echo "Note: This is a temporary solution. The project still needs proper dependency installation."