# Core Services CI/CD Workflows

This directory contains GitHub Actions workflows for the core-services microservices.

## 📋 Workflows Overview

### 1. **ci-cd.yml** - Main CI/CD Pipeline
Comprehensive pipeline that runs on push and pull requests.

**Triggers:**
- Push to `master`, `develop`, or `release/**` branches
- Pull requests to `master` or `develop`
- Manual workflow dispatch

**Jobs:**
- **build-and-test**: Builds all services and runs unit tests
- **code-quality**: Runs SonarCloud analysis
- **build-docker-images**: Builds and pushes Docker images for all services
- **security-scan**: Runs Trivy vulnerability scanning
- **deploy**: Deploys to specified environment
- **notify**: Sends notifications about pipeline status

### 2. **deploy-service.yml** - Single Service Deployment
Deploy a specific service to a chosen environment.

**Triggers:**
- Manual workflow dispatch only

**Inputs:**
- `service`: Which service to deploy (dropdown)
- `environment`: Target environment (dev/staging/production)
- `version`: Version tag to deploy (default: latest)

**Jobs:**
- **build-service**: Builds the selected service
- **build-docker**: Creates Docker image
- **deploy-service**: Deploys to Kubernetes
- **notify-deployment**: Sends deployment notifications

### 3. **pr-checks.yml** - Pull Request Validation
Runs comprehensive checks on pull requests.

**Triggers:**
- Pull requests to `master`, `develop`, or `release/**`

**Jobs:**
- **detect-changes**: Identifies which services changed
- **build-changed-services**: Builds only changed services
- **code-style**: Validates code formatting
- **dependency-check**: Checks for vulnerable dependencies
- **integration-tests**: Runs integration tests with PostgreSQL and Redis
- **pr-summary**: Posts summary comment on PR

## 🔧 Setup Instructions

### Required Secrets

Configure these secrets in your GitHub repository settings:

#### Container Registry
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions

#### Kubernetes Deployment
- `KUBE_CONFIG` - Base64 encoded kubeconfig file for your cluster
  ```bash
  cat ~/.kube/config | base64
  ```

#### Code Quality (Optional)
- `SONAR_TOKEN` - SonarCloud authentication token
  - Get from: https://sonarcloud.io/account/security

#### Notifications (Optional)
- `SLACK_WEBHOOK` - Slack webhook URL for notifications
  - Create at: https://api.slack.com/messaging/webhooks

### Environment Setup

Create the following environments in your repository:
1. **dev** - Development environment
2. **staging** - Staging environment
3. **production** - Production environment (with protection rules)

**Recommended Protection Rules for Production:**
- Required reviewers: 2
- Deployment branches: `master` only
- Wait timer: 5 minutes

## 🚀 Usage

### Running the Main CI/CD Pipeline

The pipeline runs automatically on:
```bash
git push origin master
git push origin develop
```

Or manually trigger via GitHub Actions UI:
1. Go to Actions tab
2. Select "Core Services CI/CD"
3. Click "Run workflow"
4. Choose environment

### Deploying a Specific Service

1. Go to Actions tab
2. Select "Deploy Specific Service"
3. Click "Run workflow"
4. Select:
   - Service name
   - Target environment
   - Version (or leave as 'latest')
5. Click "Run workflow"

### Pull Request Workflow

Automatically runs when you create a PR:
```bash
git checkout -b feature/my-feature
git push origin feature/my-feature
# Create PR via GitHub UI
```

The workflow will:
- Detect changed services
- Build and test only affected services
- Run code quality checks
- Post summary comment on PR

## 🐳 Docker Images

Images are pushed to GitHub Container Registry:
```
ghcr.io/<your-org>/<service-name>:<tag>
```

**Available Tags:**
- `latest` - Latest build from master branch
- `<branch-name>` - Latest build from specific branch
- `<branch>-<sha>` - Specific commit
- `<version>` - Semantic version (if tagged)

**Pull an image:**
```bash
docker pull ghcr.io/<your-org>/egov-idgen:latest
```

## 📊 Monitoring Builds

### View Build Status
- Check the Actions tab in GitHub
- Status badges can be added to README:
  ```markdown
  ![CI/CD](https://github.com/<org>/<repo>/workflows/Core%20Services%20CI/CD/badge.svg)
  ```

### Build Artifacts
- JAR files are uploaded as artifacts
- Retention: 7 days
- Download from workflow run page

## 🔍 Troubleshooting

### Build Failures

**Maven build fails:**
```bash
# Check Java version
- Ensure JDK 17 is used
- Verify pom.xml dependencies

# Clear cache
- Re-run workflow with cache cleared
```

**Docker build fails:**
```bash
# Check Dockerfile path
- Verify Dockerfile exists in service directory
- Check build context and WORK_DIR argument
```

### Deployment Failures

**Kubernetes deployment fails:**
```bash
# Verify kubeconfig
- Check KUBE_CONFIG secret is valid
- Ensure cluster is accessible

# Check namespace
- Verify namespace exists
- Check RBAC permissions
```

**Image pull errors:**
```bash
# Verify image exists
docker pull ghcr.io/<org>/<service>:<tag>

# Check registry authentication
- Ensure GITHUB_TOKEN has package:read permission
```

## 🔐 Security

### Image Scanning
- Trivy scans all images for vulnerabilities
- Results uploaded to GitHub Security tab
- View: Security → Code scanning alerts

### Dependency Scanning
- OWASP Dependency Check (optional)
- SonarCloud security hotspots
- Dependabot alerts (configure in .github/dependabot.yml)

## 📝 Customization

### Adding a New Service

1. Add service to matrix in `ci-cd.yml`:
```yaml
strategy:
  matrix:
    service:
      - your-new-service
```

2. Add to `deploy-service.yml` options:
```yaml
options:
  - your-new-service
```

3. Add to `pr-checks.yml` filters:
```yaml
your-new-service:
  - 'core-services/your-new-service/**'
```

### Modifying Build Steps

Edit the build job in `ci-cd.yml`:
```yaml
- name: Build with Maven
  working-directory: ./core-services
  run: mvn clean install -DskipTests -P your-profile
```

### Custom Deployment Strategy

Replace the deploy job with your deployment tool:
```yaml
# Helm example
- name: Deploy with Helm
  run: |
    helm upgrade --install ${{ matrix.service }} \
      ./charts/${{ matrix.service }} \
      --set image.tag=${{ github.sha }}
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Kubernetes GitHub Actions](https://github.com/Azure/k8s-set-context)
- [Maven GitHub Actions](https://github.com/actions/setup-java)

## 🤝 Contributing

When modifying workflows:
1. Test in a feature branch first
2. Use workflow_dispatch for manual testing
3. Document changes in this README
4. Review logs for security implications

## 📞 Support

For issues with CI/CD:
1. Check workflow logs in Actions tab
2. Review this documentation
3. Contact DevOps team
4. Create issue with `ci-cd` label
