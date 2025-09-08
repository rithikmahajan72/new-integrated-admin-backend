#!/bin/bash

# Deployment script for Yoraa Backend on Contabo Server
# Server IP: 185.193.19.244

echo "🚀 Starting deployment to Contabo server..."

# Server configuration
SERVER_IP="185.193.19.244"
SERVER_USER="root"
APP_NAME="yoraa-backend"
APP_DIR="/var/www/$APP_NAME"
PM2_APP_NAME="yoraa-api"
SSH_KEY="$HOME/.ssh/contabo_server"

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ SSH key not found at $SSH_KEY"
    echo "Please run: ssh-keygen -t ed25519 -C 'ritik@gmail.com' -f ~/.ssh/contabo_server"
    echo "Then add the public key to your Contabo server."
    exit 1
fi

# Check if we can connect to the server
echo "📡 Testing connection to server..."
if ! ssh -i "$SSH_KEY" -o ConnectTimeout=10 $SERVER_USER@$SERVER_IP "echo 'Connection successful'"; then
    echo "❌ Cannot connect to server. Please check:"
    echo "1. Server is running"
    echo "2. SSH key is configured"
    echo "3. IP address is correct: $SERVER_IP"
    exit 1
fi

echo "✅ Server connection successful!"

# Install dependencies on server if needed
echo "📦 Installing server dependencies..."
ssh -i "$SSH_KEY" $SERVER_USER@$SERVER_IP << 'EOF'
    # Update system
    apt update && apt upgrade -y
    
    # Install Node.js (if not installed)
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        apt-get install -y nodejs
    fi
    
    # Install PM2 globally (if not installed)
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
    fi
    
    # Install MongoDB (if not installed)
    if ! command -v mongod &> /dev/null; then
        wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
        echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
        apt-get update
        apt-get install -y mongodb-org
        systemctl start mongod
        systemctl enable mongod
    fi
    
    # Create app directory
    mkdir -p /var/www/yoraa-backend
EOF

echo "📁 Creating application directory on server..."

# Sync files to server (excluding node_modules and .env)
echo "📤 Uploading application files..."
rsync -avz -e "ssh -i $SSH_KEY" --exclude 'node_modules' --exclude '.git' --exclude '.env' \
    ./ $SERVER_USER@$SERVER_IP:$APP_DIR/

# Upload environment file separately
echo "🔐 Uploading environment configuration..."
scp -i "$SSH_KEY" .env.production $SERVER_USER@$SERVER_IP:$APP_DIR/.env

# Install dependencies and start application
echo "🔧 Installing dependencies and starting application..."
ssh -i "$SSH_KEY" $SERVER_USER@$SERVER_IP << EOF
    cd $APP_DIR
    
    # Install dependencies
    npm install --production
    
    # Stop existing PM2 process if running
    pm2 stop $PM2_APP_NAME 2>/dev/null || true
    pm2 delete $PM2_APP_NAME 2>/dev/null || true
    
    # Start application with PM2
    pm2 start index.js --name $PM2_APP_NAME
    pm2 save
    pm2 startup
    
    # Show PM2 status
    pm2 status
EOF

echo "🎉 Deployment completed!"
echo "🌐 Your API should be accessible at: http://$SERVER_IP:8080"
echo "📊 To monitor the application: pm2 monit"
echo "📋 To view logs: pm2 logs $PM2_APP_NAME"
