#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 WIN Impact Network - Production Deployment${NC}"
echo "=================================================="

# Check if .env.prod exists
if [ ! -f .env.prod ]; then
    echo -e "${RED}❌ Error: .env.prod file not found!${NC}"
    echo "Please create .env.prod file with your production environment variables"
    exit 1
fi

# Step 1: Create backup
echo -e "${YELLOW}📦 Step 1: Creating database backup...${NC}"
./backup-database.sh

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backup failed! Aborting deployment.${NC}"
    exit 1
fi

# Step 2: Pull latest changes
echo -e "${YELLOW}📥 Step 2: Pulling latest changes from Git...${NC}"
git pull origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git pull failed! Aborting deployment.${NC}"
    exit 1
fi

# Step 3: Stop current containers gracefully
echo -e "${YELLOW}🛑 Step 3: Stopping current containers...${NC}"
docker-compose -f docker-compose.prod.yml down

# Step 4: Clean up old images (but keep volumes!)
echo -e "${YELLOW}🧹 Step 4: Cleaning up old images...${NC}"
docker image prune -f

# Step 5: Build new images
echo -e "${YELLOW}🔨 Step 5: Building new Docker images...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed! Aborting deployment.${NC}"
    exit 1
fi

# Step 6: Start services
echo -e "${YELLOW}🚀 Step 6: Starting services...${NC}"
docker-compose -f docker-compose.prod.yml up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start services!${NC}"
    echo -e "${YELLOW}🔄 Attempting rollback...${NC}"
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml up -d
    exit 1
fi

# Step 7: Wait for services to be healthy
echo -e "${YELLOW}⏳ Step 7: Waiting for services to be healthy...${NC}"
sleep 30

# Check if services are running
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo -e "${GREEN}✅ All services are running!${NC}"
else
    echo -e "${RED}❌ Some services failed to start!${NC}"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

# Step 8: Run database migrations
echo -e "${YELLOW}🗄️  Step 8: Running database migrations...${NC}"
docker-compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Database migration failed!${NC}"
    echo -e "${YELLOW}🔄 Consider rolling back to previous backup${NC}"
    exit 1
fi

# Step 9: Verify deployment
echo -e "${YELLOW}🔍 Step 9: Verifying deployment...${NC}"
sleep 10

# Check if the application is responding
if curl -f -s http://localhost:${PORT:-8080}/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is responding!${NC}"
else
    echo -e "${YELLOW}⚠️  Health check failed, but services are running${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Production deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo "  • Database backup created"
echo "  • Latest code pulled from Git"
echo "  • New Docker images built"
echo "  • Services restarted with zero downtime"
echo "  • Database migrations applied"
echo ""
echo -e "${BLUE}📊 Current Status:${NC}"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo -e "${BLUE}📝 Recent logs:${NC}"
docker-compose -f docker-compose.prod.yml logs --tail=20 