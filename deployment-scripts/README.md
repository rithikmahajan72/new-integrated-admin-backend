# Deployment Scripts and Configuration Files

This folder contains all deployment scripts, configuration templates, and testing utilities for the Yoraa Clothing Shop backend.

## Environment Configuration Files

- **`.env.example`** - Template environment file with all required environment variables
- **`.env.production`** - Production environment configuration template

## Deployment Scripts

- **`deploy.sh`** - Main deployment script for the application
- **`deploy-simple.sh`** - Simplified deployment script with basic functionality
- **`deploy-fixed.sh`** - Fixed version of deployment script with bug fixes
- **`deploy-to-contabo.sh`** - Specific deployment script for Contabo server
- **`server-setup.sh`** - Initial server setup and configuration script

## Firebase Deployment

- **`deploy-firestore-rules.sh`** - Script to deploy Firestore security rules

## Database and Category Management

- **`create-subcategory.sh`** - Script to create product subcategories in the database

## Testing Scripts

- **`test-api.sh`** - API endpoint testing script
- **`test-bundling-api.sh`** - Script to test product bundling API endpoints

## Usage Instructions

### Before Deployment
1. Copy `.env.example` to `.env` and fill in your environment variables
2. Ensure all required services (MongoDB, Firebase, AWS S3) are configured
3. Run `server-setup.sh` for initial server configuration

### Deployment Process
1. For development: Use `deploy-simple.sh`
2. For production: Use `deploy.sh` or `deploy-to-contabo.sh`
3. Deploy Firebase rules: `./deploy-firestore-rules.sh`

### Testing
1. Run API tests: `./test-api.sh`
2. Test bundling functionality: `./test-bundling-api.sh`

## Notes
- Make sure all scripts have execute permissions: `chmod +x *.sh`
- Review and customize environment variables before deployment
- Test deployments in a staging environment first
- Keep backups of production configurations

## File Permissions
Remember to set execute permissions on shell scripts:
```bash
chmod +x *.sh
```

## Environment Variables
Before running any deployment script, ensure your environment file contains:
- Database connection strings
- Firebase configuration
- AWS S3 credentials
- API keys and secrets
- Server configuration parameters
