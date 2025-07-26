#!/bin/bash

echo "🧹 Cleaning up Docker images..."

# Remove all dangling images (none images)
echo "Removing dangling images..."
docker image prune -f

# Remove all unused images
echo "Removing unused images..."
docker image prune -a -f

# Remove all stopped containers
echo "Removing stopped containers..."
docker container prune -f

# Remove all unused volumes (COMMENTED OUT - DANGEROUS FOR DATABASE DATA)
# echo "Removing unused volumes..."
# docker volume prune -f

# Remove all unused networks
echo "Removing unused networks..."
docker network prune -f

echo "✅ Docker cleanup completed!"

echo ""
echo "📋 Current Docker images:"
docker images

echo ""
echo "🚀 To rebuild your app properly, run:"
echo "   docker-compose -f docker-compose.local.yml down"
echo "   docker-compose -f docker-compose.local.yml build --no-cache"
echo "   docker-compose -f docker-compose.local.yml up" 