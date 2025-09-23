#!/bin/bash

# Quick Server Setup Script for Ubuntu/Debian
# Run this script on your Contabo server after SSH access is established

echo "🚀 Setting up Yoraa Backend Server..."

# Update system packages
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 18.x
echo "📦 Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2 globally
echo "📦 Installing PM2..."
npm install -g pm2

# Install MongoDB
echo "📦 Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt-get update
apt-get install -y mongodb-org

# Start and enable MongoDB
systemctl start mongod
systemctl enable mongod

# Install Nginx (optional - for reverse proxy)
echo "📦 Installing Nginx..."
apt-get install -y nginx

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /var/www/yoraa-backend
chown -R www-data:www-data /var/www/yoraa-backend

# Configure firewall
echo "🔥 Configuring firewall..."
ufw allow 22
ufw allow 8080
ufw allow 80
ufw allow 443
ufw --force enable

# Create systemd service for the app (alternative to PM2)
cat > /etc/systemd/system/yoraa-backend.service << EOF
[Unit]
Description=Yoraa Backend API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/yoraa-backend
ExecStart=/usr/bin/node index.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=8080

[Install]
WantedBy=multi-user.target
EOF

# Create nginx configuration (optional)
cat > /etc/nginx/sites-available/yoraa-backend << EOF
server {
    listen 80;
    server_name 185.199.219.244;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable nginx site (optional)
# ln -s /etc/nginx/sites-available/yoraa-backend /etc/nginx/sites-enabled/
# systemctl restart nginx

echo "✅ Server setup completed!"
echo "📝 Next steps:"
echo "1. Upload your application files to /var/www/yoraa-backend"
echo "2. Install dependencies: cd /var/www/yoraa-backend && npm install"
echo "3. Copy environment file: cp .env.production .env"
echo "4. Start with PM2: pm2 start ecosystem.config.js --env production"
echo "5. Or start with systemd: systemctl start yoraa-backend"
echo ""
echo "🌐 Your API will be accessible at:"
echo "   Direct: http://185.199.219.244:8080"
echo "   Via Nginx: http://185.199.219.244 (if enabled)"
