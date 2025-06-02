# This script is used for Vercel deployments
# It sets up the correct configuration and runs the build

Write-Host "Starting Vercel build process..." -ForegroundColor Green

# Generate Prisma client without the engine for smaller bundle size
Write-Host "Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate --no-engine

# Use the Vercel-specific Next.js configuration
Write-Host "Using Vercel-specific Next.js configuration..." -ForegroundColor Cyan
$env:NODE_OPTIONS = "--max-old-space-size=3072"
$env:NEXT_WEBPACK_CONCURRENCY = "1"

# Build the project
Write-Host "Building the project..." -ForegroundColor Cyan
npx next build
