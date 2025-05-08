FROM node:20-alpine AS base

# Set environment variables for Prisma
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node
ENV PRISMA_SCHEMA_ENGINE_LIBRARY=/app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install necessary packages for Prisma and other dependencies
RUN apk add --no-cache libc6-compat openssl1.1-compat python3 make g++ curl

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Use --legacy-peer-deps to ignore peer dependency conflicts
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install necessary packages
RUN apk add --no-cache libc6-compat openssl1.1-compat python3 make g++

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PRISMA_BINARIES_MIRROR=/app/node_modules/.prisma/client

# Install necessary libraries for production
RUN apk add --no-cache libc6-compat openssl1.1-compat

# Create a non-root user and switch to it
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]