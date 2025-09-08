# Yoraa Backend Deployment Guide

## Server Information
- **Server IP**: 185.199.219.244
- **OS**: Linux (Ubuntu/Debian based)
- **Node.js Version**: 18.x
- **Port**: 8080

## Prerequisites

1. **SSH Access**: Ensure you have SSH access to the server
2. **Server Setup**: The server should have Node.js, npm, and MongoDB installed

## Deployment Options

### Option 1: Automated Deployment (Recommended)

Run the automated deployment script:

```bash
./deploy.sh
```

### Option 2: Manual Deployment

1. **Connect to server**:
   ```bash
   ssh root@185.199.219.244
   ```

2. **Install dependencies on server** (if not already installed):
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18.x
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 globally
   sudo npm install -g pm2
   
   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

3. **Create application directory**:
   ```bash
   mkdir -p /var/www/yoraa-backend
   ```

4. **Upload files to server**:
   ```bash
   # From your local machine
   rsync -avz --exclude 'node_modules' --exclude '.git' ./ root@185.199.219.244:/var/www/yoraa-backend/
   scp .env.production root@185.199.219.244:/var/www/yoraa-backend/.env
   ```

5. **Install dependencies and start application**:
   ```bash
   # On the server
   cd /var/www/yoraa-backend
   npm install --production
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

## Post-Deployment

1. **Check application status**:
   ```bash
   pm2 status
   pm2 logs yoraa-api
   ```

2. **Test the API**:
   ```bash
   curl http://185.199.219.244:8080
   ```

3. **Configure firewall** (if needed):
   ```bash
   sudo ufw allow 8080
   sudo ufw allow 22
   sudo ufw enable
   ```

## API Endpoints

Your API will be accessible at: `http://185.199.219.244:8080`

Example endpoints:
- `GET http://185.199.219.244:8080/api/auth/status`
- `POST http://185.199.219.244:8080/api/auth/login`
- `GET http://185.199.219.244:8080/api/items`

## Monitoring and Maintenance

- **View logs**: `pm2 logs yoraa-api`
- **Restart app**: `pm2 restart yoraa-api`
- **Stop app**: `pm2 stop yoraa-api`
- **Monitor resources**: `pm2 monit`

## Troubleshooting

1. **Port already in use**:
   ```bash
   sudo lsof -i :8080
   sudo kill -9 <PID>
   ```

2. **MongoDB not running**:
   ```bash
   sudo systemctl start mongod
   sudo systemctl status mongod
   ```

3. **Check Node.js version**:
   ```bash
   node --version
   npm --version
   ```

## Environment Variables

The application uses the following environment variables (configured in .env.production):
- MongoDB connection string
- AWS S3 credentials for Contabo Object Storage
- Razorpay payment gateway credentials
- Firebase configuration
- JWT secret keys

## Security Considerations

1. **Firewall**: Only allow necessary ports (22 for SSH, 8080 for API)
2. **SSL/TLS**: Consider adding a reverse proxy (Nginx) with SSL certificate
3. **Environment Variables**: Ensure sensitive data is properly secured
4. **Regular Updates**: Keep system and dependencies updated

## Backup Strategy

1. **Database**: Regular MongoDB backups
2. **Application Files**: Version control with Git
3. **Environment Configuration**: Secure backup of .env files
