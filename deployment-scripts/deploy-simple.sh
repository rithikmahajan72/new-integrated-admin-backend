#!/bin/bash

# Simplified deployment script for Yoraa Backend to Contabo Server
# Server IP: 185.193.19.244

echo "🚀 Deploying Yoraa Backend to Contabo server..."

SERVER_IP="185.193.19.244"
SERVER_USER="root"
APP_DIR="/var/www/yoraa-backend"

# Upload files
echo "📤 Uploading application files..."
rsync -avz --progress \
    --exclude 'node_modules/' \
    --exclude '.git/' \
    --exclude '*.log' \
    --exclude '.DS_Store' \
    ./ $SERVER_USER@$SERVER_IP:$APP_DIR/

echo "✅ Files uploaded successfully!"

# Configure and start application
echo "🔧 Configuring and starting application..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
    cd /var/www/yoraa-backend
    
    # Ensure MongoDB is running
    if ! docker ps | grep -q mongodb; then
        echo "🗄️ Starting MongoDB container..."
        docker run -d \
            --name mongodb \
            --restart unless-stopped \
            -p 27017:27017 \
            -v /data/db:/data/db \
            mongo:6.0 2>/dev/null || docker start mongodb
        sleep 5
    fi
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    npm install --production
    
    # Copy environment file
    cp .env.production .env
    
    # Stop existing PM2 process
    pm2 stop yoraa-api 2>/dev/null || true
    pm2 delete yoraa-api 2>/dev/null || true
    
    # Start with PM2
    echo "🚀 Starting application..."
    NODE_ENV=production pm2 start ecosystem.config.js --env production
    pm2 save
    
    # Show status
    pm2 status
    
    echo ""
    echo "🎉 Deployment successful!"
    echo "🌐 API URL: http://185.193.19.244:8080"
EOF

echo ""
echo "✅ Deployment completed!"
echo "🌐 Your API is running at: http://$SERVER_IP:8080"
