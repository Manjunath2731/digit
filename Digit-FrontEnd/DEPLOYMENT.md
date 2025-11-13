# Automated Deployment Setup Guide

This guide explains how to set up automated deployment for your React app to Google Cloud Ubuntu server using GitHub Actions and PM2.

## Prerequisites

1. **Google Cloud Ubuntu Server** with SSH access
2. **GitHub repository** with your React app
3. **PM2** installed on your server
4. **Node.js** and **npm** installed on your server

## Server Setup

### 1. Install Required Dependencies on Server

```bash
# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install serve globally (for serving React build)
sudo npm install -g serve

# Create application directory
mkdir -p ~/apps/digit-frontend
mkdir -p ~/apps/digit-frontend/logs

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command above
```

### 2. Generate SSH Key for GitHub Actions

On your local machine or server:

```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -C "github-actions@yourdomain.com" -f ~/.ssh/github-actions

# Copy the public key to your server
ssh-copy-id -i ~/.ssh/github-actions.pub username@your-server-ip
```

## GitHub Repository Setup

### 1. Add Repository Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `GCP_HOST` | Your Google Cloud server IP | `34.14.142.242` |
| `GCP_USERNAME` | SSH username for your server | `ubuntu` |
| `GCP_SSH_KEY` | Private SSH key content | Content of `~/.ssh/github-actions` |
| `GCP_PORT` | SSH port (optional, defaults to 22) | `22` |
| `REACT_APP_API_URL` | Your API URL | `http://34.14.142.242:5005/api` |
| `APP_NAME` | PM2 app name (optional) | `digit-frontend` |
| `DEPLOY_PATH` | Deployment path on server (optional) | `/home/ubuntu/apps/digit-frontend` |

### 2. How to Add SSH Key Secret

1. Copy the content of your private key:
   ```bash
   cat ~/.ssh/github-actions
   ```
2. In GitHub, create a new secret named `GCP_SSH_KEY`
3. Paste the entire private key content (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`)

## Files Created

### 1. GitHub Actions Workflow (`.github/workflows/deploy.yml`)
- Automatically triggers on push to main/master branch
- Builds the React app
- Deploys to your Google Cloud server
- Manages PM2 process

### 2. PM2 Ecosystem Config (`ecosystem.config.js`)
- Configures PM2 process management
- Sets up logging
- Defines environment variables

### 3. Updated Package.json
- Added `serve` package for production serving

## Deployment Process

The automated deployment follows these steps:

1. **Trigger**: Push to main/master branch or merged PR
2. **Build**: Install dependencies and build React app
3. **Package**: Create deployment archive
4. **Deploy**: 
   - Stop existing PM2 process
   - Backup current deployment
   - Copy new files to server
   - Extract and install dependencies
   - Start/restart PM2 process

## Manual Deployment Commands

If you need to deploy manually:

```bash
# On your server
cd ~/apps/digit-frontend

# Stop the application
pm2 stop digit-frontend

# Pull latest changes (if using git)
git pull origin main

# Install dependencies
npm ci --production

# Build the application (if building on server)
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
```

## Monitoring and Logs

### PM2 Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs digit-frontend

# Monitor resources
pm2 monit

# Restart application
pm2 restart digit-frontend

# Stop application
pm2 stop digit-frontend
```

### Log Files

Logs are stored in `~/apps/digit-frontend/logs/`:
- `err.log` - Error logs
- `out.log` - Output logs
- `combined.log` - Combined logs

## Troubleshooting

### Common Issues

1. **SSH Connection Failed**
   - Verify SSH key is correctly added to GitHub secrets
   - Ensure public key is in server's `~/.ssh/authorized_keys`
   - Check server IP and port

2. **Build Failures**
   - Check if all dependencies are properly listed in package.json
   - Verify environment variables are set correctly

3. **PM2 Process Not Starting**
   - Check if serve is installed globally: `npm list -g serve`
   - Verify ecosystem.config.js syntax
   - Check PM2 logs: `pm2 logs`

4. **Port Already in Use**
   - Change port in ecosystem.config.js
   - Kill existing process: `sudo lsof -ti:3000 | xargs kill -9`

### Debugging Steps

1. Check GitHub Actions logs in your repository
2. SSH into your server and check PM2 status
3. Review application logs
4. Test manual deployment steps

## Security Considerations

1. **SSH Keys**: Keep private keys secure and rotate regularly
2. **Environment Variables**: Store sensitive data in GitHub secrets
3. **Server Access**: Limit SSH access and use key-based authentication
4. **Firewall**: Configure proper firewall rules on your server

## Next Steps

1. Set up monitoring and alerting
2. Configure SSL/HTTPS with reverse proxy (nginx)
3. Set up database backups if applicable
4. Implement health checks
5. Consider using Docker for containerization

## Support

If you encounter issues:
1. Check the GitHub Actions logs
2. Review server logs via PM2
3. Verify all secrets are correctly configured
4. Test SSH connection manually
