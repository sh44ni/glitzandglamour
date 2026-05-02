#!/bin/bash
# ─────────────────────────────────────────────
# Glitz & Glamour — Auto Deploy to VPS
# Usage: bash deploy.sh
# ─────────────────────────────────────────────

VPS_USER="root"
VPS_HOST="31.97.236.172"
APP_DIR="/var/www/glitz"
PM2_NAME="glitz"

echo ""
echo "✨ Glitz & Glamour — Auto Deploy"
echo "─────────────────────────────────"

# Step 1: Push local changes
echo ""
echo "📦 Pushing latest changes to GitHub..."
git add -A
git commit -m "deploy: $(date '+%Y-%m-%d %H:%M')" 2>/dev/null || echo "   (nothing new to commit)"
git push origin master

# Step 2: SSH into VPS and deploy
echo ""
echo "🚀 Deploying to VPS ($VPS_HOST)..."
echo ""

ssh ${VPS_USER}@${VPS_HOST} << 'DEPLOY'
  set -e
  cd /var/www/glitz

  echo "📥 Pulling latest code..."
  git pull origin master

  echo ""
  echo "📦 Installing dependencies..."
  npm install --production=false

  echo ""
  echo "🔨 Building Next.js app..."
  npm run build

  echo ""
  echo "♻️  Restarting PM2..."
  pm2 restart glitz 2>/dev/null || pm2 start npm --name "glitz" -- start
  pm2 save

  echo ""
  echo "✅ Deploy complete!"
  echo "   App: $(pm2 info glitz 2>/dev/null | grep status || echo 'running')"
DEPLOY

echo ""
echo "─────────────────────────────────"
echo "💎 Deploy finished! Site is live."
echo ""
