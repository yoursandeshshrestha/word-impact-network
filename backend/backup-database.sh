#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🗄️  Creating database backup...${NC}"

# Load environment variables
if [ -f .env.prod ]; then
    source .env.prod
else
    echo -e "${RED}❌ Error: .env.prod file not found!${NC}"
    exit 1
fi

# Create backup directory if it doesn't exist
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

# Generate timestamp for backup filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

echo -e "${YELLOW}📦 Creating backup: $BACKUP_FILE${NC}"

# Check if postgres container is running
if ! docker-compose -f docker-compose.prod.yml ps -q postgres > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  PostgreSQL container is not running. Starting it temporarily for backup...${NC}"
    docker-compose -f docker-compose.prod.yml up -d postgres
    
    # Wait for postgres to be ready
    echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
    sleep 15
fi

# Check if database exists
echo -e "${YELLOW}🔍 Checking if database '$DB_NAME' exists...${NC}"
if docker exec -t $(docker-compose -f docker-compose.prod.yml ps -q postgres) \
    psql -U $DB_USER -d postgres -c "SELECT 1 FROM pg_database WHERE datname='$DB_NAME';" | grep -q 1; then
    echo -e "${GREEN}✅ Database '$DB_NAME' exists. Creating backup...${NC}"
    # Create database backup using docker exec
    docker exec -t $(docker-compose -f docker-compose.prod.yml ps -q postgres) \
        pg_dump -U $DB_USER -d $DB_NAME > $BACKUP_FILE
else
    echo -e "${YELLOW}⚠️  Database '$DB_NAME' does not exist. Skipping backup for first-time deployment.${NC}"
    # Create an empty backup file to satisfy the deployment script
    touch $BACKUP_FILE
    echo "-- No backup created: Database does not exist yet" > $BACKUP_FILE
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database backup created successfully!${NC}"
    echo -e "${GREEN}📁 Backup location: $BACKUP_FILE${NC}"
    
    # Compress the backup
    gzip $BACKUP_FILE
    echo -e "${GREEN}🗜️  Backup compressed: ${BACKUP_FILE}.gz${NC}"
    
    # Keep only last 5 backups
    ls -t $BACKUP_DIR/backup_*.sql.gz | tail -n +6 | xargs -r rm
    echo -e "${YELLOW}🧹 Kept only last 5 backups${NC}"
    
else
    echo -e "${RED}❌ Database backup failed!${NC}"
    exit 1
fi 