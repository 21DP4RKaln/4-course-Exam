FROM node:20-slim AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install OpenSSL and other dependencies required by Prisma
RUN apt-get update -y && apt-get install -y openssl ca-certificates

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Use --legacy-peer-deps to ignore peer dependency conflicts
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install dependencies required for building
RUN apt-get update -y && apt-get install -y openssl ca-certificates

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

# Install production dependencies
RUN apt-get update -y && apt-get install -y openssl ca-certificates

# Create a non-root user and switch to it
RUN groupadd -g 1001 nodejs && \
    useradd -m -u 1001 -g nodejs nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Create startup script with error handling
RUN echo '#!/bin/bash\necho "Starting application..."\necho "Node version: $(node -v)"\necho "Checking for required environment variables..."\nif [ -z "$DATABASE_URL" ]; then\n  echo "ERROR: DATABASE_URL is not set!"\n  exit 1\nfi\nif [ -z "$JWT_SECRET" ]; then\n  echo "ERROR: JWT_SECRET is not set!"\n  exit 1\nfi\necho "Starting Next.js application..."\nnode server.js' > start.sh && \
    chmod +x start.sh

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Use the startup script instead of directly starting node
CMD ["/app/start.sh"]