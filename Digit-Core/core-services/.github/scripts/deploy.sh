#!/bin/bash

# Kubernetes Deployment Script for Core Services
# This script deploys a service to Kubernetes using the deployment template

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default values
DOCKER_REGISTRY="${DOCKER_REGISTRY:-ghcr.io}"
IMAGE_PREFIX="${IMAGE_PREFIX:-$GITHUB_REPOSITORY_OWNER}"
ENVIRONMENT="${ENVIRONMENT:-dev}"
NAMESPACE="${NAMESPACE:-core-services-$ENVIRONMENT}"

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

# Function to show usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Deploy a core service to Kubernetes

OPTIONS:
    -s, --service SERVICE       Service name (required)
    -e, --environment ENV       Environment (dev/staging/production) [default: dev]
    -t, --tag TAG              Docker image tag [default: latest]
    -n, --namespace NAMESPACE   Kubernetes namespace [default: core-services-ENV]
    -r, --replicas COUNT       Number of replicas [default: 2]
    -d, --dry-run              Show what would be deployed without applying
    -h, --help                 Show this help message

EXAMPLES:
    # Deploy egov-idgen to dev
    $0 -s egov-idgen -e dev

    # Deploy with specific tag to production
    $0 -s egov-filestore -e production -t v1.2.3

    # Dry run
    $0 -s gateway -e staging --dry-run

ENVIRONMENT VARIABLES:
    DOCKER_REGISTRY            Docker registry URL [default: ghcr.io]
    IMAGE_PREFIX               Image prefix/organization
    DB_HOST                    Database host
    DB_PORT                    Database port [default: 5432]
    DB_NAME                    Database name
    DB_USERNAME                Database username
    DB_PASSWORD                Database password

EOF
    exit 1
}

# Parse arguments
SERVICE_NAME=""
IMAGE_TAG="latest"
REPLICAS=2
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--service)
            SERVICE_NAME="$2"
            shift 2
            ;;
        -e|--environment)
            ENVIRONMENT="$2"
            NAMESPACE="core-services-$2"
            shift 2
            ;;
        -t|--tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -r|--replicas)
            REPLICAS="$2"
            shift 2
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            print_error "Unknown option: $1"
            usage
            ;;
    esac
done

# Validate required parameters
if [ -z "$SERVICE_NAME" ]; then
    print_error "Service name is required"
    usage
fi

# Set environment-specific defaults
case $ENVIRONMENT in
    dev)
        REPLICAS=${REPLICAS:-1}
        MIN_REPLICAS=1
        MAX_REPLICAS=3
        CPU_REQUEST="200m"
        CPU_LIMIT="1000m"
        MEMORY_REQUEST="512Mi"
        MEMORY_LIMIT="1Gi"
        LOG_LEVEL="DEBUG"
        DB_HOST="${DB_HOST:-postgres-dev}"
        DB_PORT="${DB_PORT:-5432}"
        DB_NAME="${DB_NAME:-${SERVICE_NAME//-/_}_dev}"
        DOMAIN="${DOMAIN:-dev.yourdomain.com}"
        ;;
    staging)
        REPLICAS=${REPLICAS:-2}
        MIN_REPLICAS=2
        MAX_REPLICAS=5
        CPU_REQUEST="500m"
        CPU_LIMIT="2000m"
        MEMORY_REQUEST="1Gi"
        MEMORY_LIMIT="2Gi"
        LOG_LEVEL="INFO"
        DB_HOST="${DB_HOST:-postgres-staging}"
        DB_PORT="${DB_PORT:-5432}"
        DB_NAME="${DB_NAME:-${SERVICE_NAME//-/_}_staging}"
        DOMAIN="${DOMAIN:-staging.yourdomain.com}"
        ;;
    production)
        REPLICAS=${REPLICAS:-3}
        MIN_REPLICAS=3
        MAX_REPLICAS=10
        CPU_REQUEST="1000m"
        CPU_LIMIT="4000m"
        MEMORY_REQUEST="2Gi"
        MEMORY_LIMIT="4Gi"
        LOG_LEVEL="WARN"
        DB_HOST="${DB_HOST:-postgres-prod}"
        DB_PORT="${DB_PORT:-5432}"
        DB_NAME="${DB_NAME:-${SERVICE_NAME//-/_}_prod}"
        DOMAIN="${DOMAIN:-yourdomain.com}"
        ;;
    *)
        print_error "Invalid environment: $ENVIRONMENT"
        exit 1
        ;;
esac

# Print deployment info
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Kubernetes Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo
print_info "Service:      $SERVICE_NAME"
print_info "Environment:  $ENVIRONMENT"
print_info "Namespace:    $NAMESPACE"
print_info "Image:        $DOCKER_REGISTRY/$IMAGE_PREFIX/$SERVICE_NAME:$IMAGE_TAG"
print_info "Replicas:     $REPLICAS (min: $MIN_REPLICAS, max: $MAX_REPLICAS)"
print_info "Resources:    CPU: $CPU_REQUEST-$CPU_LIMIT, Memory: $MEMORY_REQUEST-$MEMORY_LIMIT"
echo

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed"
    exit 1
