#!/bin/sh
set -e

echo "================== ENTRYPOINT STARTED =================="
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Current directory: $(pwd)"

# Check for essential Prisma directories and files
echo "Checking for Prisma dependencies..."
if [ ! -d "/app/node_modules/@prisma/internals" ]; then
    echo "WARN: @prisma/internals directory not found. Creating directories..."
    mkdir -p /app/node_modules/@prisma/internals
else
    echo "✅ @prisma/internals directory found."
fi

# Check for the Prisma binary and create directory if needed
if [ ! -d "/app/node_modules/.prisma/client" ]; then
    echo "WARN: .prisma/client directory not found. Creating..."
    mkdir -p /app/node_modules/.prisma/client
else
    echo "✅ .prisma/client directory found."
fi

# Check for musl binary
if [ ! -f "/app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node" ]; then
    echo "WARN: libquery_engine-linux-musl.so.node not found. Will search for it."
    # We'll let find_wasm.sh handle this
else
    echo "✅ libquery_engine-linux-musl.so.node found."
fi

# Set critical environment variables for Prisma with Alpine
export LD_LIBRARY_PATH=/lib:/usr/lib
export PRISMA_QUERY_ENGINE_BINARY=/app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node
export PRISMA_SCHEMA_ENGINE_BINARY=/app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node
export PRISMA_ENGINES_MIRROR=https://binaries.prisma.sh
export PRISMA_BINARIES_MIRROR=https://binaries.prisma.sh
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
export PRISMA_CLI_BINARY_TARGETS=linux-musl

# First run the enhanced find_wasm.sh script to set up the correct environment
if [ -f "/app/find_wasm.sh" ]; then
    echo "Running Prisma compatibility fix script (find_wasm.sh)..."
    /app/find_wasm.sh
else
    echo "ERROR: find_wasm.sh script not found. This is critical for Prisma to work!"
    exit 1
fi

# Run the enhanced start script which includes migrations, seeding and app startup
echo "Starting the application with enhanced script..."
exec /app/start.sh
