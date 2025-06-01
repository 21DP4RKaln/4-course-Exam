#!/usr/bin/env tsx

/**
 * One-time script to initialize rating fields for all existing products
 * Run this script after adding the rating fields to populate them with calculated values
 */

import { initializeAllRatings } from '../lib/ratingUtils'

async function main() {
  console.log('Starting rating initialization...')
  
  try {
    await initializeAllRatings()
    console.log('✅ Rating initialization completed successfully!')
  } catch (error) {
    console.error('❌ Error during rating initialization:', error)
    process.exit(1)
  }
}

main()
