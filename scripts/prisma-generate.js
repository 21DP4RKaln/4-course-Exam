#!/usr/bin/env node

/**
 * This script determines whether to run Prisma generate with or without the engine
 * based on the current environment.
 *
 * In production, it uses --no-engine to reduce bundle size.
 * In development, it includes the engine for better DX.
 */

const { execSync } = require('child_process');
const isProduction = process.env.NODE_ENV === 'production';

try {
  console.log(
    `Running Prisma generate in ${isProduction ? 'production' : 'development'} mode`
  );

  if (isProduction) {
    execSync('npx prisma generate --no-engine', { stdio: 'inherit' });
  } else {
    execSync('npx prisma generate', { stdio: 'inherit' });
  }

  console.log('Prisma generate completed successfully');
} catch (error) {
  console.error('Error running Prisma generate:', error);
  process.exit(1);
}
