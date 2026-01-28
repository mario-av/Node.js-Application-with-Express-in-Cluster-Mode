#!/bin/bash

# 1. Update package list
echo "[1/9] Updating system package list..."
apt-get update -qq > /dev/null 2>&1
echo "      [OK]"

# 2. Install system dependencies
echo "[2/9] Installing Nginx, Git and Curl..."
apt-get install -y nginx git curl -qq > /dev/null 2>&1
echo "      [OK]"

# 3. Install Node.js LTS version
echo "[3/9] Installing Node.js LTS..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - > /dev/null 2>&1
apt-get install -y nodejs -qq > /dev/null 2>&1
echo "      [OK]"

# 4. Install global tools loadtest and PM2
echo "[4/9] Installing loadtest and PM2 globally..."
npm install -g loadtest pm2 > /dev/null 2>&1
echo "      [OK]"

# 5. Create application directory
echo "[5/9] Creating application directory structure..."
mkdir -p /var/www/app
rm -rf /var/www/app/*
echo "      [OK]"

# 6. Copy application code from shared folder
echo "[6/9] Copying application code..."
cp /vagrant/app_mav.js /var/www/app/
cp /vagrant/app-cluster_mav.js /var/www/app/
cp /vagrant/package.json /var/www/app/
cp /vagrant/ecosystem.config.js /var/www/app/
echo "      [OK]"

# 7. Install application dependencies
echo "[7/9] Installing App Dependencies..."
cd /var/www/app
npm install > /dev/null 2>&1
echo "      [OK]"

# 8. Configure Nginx reverse proxy
echo "[8/9] Configuring Nginx reverse proxy..."
rm -f /etc/nginx/sites-enabled/default
cp /vagrant/config/app.conf /etc/nginx/sites-available/
ln -sf /etc/nginx/sites-available/app.conf /etc/nginx/sites-enabled/
systemctl restart nginx
echo "      [OK]"

# 9. Deployment complete
echo "[9/9] Deployment completed successfully"
echo "      [OK]"
echo ""
echo "=== INSTRUCTIONS ==="
echo "To start the app WITHOUT cluster:  cd /var/www/app && node app_mav.js"
echo "To start the app WITH cluster:     cd /var/www/app && node app-cluster_mav.js"
echo "To start with PM2:                 cd /var/www/app && pm2 start ecosystem.config.js"
echo "To run load tests:                 loadtest http://localhost:3000/api/500000 -n 1000 -c 100"
