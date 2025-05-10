#!/bin/sh
set -e

echo "=========================================="
echo "Starting improved start.sh script..."
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Current directory: $(pwd)"
echo "=========================================="

# First run the WASM finder and fixer script
if [ -f "/app/find_wasm.sh" ]; then
  echo "Running Prisma compatibility fix script..."
  chmod +x /app/find_wasm.sh
  /app/find_wasm.sh
else
  echo "ERROR: find_wasm.sh script not found! This is critical for Prisma to work."
  exit 1
fi

# Set environment variables for Prisma with Alpine Linux
export LD_LIBRARY_PATH=/lib:/usr/lib
export PRISMA_QUERY_ENGINE_BINARY=/app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node
export PRISMA_SCHEMA_ENGINE_BINARY=/app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node
export PRISMA_ENGINES_MIRROR=https://binaries.prisma.sh
export PRISMA_BINARIES_MIRROR=https://binaries.prisma.sh
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
# Explicitly tell Prisma to use the musl binary
export PRISMA_CLI_BINARY_TARGETS=linux-musl

# Debug info for Prisma - check that all required files exist
echo "Verifying critical Prisma files exist:"
if [ -f "/app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node" ]; then
  echo "✅ libquery_engine-linux-musl.so.node exists"
else
  echo "❌ libquery_engine-linux-musl.so.node is MISSING"
  echo "Searching for any engine files:"
  find /app/node_modules -name "libquery_engine-*" | head -5 || echo "No engine files found!"
fi

if [ -f "/app/node_modules/.bin/prisma" ]; then
  echo "✅ prisma CLI exists"
else
  echo "❌ prisma CLI is MISSING"
fi

if [ -f "/app/node_modules/.bin/prisma_schema_build_bg.wasm" ]; then
  echo "✅ prisma_schema_build_bg.wasm exists"
else
  echo "❌ prisma_schema_build_bg.wasm is MISSING"
fi

# Run Prisma generate first to ensure client is built with musl binary
echo "=========================================="
echo "Running Prisma generate..."
echo "=========================================="
cd /app
NODE_ENV=production npx prisma generate --schema=./prisma/schema.prisma || {
  echo "ERROR: Prisma generate failed! Trying with debug logs..."
  DEBUG="*" NODE_ENV=production npx prisma generate --schema=./prisma/schema.prisma
  echo "Failed to generate Prisma client - this is a critical error!"
  exit 1
}

# Run Prisma migrations
echo "=========================================="
echo "Running Prisma migrations..."
echo "=========================================="
NODE_ENV=production npx prisma migrate deploy || {
  echo "ERROR: Prisma migrations failed! Trying with debug logs..."
  DEBUG="*" NODE_ENV=production npx prisma migrate deploy
  echo "Failed to run migrations - checking connection to database..."
  # Try to diagnose DB connection issues
  npx prisma db diagnose
  exit 1
}

# Run database seeder after migrations
echo "=========================================="
echo "Running database seeder..."
echo "=========================================="
# Install bcryptjs if not already installed
if [ ! -d "/app/node_modules/bcryptjs" ]; then
  echo "Installing bcryptjs..."
  npm install --no-save bcryptjs
else
  echo "bcryptjs is already installed."
fi

# Run the seeder directly with tsx
echo "Running seeder with tsx..."
npx tsx /app/lib/seeder.ts || echo "Failed to run seeder with tsx"

# Start the Next.js application
echo "=========================================="
echo "Starting Next.js application..."
echo "=========================================="
cd /app
node server.js
