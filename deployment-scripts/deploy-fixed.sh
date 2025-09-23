#!/bin/bash

# Fixed deployment script for Yoraa Backend to Contabo Server
# Server IP: 185.193.19.244

echo "🚀 Deploying Yoraa Backend to Contabo server..."

# Configuration
SERVER_IP="185.193.19.244"
SERVER_USER="root"
APP_DIR="/var/www/yoraa-backend"
PM2_APP_NAME="yoraa-api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Test connection
echo "📡 Testing connection to server..."
if ! ssh -o ConnectTimeout=10 $SERVER_USER@$SERVER_IP "echo 'Connection successful'" 2>/dev/null; then
    print_error "Cannot connect to server $SERVER_IP"
    exit 1
fi

print_status "Server connection successful!"

# Create deployment directory
echo "📁 Creating application directory..."
ssh $SERVER_USER@$SERVER_IP "mkdir -p $APP_DIR"

# Upload files
echo "📤 Uploading application files..."
rsync -avz --progress \
    --exclude 'node_modules/' \
    --exclude '.git/' \
    --exclude '*.log' \
    --exclude '.DS_Store' \
    ./ $SERVER_USER@$SERVER_IP:$APP_DIR/

print_status "Files uploaded successfully!"

# Install dependencies and start application
echo "🔧 Installing dependencies and configuring server..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
    set -e
    
    cd /var/www/yoraa-backend
    
    # Update system packages
    echo "📦 Updating system packages..."
    apt update
    
    # Install Node.js if not present
    if ! command -v node &> /dev/null; then
        echo "📦 Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    fi
    
    # Install PM2 if not present
    if ! command -v pm2 &> /dev/null; then
        echo "📦 Installing PM2..."
        npm install -g pm2
    fi
    
    # Install MongoDB using Docker instead (avoids dependency issues)
    if ! docker ps -a | grep -q mongodb; then
        echo "📦 Installing MongoDB via Docker..."
        apt-get install -y docker.io docker-compose
        systemctl start docker
        systemctl enable docker
        
        # Run MongoDB in Docker
        docker run -d \
            --name mongodb \
            --restart unless-stopped \
            -p 27017:27017 \
            -v /data/db:/data/db \
            mongo:6.0
        
        # Wait for MongoDB to start
        sleep 10
    else
        echo "📦 MongoDB container already exists, starting it..."
        docker start mongodb || true
    fi
    
    # Create log directory for PM2
    mkdir -p /var/log/pm2
    
    # Install application dependencies
    echo "📦 Installing application dependencies..."
    npm install --production
    
    # Copy production environment file
    cp .env.production .env
    
    # Stop existing PM2 process if running
    pm2 stop yoraa-api 2>/dev/null || true
    pm2 delete yoraa-api 2>/dev/null || true
    
    # Start application with PM2 using ecosystem file
    echo "🚀 Starting application with PM2..."
    NODE_ENV=production pm2 start ecosystem.config.js --env production
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 to start on boot
    pm2 startup systemd -u root --hp /root
    
    # Show PM2 status
    pm2 status
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "🌐 Your API is accessible at: http://185.193.19.244:8080"
    echo "📊 Monitor with: pm2 monit"
    echo "📋 View logs with: pm2 logs yoraa-api"
EOF

if [ $? -eq 0 ]; then
    print_status "Deployment completed successfully!"
    echo ""
    echo "🌐 Your Yoraa Backend API is now running at:"
    echo "   http://$SERVER_IP:8080"
    echo ""
    echo "🔍 Quick test:"
    echo "   curl http://$SERVER_IP:8080/"
    echo ""
    echo "📊 Monitoring commands:"
    echo "   ssh $SERVER_USER@$SERVER_IP 'pm2 status'"
    echo "   ssh $SERVER_USER@$SERVER_IP 'pm2 logs yoraa-api'"
    echo "   ssh $SERVER_USER@$SERVER_IP 'pm2 monit'"
else
    print_error "Deployment failed!"
    exit 1
fi
