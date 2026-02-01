#!/bin/bash

# ===========================================
# Createconomy Platform - Deployment Script
# ===========================================
# This script deploys all applications to Vercel
# Usage: ./scripts/deploy.sh [environment]
# Environments: preview, production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APPS=("marketplace" "forum" "admin" "seller")
ENVIRONMENT=${1:-preview}

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Createconomy Deployment Script${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Validate environment
if [[ "$ENVIRONMENT" != "preview" && "$ENVIRONMENT" != "production" ]]; then
    echo -e "${RED}Error: Invalid environment '$ENVIRONMENT'${NC}"
    echo "Usage: ./scripts/deploy.sh [preview|production]"
    exit 1
fi

echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}Error: Vercel CLI is not installed${NC}"
    echo "Install it with: npm i -g vercel"
    exit 1
fi

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo -e "${RED}Error: Not logged in to Vercel${NC}"
    echo "Run: vercel login"
    exit 1
fi

# Validate environment variables
echo -e "${BLUE}Validating environment variables...${NC}"

REQUIRED_VARS=(
    "NEXT_PUBLIC_CONVEX_URL"
    "STRIPE_SECRET_KEY"
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [[ -z "${!var}" ]]; then
        MISSING_VARS+=("$var")
    fi
done

if [[ ${#MISSING_VARS[@]} -gt 0 ]]; then
    echo -e "${YELLOW}Warning: The following environment variables are not set locally:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo -e "${YELLOW}Make sure they are configured in Vercel project settings.${NC}"
    echo ""
fi

# Build verification
echo -e "${BLUE}Running build verification...${NC}"
pnpm turbo build --dry-run

if [[ $? -ne 0 ]]; then
    echo -e "${RED}Build verification failed${NC}"
    exit 1
fi

echo -e "${GREEN}Build verification passed${NC}"
echo ""

# Deploy each app
DEPLOY_FLAGS=""
if [[ "$ENVIRONMENT" == "production" ]]; then
    DEPLOY_FLAGS="--prod"
fi

echo -e "${BLUE}Starting deployment...${NC}"
echo ""

FAILED_APPS=()
SUCCESSFUL_APPS=()

for app in "${APPS[@]}"; do
    echo -e "${YELLOW}Deploying ${app}...${NC}"
    
    cd "apps/${app}"
    
    if vercel $DEPLOY_FLAGS --yes; then
        echo -e "${GREEN}✓ ${app} deployed successfully${NC}"
        SUCCESSFUL_APPS+=("$app")
    else
        echo -e "${RED}✗ ${app} deployment failed${NC}"
        FAILED_APPS+=("$app")
    fi
    
    cd ../..
    echo ""
done

# Summary
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Deployment Summary${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

if [[ ${#SUCCESSFUL_APPS[@]} -gt 0 ]]; then
    echo -e "${GREEN}Successful deployments:${NC}"
    for app in "${SUCCESSFUL_APPS[@]}"; do
        echo "  ✓ $app"
    done
    echo ""
fi

if [[ ${#FAILED_APPS[@]} -gt 0 ]]; then
    echo -e "${RED}Failed deployments:${NC}"
    for app in "${FAILED_APPS[@]}"; do
        echo "  ✗ $app"
    done
    echo ""
    exit 1
fi

echo -e "${GREEN}All applications deployed successfully!${NC}"

# Show URLs for production
if [[ "$ENVIRONMENT" == "production" ]]; then
    echo ""
    echo -e "${BLUE}Production URLs:${NC}"
    echo "  Marketplace: https://createconomy.com"
    echo "  Forum:       https://discuss.createconomy.com"
    echo "  Admin:       https://console.createconomy.com"
    echo "  Seller:      https://seller.createconomy.com"
fi
