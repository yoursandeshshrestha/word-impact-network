#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Building and running WIN Impact Network Backend${NC}"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Error: .env.local file not found!${NC}"
    echo "Please create .env.local file with your environment variables"
    exit 1
fi

# Stop any running containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose.local.yml down

# Clean up any dangling images
echo -e "${YELLOW}🧹 Cleaning up dangling images...${NC}"
docker image prune -f

# Build images with proper naming
echo -e "${YELLOW}🔨 Building Docker images...${NC}"
docker-compose -f docker-compose.local.yml build --no-cache

# Check if build was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build completed successfully!${NC}"
    
    # Start the services
    echo -e "${YELLOW}🚀 Starting services...${NC}"
    docker-compose -f docker-compose.local.yml up -d
    
    echo -e "${GREEN}✅ Services started successfully!${NC}"
    echo ""
    echo -e "${GREEN}📋 Running containers:${NC}"
    docker-compose -f docker-compose.local.yml ps
    
    echo ""
    echo -e "${GREEN}📋 Docker images:${NC}"
    docker images | grep win-backend
    
else
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi 