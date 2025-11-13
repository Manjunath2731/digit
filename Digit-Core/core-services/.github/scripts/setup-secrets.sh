#!/bin/bash

# GitHub Actions Secrets Setup Script
# This script helps you configure required secrets for CI/CD workflows

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}GitHub Actions Secrets Setup${NC}"
echo -e "${GREEN}========================================${NC}\n"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}You need to authenticate with GitHub CLI${NC}"
    gh auth login
fi

# Get repository information
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo -e "${GREEN}Repository: ${REPO}${NC}\n"

# Function to set secret
set_secret() {
    local secret_name=$1
    local secret_description=$2
    local is_required=$3
    
    echo -e "${YELLOW}${secret_description}${NC}"
    
    if [ "$is_required" = "true" ]; then
        echo -e "${RED}[REQUIRED]${NC}"
    else
        echo -e "${GREEN}[OPTIONAL]${NC}"
    fi
    
    read -p "Do you want to set ${secret_name}? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -sp "Enter value for ${secret_name}: " secret_value
        echo
        
        if [ -n "$secret_value" ]; then
            echo "$secret_value" | gh secret set "$secret_name"
            echo -e "${GREEN}✓ ${secret_name} has been set${NC}\n"
        else
            echo -e "${RED}✗ No value provided, skipping${NC}\n"
        fi
    else
        echo -e "${YELLOW}Skipped ${secret_name}${NC}\n"
    fi
}

# Function to set secret from file
set_secret_from_file() {
    local secret_name=$1
    local secret_description=$2
    local is_required=$3
    
    echo -e "${YELLOW}${secret_description}${NC}"
    
    if [ "$is_required" = "true" ]; then
        echo -e "${RED}[REQUIRED]${NC}"
    else
        echo -e "${GREEN}[OPTIONAL]${NC}"
    fi
    
    read -p "Do you want to set ${secret_name} from file? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter file path: " file_path
        
        if [ -f "$file_path" ]; then
            gh secret set "$secret_name" < "$file_path"
            echo -e "${GREEN}✓ ${secret_name} has been set from file${NC}\n"
        else
            echo -e "${RED}✗ File not found: ${file_path}${NC}\n"
        fi
    else
        echo -e "${YELLOW}Skipped ${secret_name}${NC}\n"
    fi
}

echo -e "${GREEN}=== Kubernetes Configuration ===${NC}\n"

# KUBE_CONFIG
echo -e "${YELLOW}KUBE_CONFIG - Kubernetes configuration for deployment${NC}"
echo "This should be your kubeconfig file (base64 encoded)"
echo "Generate with: cat ~/.kube/config | base64"
echo
set_secret_from_file "KUBE_CONFIG" "Kubernetes configuration" "true"

echo -e "${GREEN}=== Code Quality ===${NC}\n"

# SONAR_TOKEN
set_secret "SONAR_TOKEN" "SonarCloud authentication token (get from https://sonarcloud.io/account/security)" "false"

echo -e "${GREEN}=== Notifications ===${NC}\n"

# SLACK_WEBHOOK
set_secret "SLACK_WEBHOOK" "Slack webhook URL for notifications (create at https://api.slack.com/messaging/webhooks)" "false"

echo -e "${GREEN}=== Container Registry ===${NC}\n"

# Docker Hub (if not using GitHub Container Registry)
read -p "Are you using Docker Hub instead of GitHub Container Registry? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    set_secret "DOCKER_USERNAME" "Docker Hub username" "true"
    set_secret "DOCKER_PASSWORD" "Docker Hub password or access token" "true"
fi

# AWS ECR (if using)
read -p "Are you using AWS ECR? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    set_secret "AWS_ACCESS_KEY_ID" "AWS Access Key ID" "true"
    set_secret "AWS_SECRET_ACCESS_KEY" "AWS Secret Access Key" "true"
    set_secret "AWS_REGION" "AWS Region (e.g., us-east-1)" "true"
fi

echo -e "${GREEN}=== Environment-Specific Secrets ===${NC}\n"

# Database credentials for different environments
for env in dev staging production; do
    echo -e "${YELLOW}--- ${env} environment ---${NC}"
    
    read -p "Set database credentials for ${env}? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        set_secret "DB_HOST_${env^^}" "Database host for ${env}" "false"
        set_secret "DB_PASSWORD_${env^^}" "Database password for ${env}" "false"
        set_secret "DB_USERNAME_${env^^}" "Database username for ${env}" "false"
    fi
    echo
done

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo "Next steps:"
echo "1. Create environments in GitHub: Settings → Environments"
echo "   - dev"
echo "   - staging"
echo "   - production"
echo
echo "2. Configure environment protection rules for production:"
echo "   - Required reviewers"
echo "   - Deployment branches"
echo
echo "3. Review and customize workflows in .github/workflows/"
echo
echo "4. Test the workflows:"
echo "   - Create a test branch"
echo "   - Make a change and push"
echo "   - Create a pull request"
echo
echo -e "${GREEN}For more information, see .github/workflows/README.md${NC}"