fi

# Check if we can connect to cluster
if ! kubectl cluster-info &> /dev/null; then
    print_error "Cannot connect to Kubernetes cluster"
    exit 1
fi

# Create namespace if it doesn't exist
print_info "Checking namespace..."
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    print_warning "Namespace $NAMESPACE does not exist, creating..."
    if [ "$DRY_RUN" = false ]; then
        kubectl create namespace "$NAMESPACE"
        kubectl label namespace "$NAMESPACE" environment="$ENVIRONMENT"
        print_success "Namespace created"
    else
        print_info "Would create namespace: $NAMESPACE"
    fi
else
    print_success "Namespace exists"
fi

# Export variables for envsubst
export SERVICE_NAME
export NAMESPACE
export ENVIRONMENT
export VERSION="$IMAGE_TAG"
export DOCKER_REGISTRY
export IMAGE_PREFIX
export IMAGE_TAG
export REPLICAS
export MIN_REPLICAS
export MAX_REPLICAS
export CPU_REQUEST
export CPU_LIMIT
export MEMORY_REQUEST
export MEMORY_LIMIT
export LOG_LEVEL
export DB_HOST
export DB_PORT
export DB_NAME
export DB_USERNAME="${DB_USERNAME:-postgres}"
export DB_PASSWORD="${DB_PASSWORD:-postgres}"
export DOMAIN

# Get template directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_FILE="$SCRIPT_DIR/../k8s/deployment-template.yaml"

if [ ! -f "$TEMPLATE_FILE" ]; then
    print_error "Template file not found: $TEMPLATE_FILE"
    exit 1
fi

# Generate deployment manifest
print_info "Generating deployment manifest..."
MANIFEST=$(envsubst < "$TEMPLATE_FILE")

if [ "$DRY_RUN" = true ]; then
    echo
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}DRY RUN - Generated Manifest${NC}"
    echo -e "${YELLOW}========================================${NC}"
    echo "$MANIFEST"
    echo
    print_warning "Dry run mode - no changes applied"
    exit 0
fi

# Apply manifest
print_info "Applying deployment..."
echo "$MANIFEST" | kubectl apply -f -

if [ $? -eq 0 ]; then
    print_success "Deployment applied successfully"
else
    print_error "Deployment failed"
    exit 1
fi

# Wait for rollout
print_info "Waiting for rollout to complete..."
if kubectl rollout status deployment/"$SERVICE_NAME" -n "$NAMESPACE" --timeout=5m; then
    print_success "Rollout completed successfully"
else
    print_error "Rollout failed or timed out"
    
    # Show pod status
    print_info "Pod status:"
    kubectl get pods -n "$NAMESPACE" -l app="$SERVICE_NAME"
    
    # Show recent events
    print_info "Recent events:"
    kubectl get events -n "$NAMESPACE" --sort-by='.lastTimestamp' | tail -10
    
    exit 1
fi

# Verify deployment
print_info "Verifying deployment..."
READY_REPLICAS=$(kubectl get deployment "$SERVICE_NAME" -n "$NAMESPACE" -o jsonpath='{.status.readyReplicas}')
DESIRED_REPLICAS=$(kubectl get deployment "$SERVICE_NAME" -n "$NAMESPACE" -o jsonpath='{.spec.replicas}')

if [ "$READY_REPLICAS" = "$DESIRED_REPLICAS" ]; then
    print_success "All replicas are ready ($READY_REPLICAS/$DESIRED_REPLICAS)"
else
    print_warning "Not all replicas are ready ($READY_REPLICAS/$DESIRED_REPLICAS)"
fi

# Show pod status
echo
print_info "Pod status:"
kubectl get pods -n "$NAMESPACE" -l app="$SERVICE_NAME"

# Show service endpoints
echo
print_info "Service endpoints:"
kubectl get svc "$SERVICE_NAME" -n "$NAMESPACE"

# Show ingress (if exists)
if kubectl get ingress "$SERVICE_NAME" -n "$NAMESPACE" &> /dev/null; then
    echo
    print_info "Ingress:"
    kubectl get ingress "$SERVICE_NAME" -n "$NAMESPACE"
fi

echo
echo -e "${GREEN}========================================${NC}"
print_success "Deployment completed successfully!"
echo -e "${GREEN}========================================${NC}"
echo
print_info "Next steps:"
echo "  - Monitor logs: kubectl logs -f deployment/$SERVICE_NAME -n $NAMESPACE"
echo "  - Check health: kubectl exec -it deployment/$SERVICE_NAME -n $NAMESPACE -- curl localhost:8081/actuator/health"
echo "  - Scale: kubectl scale deployment/$SERVICE_NAME --replicas=N -n $NAMESPACE"
echo "  - Rollback: kubectl rollout undo deployment/$SERVICE_NAME -n $NAMESPACE"
echo
