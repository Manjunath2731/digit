# CI/CD Quick Start Guide

This guide will help you set up and run the GitHub Actions CI/CD pipeline for core-services.

## 📋 Prerequisites

- GitHub repository with admin access
- GitHub CLI installed (optional, for automated setup)
- Kubernetes cluster (for deployment)
- Docker registry access (GitHub Container Registry is used by default)

## 🚀 Quick Setup (5 minutes)

### Step 1: Configure Secrets

You have two options:

#### Option A: Automated Setup (Recommended)
```bash
cd core-services
.github/scripts/setup-secrets.sh
```

#### Option B: Manual Setup
Go to your repository on GitHub:
1. Navigate to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the following secrets:

**Required:**
- `KUBE_CONFIG` - Your Kubernetes configuration (base64 encoded)
  ```bash
  cat ~/.kube/config | base64 | pbcopy
  ```

**Optional:**
- `SONAR_TOKEN` - For code quality analysis
- `SLACK_WEBHOOK` - For deployment notifications

### Step 2: Create Environments

1. Go to **Settings** → **Environments**
2. Create three environments:
   - `dev`
   - `staging`
   - `production`

3. For **production**, add protection rules:
   - ✅ Required reviewers: 2
   - ✅ Wait timer: 5 minutes
   - ✅ Deployment branches: `master` only

### Step 3: Test the Pipeline

```bash
# Create a test branch
git checkout -b test/cicd-setup

# Make a small change
echo "# CI/CD Test" >> test.md

# Commit and push
git add test.md
git commit -m "test: CI/CD pipeline setup"
git push origin test/cicd-setup

# Create a pull request
gh pr create --title "Test CI/CD Pipeline" --body "Testing the new CI/CD setup"
```

### Step 4: Monitor the Build

1. Go to the **Actions** tab in your GitHub repository
2. You should see the "Pull Request Checks" workflow running
3. Click on the workflow to see detailed logs

## 📚 Workflow Files

The CI/CD setup includes three main workflows:

### 1. `ci-cd.yml` - Main Pipeline
**When it runs:**
- Push to `master`, `develop`, or `release/**`
- Pull requests
- Manual trigger

**What it does:**
- ✅ Builds all services
- ✅ Runs tests
- ✅ Code quality analysis
- ✅ Builds Docker images
- ✅ Security scanning
- ✅ Deploys to environment

### 2. `deploy-service.yml` - Single Service Deploy
**When it runs:**
- Manual trigger only

**What it does:**
- Builds one specific service
- Creates Docker image
- Deploys to chosen environment

**How to use:**
1. Go to **Actions** → **Deploy Specific Service**
2. Click **Run workflow**
3. Select service, environment, and version
4. Click **Run workflow**

### 3. `pr-checks.yml` - PR Validation
**When it runs:**
- Pull requests to main branches

**What it does:**
- Detects changed services
- Builds only changed code
- Runs tests
- Code style checks
- Posts summary on PR

## 🎯 Common Use Cases

### Deploy All Services to Dev
```bash
git checkout develop
git pull
# Make your changes
git add .
git commit -m "feat: new feature"
git push origin develop
```
The pipeline will automatically build and deploy to dev.

### Deploy Single Service to Production
1. Go to **Actions** tab
2. Select **Deploy Specific Service**
3. Click **Run workflow**
4. Choose:
   - Service: `egov-idgen`
   - Environment: `production`
   - Version: `latest` or specific tag
5. Click **Run workflow**
6. Approve the deployment (if protection rules are set)

### Create a Release
```bash
# Create and push a tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```
The pipeline will build and tag Docker images with the version.

## 🔍 Monitoring & Debugging

### View Build Logs
1. Go to **Actions** tab
2. Click on the workflow run
3. Click on a job to see detailed logs

### Check Docker Images
```bash
# List images in GitHub Container Registry
gh api /user/packages/container/<service-name>/versions

# Pull an image
docker pull ghcr.io/<your-org>/<service-name>:latest
```

### View Deployment Status
```bash
# Check pods in Kubernetes
kubectl get pods -n core-services-dev

# Check deployment rollout
kubectl rollout status deployment/<service-name> -n core-services-dev

# View logs
kubectl logs -f deployment/<service-name> -n core-services-dev
```

## 🛠️ Customization

### Change Java Version
Edit `.github/workflows/ci-cd.yml`:
```yaml
env:
  JAVA_VERSION: '17'  # Change to '11', '17', '21', etc.
```

### Add New Service
1. Add to the matrix in `ci-cd.yml`:
```yaml
strategy:
  matrix:
    service:
      - your-new-service
```

2. Add to `deploy-service.yml` options
3. Add to `pr-checks.yml` filters

### Modify Build Command
Edit the build step in workflows:
```yaml
- name: Build with Maven
  run: mvn clean install -DskipTests -P your-profile
```

### Change Docker Registry
Edit the workflow files:
```yaml
env:
  DOCKER_REGISTRY: docker.io  # or your registry
  IMAGE_PREFIX: your-org
```

Add registry credentials as secrets:
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`

## 🔐 Security Best Practices

### Secrets Management
- ✅ Never commit secrets to the repository
- ✅ Use GitHub Secrets for sensitive data
- ✅ Rotate secrets regularly
- ✅ Use environment-specific secrets

### Image Security
- ✅ Scan images with Trivy
- ✅ Use specific base image versions
- ✅ Keep dependencies updated
- ✅ Review security alerts in GitHub Security tab

### Deployment Security
- ✅ Use environment protection rules
- ✅ Require approvals for production
- ✅ Limit who can approve deployments
- ✅ Enable deployment logs

## 📊 Metrics & Reporting

### Build Status Badge
Add to your README.md:
```markdown
![CI/CD](https://github.com/<org>/<repo>/workflows/Core%20Services%20CI/CD/badge.svg)
```

### Test Coverage
View in:
- SonarCloud dashboard (if configured)
- Workflow artifacts
- PR comments

### Deployment History
View in:
- **Actions** tab → Filter by workflow
- **Environments** → Click environment → View deployments

## 🆘 Troubleshooting

### Build Fails with "Out of Memory"
Increase Maven memory:
```yaml
env:
  MAVEN_OPTS: -Xmx4096m  # Increase from 3072m
```

### Docker Build Timeout
Increase timeout or optimize Dockerfile:
```yaml
- name: Build Docker image
  timeout-minutes: 30  # Default is 360
```

### Deployment Fails
Check:
1. KUBE_CONFIG secret is valid
2. Kubernetes cluster is accessible
3. Namespace exists
4. RBAC permissions are correct

### Tests Fail
Run locally first:
```bash
cd core-services
mvn clean test
```

## 📞 Getting Help

1. Check workflow logs in Actions tab
2. Review `.github/workflows/README.md`
3. Check GitHub Actions documentation
4. Create an issue with `ci-cd` label

## 🎓 Next Steps

1. ✅ Set up branch protection rules
2. ✅ Configure Dependabot for dependency updates
3. ✅ Set up monitoring and alerting
4. ✅ Document your deployment process
5. ✅ Train team members on the CI/CD workflow

## 📖 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Kubernetes Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

**Need help?** Check the detailed documentation in `.github/workflows/README.md`
