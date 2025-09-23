#!/bin/bash

# Simple deployment script for Yoraa Backend to Contabo Server
# Server IP: 185.193.19.244

echo "🚀 Deploying Yoraa Backend to Contabo server..."

# Configuration
SERVER_IP="185.193.19.244"
SERVER_USER="root"  # Change this if you use a different user
APP_DIR="/var/www/yoraa-backend"
PM2_APP_NAME="yoraa-api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we can connect to the server
echo "📡 Testing connection to server..."
if ! ssh -o ConnectTimeout=10 $SERVER_USER@$SERVER_IP "echo 'Connection successful'" 2>/dev/null; then
    print_error "Cannot connect to server $SERVER_IP"
    echo "Please ensure:"
    echo "1. Server is running and accessible"
    echo "2. SSH key is properly configured"
    echo "3. IP address is correct: $SERVER_IP"
    echo ""
    echo "To setup SSH key:"
    echo "ssh-copy-id $SERVER_USER@$SERVER_IP"
    exit 1
fi

print_status "Server connection successful!"

# Create deployment directory
echo "📁 Creating application directory..."
ssh $SERVER_USER@$SERVER_IP "mkdir -p $APP_DIR"

# Upload files (excluding node_modules and git)
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
ssh $SERVER_USER@$SERVER_IP << EOF
    set -e  # Exit on any error
    
    cd $APP_DIR
    
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
    
    # Install MongoDB if not present
    if ! command -v mongod &> /dev/null; then
        echo "📦 Installing MongoDB..."
        wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
        echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
        apt-get update
        apt-get install -y mongodb-org
        systemctl start mongod
        systemctl enable mongod
    fi
    
    # Ensure MongoDB is running
    systemctl restart mongod
    
    # Create log directory for PM2
    mkdir -p /var/log/pm2
    
    # Install application dependencies
    echo "📦 Installing application dependencies..."
    npm install --production
    
    # Copy production environment file
    cp .env.production .env
    
    # Stop existing PM2 process if running
    pm2 stop $PM2_APP_NAME 2>/dev/null || true
    pm2 delete $PM2_APP_NAME 2>/dev/null || true
    
    # Start application with PM2 using ecosystem file
    echo "🚀 Starting application with PM2..."
    pm2 start ecosystem.config.js --env production
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 to start on boot
    pm2 startup
    
    # Show PM2 status
    pm2 status
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "🌐 Your API is accessible at: http://$SERVER_IP:8080"
    echo "📊 Monitor with: pm2 monit"
    echo "📋 View logs with: pm2 logs $PM2_APP_NAME"
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
    echo "   pm2 status"
    echo "   pm2 logs $PM2_APP_NAME"
    echo "   pm2 monit"
else
    print_error "Deployment failed!"
    exit 1
fi
