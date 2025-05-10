# Install dependencies only when needed
FROM node:18-alpine AS deps
# Install required dependencies for Prisma to work correctly in Alpine
RUN apk add --no-cache libc6-compat openssl-dev python3 make g++ gcc
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  echo "DEBUG: Dockerfile RUN command for deps stage - $(date)" && \
  echo "DEBUG: Found package-lock.json, attempting to install dependencies using npm ci" && \
  (npm ci || (echo "ERROR: npm ci failed in deps stage" && exit 1)) && \
  echo "DEBUG: npm ci completed." && \
  echo "DEBUG: Listing /app contents after npm ci:" && \
  ls -la /app && \
  if [ ! -d "/app/node_modules" ]; then \
    echo "CRITICAL ERROR: /app/node_modules directory DOES NOT EXIST in deps stage after npm ci." && \
    exit 1; \
  fi && \
  echo "DEBUG: /app/node_modules directory confirmed to exist in deps stage." && \
  echo "DEBUG: Listing top-level contents of /app/node_modules (deps stage):" && \
  ls -A /app/node_modules | head -n 20 && \
  echo "DEBUG: Checking for @prisma/internals in /app/node_modules/@prisma (deps stage):" && \
  ls -ld /app/node_modules/@prisma/internals || (echo "DEBUG: @prisma/internals not found directly, listing /app/node_modules/@prisma content..." && ls -la /app/node_modules/@prisma)


# Rebuild the source code only when needed
FROM node:18-alpine AS builder
WORKDIR /app

# Install required dependencies for Prisma to work correctly in Alpine
RUN apk add --no-cache libc6-compat openssl-dev python3 make g++ gcc

# Create a temporary directory to receive files from deps stage
RUN echo "DEBUG: Builder stage - creating /tmp/deps_app - $(date)" && \
    mkdir -p /tmp/deps_app

# Copy the entire /app directory from deps stage to the temporary location
COPY --from=deps /app/ /tmp/deps_app/

# Verify the copy to the temporary location
RUN echo "DEBUG: Builder stage - Verifying contents of /tmp/deps_app/" && \
    ls -la /tmp/deps_app/ && \
    if [ ! -d "/tmp/deps_app/node_modules" ]; then \
      echo "CRITICAL ERROR: /tmp/deps_app/node_modules DOES NOT EXIST in builder stage after copying from deps." && \
      ls -la /tmp/deps_app/ && \
      exit 1; \
    fi && \
    echo "DEBUG: /tmp/deps_app/node_modules confirmed to exist." && \
    echo "DEBUG: Listing top-level contents of /tmp/deps_app/node_modules (builder stage):" && \
    ls -A /tmp/deps_app/node_modules | head -n 10

# Now, move node_modules from the temporary location to the final destination /app/node_modules
RUN echo "DEBUG: Builder stage - Clearing existing /app/node_modules (if any) before move" && \
    rm -rf /app/node_modules
RUN echo "DEBUG: Builder stage - Moving /tmp/deps_app/node_modules to become /app/node_modules" && \
    mv /tmp/deps_app/node_modules /app/node_modules

# Copy the application code from the build context (local filesystem)
# This comes after restoring node_modules from the deps stage
COPY . .

# Clean up temporary directory (optional, but good practice)
RUN rm -rf /tmp/deps_app

# Set environment variables to help Prisma find the correct binaries for Alpine Linux (musl)
ENV PRISMA_QUERY_ENGINE_BINARY=/app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node
ENV PRISMA_SCHEMA_ENGINE_BINARY=/app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node
ENV PRISMA_ENGINES_MIRROR=https://binaries.prisma.sh
ENV PRISMA_BINARIES_MIRROR=https://binaries.prisma.sh
# Force Prisma to use musl binaries for Alpine
ENV PRISMA_CLI_BINARY_TARGETS=linux-musl
# Ignore missing checksum files for Prisma binaries
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Install/reinstall all Prisma packages to ensure correct binaries for Alpine
RUN npm install --no-save prisma @prisma/client @prisma/internals && \
    npm install --no-save @prisma/engines-version @prisma/engines

# Explicitly create the Prisma binary directories
RUN mkdir -p /app/node_modules/.prisma/client && \
    mkdir -p /app/node_modules/.prisma/client/wasm

# Find all WASM files and copy them to ensure availability
RUN find /app/node_modules -name "*.wasm" -type f -exec cp {} /app/node_modules/.prisma/client/wasm/ \; && \
    find /app/node_modules -name "*.wasm" -type f -exec cp {} /app/node_modules/.bin/ \;

