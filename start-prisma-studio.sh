#!/bin/bash
# This script starts Prisma Studio with the database connection

# Export the DATABASE_URL variable from the .env file
export $(grep -v '^#' .env | xargs)

# Start Prisma Studio
npx prisma studio
