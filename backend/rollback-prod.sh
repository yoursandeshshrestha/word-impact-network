#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${RED}🔄 WIN Impact Network - Production Rollback${NC}"
echo "================================================"

# Check if .env.prod exists
if [ ! -f .env.prod ]; then
    echo -e "${RED}❌ Error: .env.prod file not found!${NC}"
    exit 1
fi

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}📋 Available backups:${NC}"
    ls -la ./backups/backup_*.sql.gz 2>/dev/null | head -10
    
    echo ""
    echo -e "${RED}❌ Please provide a backup file to restore from:${NC}"
    echo "Usage: ./rollback-prod.sh ./backups/backup_YYYYMMDD_HHMMSS.sql.gz"
    exit 1
fi

BACKUP_FILE=$1

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNING: This will restore the database from backup!${NC}"
echo -e "${YELLOW}⚠️  This operation will overwrite current database data!${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}🛑 Rollback cancelled.${NC}"
    exit 0
fi

# Step 1: Stop current containers
echo -e "${YELLOW}🛑 Step 1: Stopping current containers...${NC}"
docker-compose -f docker-compose.prod.yml down

# Step 2: Start only the database
echo -e "${YELLOW}🗄️  Step 2: Starting database container...${NC}"
docker-compose -f docker-compose.prod.yml up -d postgres

# Wait for database to be ready
echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
sleep 20

# Step 3: Restore database from backup
echo -e "${YELLOW}📦 Step 3: Restoring database from backup...${NC}"

# Load environment variables
source .env.prod

# Decompress and restore
gunzip -c "$BACKUP_FILE" | docker exec -i $(docker-compose -f docker-compose.prod.yml ps -q postgres) \
    psql -U $DB_USER -d $DB_NAME

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database restored successfully!${NC}"
else
    echo -e "${RED}❌ Database restore failed!${NC}"
    exit 1
fi

# Step 4: Start all services
echo -e "${YELLOW}🚀 Step 4: Starting all services...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Step 5: Wait for services to be healthy
echo -e "${YELLOW}⏳ Step 5: Waiting for services to be healthy...${NC}"
sleep 30

# Check if services are running
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo -e "${GREEN}✅ All services are running!${NC}"
else
    echo -e "${RED}❌ Some services failed to start!${NC}"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Production rollback completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Rollback Summary:${NC}"
echo "  • Database restored from: $BACKUP_FILE"
echo "  • All services restarted"
echo "  • Application should be back to previous state"
echo ""
echo -e "${BLUE}📊 Current Status:${NC}"
docker-compose -f docker-compose.prod.yml ps 