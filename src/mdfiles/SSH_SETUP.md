# SSH Key Setup for Contabo Server

## 🔑 SSH Key Information

### Your Current SSH Keys:

**New Key Generated (recommended to use):**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBP4KG2Ry8asmhAyDYjA11EU/qkA1Cr7FKJRq/I7ezeh ritik@gmail.com
```

**Previously Provided Key:**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILl5Mst4SDKaFf+CFoUcrhRzO0HGbaHTK8XzVfxZRstg ritik@gmail.com
```

## 📋 Steps to Add SSH Key to Contabo Server

### Option 1: Through Contabo Control Panel

1. **Log into Contabo Control Panel**
   - Go to https://contabo.com/
   - Log into your account

2. **Navigate to Your Server**
   - Find your server (vmi2789364)
   - Click on the server details

3. **Add SSH Key**
   - Look for "SSH Keys" or "Security" section
   - Click "Add SSH Key"
   - Name: "Ritik's SSH Key"
   - Paste the public key (use the new one generated above)

4. **Apply to Server**
   - Save the SSH key
   - Apply it to your server instance

### Option 2: Through VNC/Console Access

1. **Access Server Console**
   - Use VNC/Console from Contabo panel
   - Log in as root

2. **Add SSH Key Manually**
   ```bash
   # Create .ssh directory if it doesn't exist
   mkdir -p ~/.ssh
   chmod 700 ~/.ssh
   
   # Add your public key to authorized_keys
   echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBP4KG2Ry8asmhAyDYjA11EU/qkA1Cr7FKJRq/I7ezeh ritik@gmail.com" >> ~/.ssh/authorized_keys
   
   # Set proper permissions
   chmod 600 ~/.ssh/authorized_keys
   
   # Ensure SSH service is running
   systemctl enable ssh
   systemctl start ssh
   ```

3. **Test SSH Connection**
   ```bash
   # From your local machine
   ssh -i ~/.ssh/contabo_server root@185.199.219.244
   ```

## 🚀 Once SSH is Working

After successfully adding the SSH key and establishing connection, you can proceed with deployment:

### Test Connection
```bash
ssh -i ~/.ssh/contabo_server root@185.199.219.244 "echo 'SSH connection successful!'"
```

### Deploy Application
```bash
# Update deploy script to use the SSH key
./deploy.sh
```

## 📝 Deployment Script Update

I'll update the deployment script to use your SSH key:

```bash
# Use specific SSH key for connection
SSH_KEY="~/.ssh/contabo_server"
ssh -i $SSH_KEY root@185.199.219.244 "command"
scp -i $SSH_KEY file root@185.199.219.244:/path/
rsync -avz -e "ssh -i $SSH_KEY" source/ root@185.199.219.244:/destination/
```

## ⚠️ Important Notes

1. **Private Key Security**: Never share your private key (~/.ssh/contabo_server)
2. **Public Key**: Only the public key (.pub) should be added to the server
3. **Permissions**: SSH keys need specific permissions (600 for private, 644 for public)
4. **Backup**: Keep a backup of your SSH keys in a secure location

## 🔧 Troubleshooting

If SSH still doesn't work after adding the key:

1. **Check SSH service on server**
2. **Verify firewall allows port 22**
3. **Ensure key permissions are correct**
4. **Try different SSH ports (2222, 22022)**

Let me know once you've added the SSH key to your server, and I'll help you proceed with the deployment!
