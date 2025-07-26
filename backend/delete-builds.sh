#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🗑️  Docker Build Cleanup Script${NC}"
echo "=================================="

# Check if Docker CLI is available
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker CLI not found. Please install Docker first.${NC}"
    exit 1
fi

# Function to delete builds
delete_builds() {
    echo -e "${YELLOW}🔍 Searching for Docker builds...${NC}"
    
    # Get all build IDs
    local build_ids=$(docker buildx ls 2>/dev/null | grep -v "NAME" | awk '{print $1}')
    
    if [ -z "$build_ids" ]; then
        echo -e "${YELLOW}ℹ️  No local builds found.${NC}"
        return
    fi
    
    echo -e "${YELLOW}📋 Found builds:${NC}"
    echo "$build_ids"
    echo ""
    
    # Delete each build
    local deleted_count=0
    for build_id in $build_ids; do
        echo -e "${YELLOW}🗑️  Deleting build: $build_id${NC}"
        if docker buildx rm "$build_id" 2>/dev/null; then
            echo -e "${GREEN}✅ Deleted: $build_id${NC}"
            ((deleted_count++))
        else
            echo -e "${RED}❌ Failed to delete: $build_id${NC}"
        fi
    done
    
    echo ""
    echo -e "${GREEN}✅ Deleted $deleted_count builds${NC}"
}

# Function to clean Docker Build Cloud builds
clean_build_cloud() {
    echo -e "${YELLOW}☁️  Cleaning Docker Build Cloud builds...${NC}"
    
    # Check if we can access Docker Build Cloud
    if ! docker buildx ls --builder cloud 2>/dev/null | grep -q "cloud"; then
        echo -e "${YELLOW}ℹ️  Docker Build Cloud not configured or no builds found.${NC}"
        return
    fi
    
    # Get build history from cloud
    local cloud_builds=$(docker buildx ls --builder cloud 2>/dev/null | grep -v "NAME" | awk '{print $1}')
    
    if [ -z "$cloud_builds" ]; then
        echo -e "${YELLOW}ℹ️  No cloud builds found.${NC}"
        return
    fi
    
    echo -e "${YELLOW}📋 Found cloud builds:${NC}"
    echo "$cloud_builds"
    echo ""
    
    # Delete cloud builds
    local deleted_count=0
    for build_id in $cloud_builds; do
        echo -e "${YELLOW}🗑️  Deleting cloud build: $build_id${NC}"
        if docker buildx rm --builder cloud "$build_id" 2>/dev/null; then
            echo -e "${GREEN}✅ Deleted cloud build: $build_id${NC}"
            ((deleted_count++))
        else
            echo -e "${RED}❌ Failed to delete cloud build: $build_id${NC}"
        fi
    done
    
    echo ""
    echo -e "${GREEN}✅ Deleted $deleted_count cloud builds${NC}"
}

# Function to clean all Docker resources
clean_all_docker() {
    echo -e "${YELLOW}🧹 Cleaning all Docker resources...${NC}"
    
    # Remove dangling images
    echo -e "${YELLOW}🗑️  Removing dangling images...${NC}"
    docker image prune -f
    
    # Remove unused images
    echo -e "${YELLOW}🗑️  Removing unused images...${NC}"
    docker image prune -a -f
    
    # Remove stopped containers
    echo -e "${YELLOW}🗑️  Removing stopped containers...${NC}"
    docker container prune -f
    
    # Remove unused networks
    echo -e "${YELLOW}🗑️  Removing unused networks...${NC}"
    docker network prune -f
    
    echo -e "${GREEN}✅ All Docker resources cleaned!${NC}"
}

# Main execution
echo -e "${BLUE}Choose cleanup option:${NC}"
echo "1) Delete local builds only"
echo "2) Delete cloud builds only"
echo "3) Delete all builds (local + cloud)"
echo "4) Clean all Docker resources (images, containers, networks)"
echo "5) Full cleanup (all of the above)"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        delete_builds
        ;;
    2)
        clean_build_cloud
        ;;
    3)
        delete_builds
        echo ""
        clean_build_cloud
        ;;
    4)
        clean_all_docker
        ;;
    5)
        delete_builds
        echo ""
        clean_build_cloud
        echo ""
        clean_all_docker
        ;;
    *)
        echo -e "${RED}❌ Invalid choice. Please run the script again.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Cleanup completed!${NC}"
echo ""
echo -e "${BLUE}📊 Current Docker status:${NC}"
echo "Images:"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | head -10
echo ""
echo "Containers:"
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | head -5 