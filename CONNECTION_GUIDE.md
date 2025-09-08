# Server Connection and Deployment Instructions

## ⚠️ Important: SSH Connection Issue

The direct SSH connection to `185.199.219.244` is currently timing out. This could be due to:

1. **Firewall restrictions** - SSH port (22) might be blocked
2. **SSH running on different port** - Some servers use custom SSH ports
3. **Server not fully configured** - The server might still be setting up
4. **Network connectivity** - There might be routing issues

## 🔧 Troubleshooting Steps

### Step 1: Check Server Status in Contabo Panel
1. Log into your Contabo control panel
2. Verify the server is **Running** (green status)
3. Check if SSH is enabled
4. Look for any custom SSH port configuration

### Step 2: Alternative Connection Methods

#### Option A: Custom SSH Port
Try connecting on different ports:
```bash
ssh -p 2222 root@185.199.219.244
ssh -p 2200 root@185.199.219.244
ssh -p 22022 root@185.199.219.244
```

#### Option B: VNC/Console Access
1. Use Contabo's web console/VNC from the control panel
2. This provides direct terminal access without SSH

#### Option C: Check SSH Service
Once you have console access, check SSH status:
```bash
systemctl status ssh
systemctl status sshd
```

If SSH is not running:
```bash
systemctl start ssh
systemctl enable ssh
```

### Step 3: Configure SSH (if needed)
Edit SSH configuration:
```bash
nano /etc/ssh/sshd_config
```

Ensure these settings:
```
Port 22
PermitRootLogin yes
PasswordAuthentication yes
```

Restart SSH:
```bash
systemctl restart ssh
```

### Step 4: Configure Firewall
Allow SSH and API ports:
```bash
ufw allow 22
ufw allow 8080
ufw status
```

## 🚀 Deployment Options

### Option 1: Manual Upload via Web Interface
1. Use Contabo's file manager (if available)
2. Upload the `yoraa-backend-deployment.tar.gz` file
3. Extract: `tar -xzf yoraa-backend-deployment.tar.gz`

### Option 2: Git Clone (Recommended)
Once you have server access:
```bash
cd /var/www
git clone https://github.com/Pushkar9829/eCommerceBckend.git yoraa-backend
cd yoraa-backend
```

### Option 3: SCP Upload (once SSH works)
```bash
scp yoraa-backend-deployment.tar.gz root@185.199.219.244:/tmp/
```

## 📋 Deployment Checklist

Once you have server access, follow these steps:

### 1. Run Server Setup
```bash
chmod +x server-setup.sh
./server-setup.sh
```

### 2. Deploy Application
```bash
cd /var/www/yoraa-backend
npm install --production
cp .env.production .env
```

### 3. Start Application
Using PM2:
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

Or using systemd:
```bash
systemctl start yoraa-backend
systemctl enable yoraa-backend
```

### 4. Verify Deployment
```bash
curl http://localhost:8080
curl http://localhost:8080/health
pm2 status
```

## 🌐 Access Your API

Once deployed, your API will be available at:
- **Direct**: `http://185.199.219.244:8080`
- **Health Check**: `http://185.199.219.244:8080/health`
- **API Base**: `http://185.199.219.244:8080/api`

## 📞 Next Steps

1. **Contact Contabo Support** if SSH issues persist
2. **Use VNC/Console** from Contabo panel for initial setup
3. **Check network security groups** in Contabo settings
4. **Verify server specifications** match your requirements

## 📁 Files Created for Deployment

- ✅ `deploy.sh` - Automated deployment script
- ✅ `server-setup.sh` - Server initialization script
- ✅ `ecosystem.config.js` - PM2 configuration
- ✅ `.env.production` - Production environment variables
- ✅ `DEPLOYMENT.md` - Detailed deployment guide
- ✅ Health check endpoints added to `index.js`

## 🆘 Support

If you continue having connection issues:
1. Check Contabo control panel for server status
2. Try VNC/console access first
3. Verify firewall settings in Contabo
4. Contact Contabo support for SSH troubleshooting

The deployment package is ready - you just need to establish server access first!