# Force Prisma generation to use the musl binaries for Alpine Linux
RUN echo "Running Prisma generate with explicit environment setup..." && \
    PRISMA_CLI_BINARY_TARGETS=linux-musl npx prisma generate --schema=./prisma/schema.prisma

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Add final verification in builder stage
RUN echo "DEBUG: Final check in builder stage before runner copies - $(date)" && \
    echo "DEBUG: Checking for /app/node_modules/@prisma/internals in builder stage:" && \
    if [ -d "/app/node_modules/@prisma/internals" ]; then \
      echo "DEBUG: SUCCESS - /app/node_modules/@prisma/internals EXISTS in builder." && \
      ls -la "/app/node_modules/@prisma/internals"; \
    else \
      echo "CRITICAL ERROR: /app/node_modules/@prisma/internals DOES NOT EXIST in builder at the very end." && \
      echo "DEBUG: Listing /app/node_modules/@prisma/ content in builder (if @prisma exists):" && \
      (ls -la "/app/node_modules/@prisma/" || echo "DEBUG: /app/node_modules/@prisma/ does not exist or ls failed.") && \
      echo "DEBUG: Listing /app/node_modules/ content in builder (first 20 entries if node_modules exists):" && \
      (ls -A "/app/node_modules/" | head -n 20 || echo "DEBUG: /app/node_modules/ does not exist or ls failed.") && \
      exit 1; \
    fi

# Verify the critical Prisma engine binary exists
RUN if [ ! -f "/app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node" ]; then \
      echo "CRITICAL ERROR: libquery_engine-linux-musl.so.node NOT FOUND!" && \
      echo "Searching for any engine binaries:" && \
      find /app/node_modules -name "libquery_engine-*" && \
      exit 1; \
    else \
      echo "SUCCESS: Found libquery_engine-linux-musl.so.node" && \
      ls -la /app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node; \
    fi

# Production image, copy all the files and run next
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NODE_OPTIONS='--max-old-space-size=4096'
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

# Install OpenSSL compatibility libraries needed for Prisma
RUN apk update && \
    apk add --no-cache \
    libc6-compat \
    openssl-dev \
    ca-certificates

# More explicit OpenSSL compatibility setup for Alpine
RUN mkdir -p /lib64 /lib /usr/lib && \
    ln -sf /lib/libc.musl-x86_64.so.1 /lib64/ld-linux-x86-64.so.2 && \
    ln -sf /usr/lib/libssl.so.3 /usr/lib/libssl.so.1.1 && \
    ln -sf /usr/lib/libcrypto.so.3 /usr/lib/libcrypto.so.1.1 && \
    ln -sf /usr/lib/libssl.so.3 /lib/libssl.so.1.1 && \
    ln -sf /usr/lib/libcrypto.so.3 /lib/libcrypto.so.1.1 && \
    ln -sf /usr/lib/libssl.so.3 /usr/lib/libssl.so && \
    ln -sf /usr/lib/libcrypto.so.3 /usr/lib/libcrypto.so

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Copy Prisma schema
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copy package.json for npx to resolve local binaries and for Prisma CLI context
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Set the correct permission for prerender cache
RUN mkdir -p .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create all necessary Prisma directories
RUN mkdir -p ./node_modules/.bin
RUN mkdir -p ./node_modules/prisma
RUN mkdir -p ./node_modules/@prisma
RUN mkdir -p ./node_modules/.prisma/client/wasm

# Copy Prisma CLI and its dependencies from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Explicitly copy ALL WASM files from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin/*.wasm ./node_modules/.bin/
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma/client/wasm/*.wasm ./node_modules/.prisma/client/wasm/

# Set Prisma environment variables for Alpine Linux
ENV PRISMA_QUERY_ENGINE_BINARY=/app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node
ENV PRISMA_SCHEMA_ENGINE_BINARY=/app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node
ENV PRISMA_ENGINES_MIRROR=https://binaries.prisma.sh
ENV PRISMA_BINARIES_MIRROR=https://binaries.prisma.sh
ENV PRISMA_CLI_BINARY_TARGETS=linux-musl
ENV LD_LIBRARY_PATH=/lib:/usr/lib
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Copy specific dependencies required for the seeder
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin/tsx ./node_modules/.bin/tsx
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/tsx ./node_modules/tsx
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/esbuild ./node_modules/esbuild
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/esbuild-register ./node_modules/esbuild-register
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bcryptjs ./node_modules/bcryptjs

# Copy the lib directory for seeder
COPY --from=builder --chown=nextjs:nodejs /app/lib ./lib

# Copy the entrypoint script and the improved start script
COPY --from=builder /app/entrypoint.sh /app/entrypoint.sh
COPY improved_start.sh /app/start.sh
COPY find_wasm.sh /app/find_wasm.sh
RUN chmod +x /app/entrypoint.sh /app/start.sh /app/find_wasm.sh

USER nextjs

EXPOSE 3000

ENV PORT 3000

# Use the custom entrypoint script
CMD ["/app/entrypoint.sh"]
