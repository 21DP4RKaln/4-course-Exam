#!/bin/sh
set -e

# Enhanced script to fix Prisma compatibility with Alpine Linux
echo "===================================="
echo "Fixing Prisma compatibility for Alpine Linux..."
echo "===================================="

# Create critical directories
mkdir -p /app/node_modules/.bin
mkdir -p /app/node_modules/.prisma/client/wasm
mkdir -p /lib64 /lib /usr/lib

# Fix for OpenSSL compatibility in Alpine
echo "Setting up OpenSSL symbolic links for Alpine compatibility..."
ln -sf /lib/libc.musl-x86_64.so.1 /lib64/ld-linux-x86-64.so.2 || echo "Warning: ld-linux-x86-64.so.2 symlink failed"

# Create symbolic links for OpenSSL 1.1 compatibility (required by Prisma)
if [ -f "/usr/lib/libssl.so.3" ]; then
  ln -sf /usr/lib/libssl.so.3 /usr/lib/libssl.so.1.1 || echo "Warning: libssl.so.1.1 symlink failed"
  ln -sf /usr/lib/libcrypto.so.3 /usr/lib/libcrypto.so.1.1 || echo "Warning: libcrypto.so.1.1 symlink failed"
  ln -sf /usr/lib/libssl.so.3 /lib/libssl.so.1.1 || echo "Warning: lib/libssl.so.1.1 symlink failed"
  ln -sf /usr/lib/libcrypto.so.3 /lib/libcrypto.so.1.1 || echo "Warning: lib/libcrypto.so.1.1 symlink failed"
  ln -sf /usr/lib/libssl.so.3 /usr/lib/libssl.so || echo "Warning: libssl.so symlink failed"
  ln -sf /usr/lib/libcrypto.so.3 /usr/lib/libcrypto.so || echo "Warning: libcrypto.so symlink failed"
elif [ -f "/usr/lib/libssl.so.1.1" ]; then
  # If OpenSSL 1.1 is already available
  ln -sf /usr/lib/libssl.so.1.1 /usr/lib/libssl.so || echo "Warning: libssl.so symlink failed"
  ln -sf /usr/lib/libcrypto.so.1.1 /usr/lib/libcrypto.so || echo "Warning: libcrypto.so symlink failed"
else
  echo "Warning: Could not find libssl.so.3 or libssl.so.1.1. Symlinks not created."
fi

# Search for all WASM files
echo "Looking for WASM files in all node_modules directories..."
WASM_FILES=$(find /app/node_modules -name "*.wasm" -type f)

if [ -z "$WASM_FILES" ]; then
  echo "No WASM files found. This is unexpected."
else
  echo "Found WASM files:"
  echo "$WASM_FILES"
  
  # Copy all found WASM files to the needed locations
  for WASM_FILE in $WASM_FILES; do
    FILENAME=$(basename "$WASM_FILE")
    echo "Copying $WASM_FILE to /app/node_modules/.bin/$FILENAME"
    cp "$WASM_FILE" "/app/node_modules/.bin/$FILENAME"
    
    echo "Copying $WASM_FILE to /app/node_modules/.prisma/client/wasm/$FILENAME"
    cp "$WASM_FILE" "/app/node_modules/.prisma/client/wasm/$FILENAME"
  done
  
  # Set the correct permissions
  chmod 755 /app/node_modules/.bin/*.wasm || echo "Warning: No WASM files to change permissions for in .bin"
  chmod 755 /app/node_modules/.prisma/client/wasm/*.wasm || echo "Warning: No WASM files to change permissions for in .prisma/client/wasm"
fi

# Look for libquery engine files specifically for musl
echo "Looking for Prisma engines (focusing on musl)..."
ENGINE_FILES=$(find /app/node_modules -name "libquery_engine-linux-musl*.so*" -type f)

if [ -z "$ENGINE_FILES" ]; then
  echo "Warning: No musl engine binaries found. This might indicate a bigger issue."
else
  echo "Found musl engine files:"
  echo "$ENGINE_FILES"
  
  # Copy all found engine files to .prisma/client
  mkdir -p /app/node_modules/.prisma/client
  for ENGINE_FILE in $ENGINE_FILES; do
    FILENAME=$(basename "$ENGINE_FILE")
    echo "Copying $ENGINE_FILE to /app/node_modules/.prisma/client/$FILENAME"
    cp "$ENGINE_FILE" "/app/node_modules/.prisma/client/$FILENAME"
    chmod 755 "/app/node_modules/.prisma/client/$FILENAME"
  done
fi

# Set environment variables to help Prisma find binaries
export PRISMA_QUERY_ENGINE_BINARY=/app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node
export PRISMA_SCHEMA_ENGINE_BINARY=/app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node
export PRISMA_ENGINES_MIRROR=https://binaries.prisma.sh
export PRISMA_BINARIES_MIRROR=https://binaries.prisma.sh
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
export LD_LIBRARY_PATH=/lib:/usr/lib

# Verify WASM files in target directories
echo "Verifying files in target directories:"
echo "In /app/node_modules/.bin:"
ls -la /app/node_modules/.bin/*.wasm || echo "No WASM files found in .bin"

echo "In /app/node_modules/.prisma/client:"
ls -la /app/node_modules/.prisma/client/*.so* || echo "No engine files found in .prisma/client"

echo "In /app/node_modules/.prisma/client/wasm:"
ls -la /app/node_modules/.prisma/client/wasm/*.wasm || echo "No WASM files found in .prisma/client/wasm"

echo "===================================="
echo "Prisma compatibility setup completed."
echo "===================================="
