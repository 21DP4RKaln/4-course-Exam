#!/bin/sh
# Script to run the database seeder in the Docker container

# Navigate to the project directory
cd "$(dirname "$0")"

# Make sure the containers are running
docker-compose ps | grep -q "app.*Up" || {
  echo "Starting Docker containers..."
  docker-compose up -d
  # Wait for containers to be fully up
  sleep 10
}

# Run the seeder inside the container
echo "Running database seeder..."
docker-compose exec app sh -c "cd /app && export LD_LIBRARY_PATH=/lib:/usr/lib && npx tsx lib/seeder.ts"

# Check the exit code
if [ $? -eq 0 ]; then
  echo "Database seeding completed successfully."
else
  echo "Warning: Database seeder may have encountered issues."
  # Fallback approach - try running Prisma directly
  echo "Trying alternative approach with Prisma..."
  docker-compose exec app sh -c "cd /app && export LD_LIBRARY_PATH=/lib:/usr/lib && \
    npx prisma db seed"
fi
