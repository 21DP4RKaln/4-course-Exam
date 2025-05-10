#!/bin/bash
# This script starts Prisma Studio inside the Docker container and forwards the port

# Start Prisma Studio in the app container
echo "Starting Prisma Studio in the Docker container..."
docker exec -it 4-course-exam-app-1 npx prisma studio

# Note: If the above doesn't work, try:
# docker exec -it 4-course-exam-app-1 sh -c "cd /app && npx prisma studio"
