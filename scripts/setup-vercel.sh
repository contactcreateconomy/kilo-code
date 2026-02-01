#!/bin/bash

# ===========================================
# Createconomy Platform - Vercel Setup Script
# ===========================================
# This script sets up Vercel projects for all applications
# Usage: ./scripts/setup-vercel.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
declare -A APPS
APPS=(
    ["marketplace"]="createconomy.com"
    ["forum"]="discuss.createconomy.com"
    ["admin"]="console.createconomy.com"
    ["seller"]="seller.createconomy.com"
)

VERCEL_TEAM=${VERCEL_TEAM:-""}
VERCEL_SCOPE=""

if [[ -n "$VERCEL_TEAM" ]]; then
    VERCEL_SCOPE="--scope $VERCEL_TEAM"
fi

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Createconomy Vercel Setup Script${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}Error: Vercel CLI is not installed${NC}"
    echo "Install it with: npm i -g vercel"
    exit 1
fi

# Check if logged in to Vercel
echo -e "${BLUE}Checking Vercel authentication...${NC}"
if ! vercel whoami $VERCEL_SCOPE &> /dev/null; then
    echo -e "${YELLOW}Not logged in to Vercel. Starting login...${NC}"
    vercel login
fi

VERCEL_USER=$(vercel whoami $VERCEL_SCOPE)
echo -e "${GREEN}Logged in as: ${VERCEL_USER}${NC}"
echo ""

# Function to setup a single app
setup_app() {
    local app=$1
    local domain=$2
    
    echo -e "${BLUE}Setting up ${app}...${NC}"
    
    cd "apps/${app}"
    
    # Link to Vercel project
    echo "  Linking to Vercel..."
    vercel link $VERCEL_SCOPE --yes 2>/dev/null || {
        echo "  Creating new Vercel project..."
        vercel $VERCEL_SCOPE --yes
    }
    
    # Get project info
    local project_name=$(cat .vercel/project.json 2>/dev/null | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
    
    if [[ -n "$project_name" ]]; then
        echo -e "  ${GREEN}✓ Project linked${NC}"
    else
        echo -e "  ${YELLOW}⚠ Could not verify project link${NC}"
    fi
    
    cd ../..
}

# Function to set environment variables
set_env_vars() {
    local app=$1
    
    echo -e "${BLUE}Setting environment variables for ${app}...${NC}"
    
    cd "apps/${app}"
    
    # Common environment variables
    local common_vars=(
        "NEXT_PUBLIC_CONVEX_URL"
        "AUTH_SECRET"
        "NEXT_PUBLIC_AUTH_DOMAIN"
        "NEXT_PUBLIC_MARKETPLACE_URL"
        "NEXT_PUBLIC_FORUM_URL"
        "NEXT_PUBLIC_ADMIN_URL"
        "NEXT_PUBLIC_SELLER_URL"
    )
    
    # App-specific variables
    case $app in
        "marketplace"|"seller")
            common_vars+=(
                "STRIPE_SECRET_KEY"
                "STRIPE_WEBHOOK_SECRET"
                "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
                "STRIPE_CONNECT_CLIENT_ID"
            )
            ;;
        "admin")
            common_vars+=(
                "STRIPE_SECRET_KEY"
                "ADMIN_ALLOWED_EMAILS"
            )
            ;;
    esac
    
    echo "  The following environment variables should be set in Vercel:"
    for var in "${common_vars[@]}"; do
        echo "    - $var"
    done
    
    echo ""
    echo "  To set them, run:"
    echo "    vercel env add <VAR_NAME>"
    echo ""
    
    cd ../..
}

# Setup each app
echo -e "${YELLOW}Step 1: Linking Vercel Projects${NC}"
echo ""

for app in "${!APPS[@]}"; do
    setup_app "$app" "${APPS[$app]}"
    echo ""
done

# Environment variables guide
echo -e "${YELLOW}Step 2: Environment Variables${NC}"
echo ""

for app in "${!APPS[@]}"; do
    set_env_vars "$app"
done

# Domain configuration guide
echo -e "${YELLOW}Step 3: Domain Configuration${NC}"
echo ""
echo "Configure the following domains in Vercel Dashboard:"
echo ""

for app in "${!APPS[@]}"; do
    echo "  ${app}: ${APPS[$app]}"
done

echo ""
echo "For each domain:"
echo "  1. Go to Project Settings > Domains"
echo "  2. Add the domain"
echo "  3. Configure DNS records as instructed by Vercel"
echo ""

# Turborepo remote caching
echo -e "${YELLOW}Step 4: Enable Remote Caching${NC}"
echo ""
echo "To enable Turborepo remote caching:"
echo ""
echo "  1. Run: npx turbo login"
echo "  2. Run: npx turbo link"
echo ""
echo "Or set these environment variables in CI:"
echo "  - TURBO_TOKEN"
echo "  - TURBO_TEAM"
echo ""

# Summary
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Setup Complete${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Configure environment variables in Vercel Dashboard"
echo "  2. Set up custom domains"
echo "  3. Configure DNS records"
echo "  4. Enable remote caching for faster builds"
echo ""
echo "To deploy:"
echo "  ./scripts/deploy.sh preview    # Deploy to preview"
echo "  ./scripts/deploy.sh production # Deploy to production"
echo ""
echo -e "${GREEN}Setup completed successfully!${NC}"
