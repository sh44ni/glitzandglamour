# Glitz & Glamour Studio - Hosting Requirements

## 📋 Overview

This project consists of two separate applications:
1. **Frontend**: Next.js website (React)
2. **Admin Panel**: Python Flask application

Both can be hosted separately on different providers.

---

## 🖥️ Minimum Requirements

### Frontend (Next.js)

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| RAM | 256 MB | 512 MB |
| CPU | 0.5 vCPU | 1 vCPU |
| Storage | 500 MB | 1 GB |
| Node.js | 18.x | 20.x LTS |

### Admin Panel (Flask)

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| RAM | 128 MB | 256 MB |
| CPU | 0.25 vCPU | 0.5 vCPU |
| Storage | 100 MB + gallery images | 500 MB |
| Python | 3.10 | 3.11+ |

---

## 🌐 Recommended Hosting Providers

### Frontend (Next.js)

| Provider | Free Tier | Paid Tier | Best For |
|----------|-----------|-----------|----------|
| **Vercel** ⭐ | Yes | $20/mo | Best Next.js experience |
| **Netlify** | Yes | $19/mo | Easy deployment |
| **Railway** | $5 free | $5/mo | Full stack |
| **Render** | Yes | $7/mo | Good free tier |

**Recommended: Vercel** - Native Next.js support, automatic deployments, edge network.

### Admin Panel (Flask)

| Provider | Free Tier | Paid Tier | Best For |
|----------|-----------|-----------|----------|
| **Render** ⭐ | Yes (sleeps) | $7/mo | Easy Python hosting |
| **Railway** | $5 free | $5/mo | Always-on |
| **PythonAnywhere** | Yes | $5/mo | Python-specific |
| **Fly.io** | Yes | Pay-as-you-go | Global edge |

**Recommended: Render** - Free tier available, easy deployment, persistent storage.

---

## 🚀 Deployment Steps

### Deploy Frontend to Vercel

1. Push code to GitHub (already done ✅)
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project" and select your repo
4. Set environment variables:
   ```
   NEXT_PUBLIC_ADMIN_URL=https://your-admin-app.onrender.com
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   ```
5. Click "Deploy"

### Deploy Admin to Render

1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repo
4. Set:
   - **Root Directory**: `admin`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
5. Add environment variables:
   ```
   SECRET_KEY=your-random-secret-key
   ADMIN_EMAIL=your@email.com
   ADMIN_PASSWORD=your-secure-password
   ```
6. Click "Create Web Service"

---

## 💰 Cost Estimate

### Free Tier (Development/Low Traffic)

| Component | Provider | Cost |
|-----------|----------|------|
| Frontend | Vercel (Free) | $0 |
| Admin | Render (Free) | $0 |
| Domain | - | ~$12/year |
| **Total** | | **~$1/month** |

### Production (Recommended)

| Component | Provider | Cost |
|-----------|----------|------|
| Frontend | Vercel Pro | $20/mo |
| Admin | Render Starter | $7/mo |
| Domain | Custom | ~$12/year |
| Email (Resend) | Free tier | $0 |
| **Total** | | **~$28/month** |

### Budget Option (Always-On)

| Component | Provider | Cost |
|-----------|----------|------|
| Frontend | Vercel (Free) | $0 |
| Admin | Railway | $5/mo |
| Domain | Custom | ~$12/year |
| **Total** | | **~$6/month** |

---

## 🔒 Security Checklist

Before going live:

- [ ] Change default admin password
- [ ] Generate secure `SECRET_KEY`
- [ ] Set up HTTPS (automatic on most providers)
- [ ] Configure CORS for production domain only
- [ ] Remove debug mode in Flask (`debug=False`)
- [ ] Set up proper backup for SQLite database
- [ ] Consider upgrading to PostgreSQL for production

---

## 📧 Email Setup (via Pingram)

Transactional email (bookings, verification, reviews, contracts) is sent through the same Pingram plan used for SMS. No separate email provider is needed.

1. Verify `glitzandglamours.com` under Pingram → Domains (SPF + DKIM must show green).
2. Add sender identity to `.env`:
   ```
   PINGRAM_FROM_EMAIL=info@glitzandglamours.com
   PINGRAM_FROM_NAME=Glitz & Glamour
   ```
3. The existing `PINGRAM_API_KEY` is reused — no extra key required.
4. Test delivery from Admin → Notifications → Diagnostics → Email tab.

> **Note:** `RESEND_API_KEY_SECONDARY` is still required only for the standalone pakvisa noreply tool (`/api/noremail`). It is unrelated to studio transactional email.

---

## 📊 Expected Traffic Capacity

| Plan | Concurrent Users | Monthly Visits |
|------|------------------|----------------|
| Free Tier | 5-10 | 1,000-5,000 |
| Budget | 20-50 | 10,000-50,000 |
| Production | 100+ | 100,000+ |

For a local nail salon, the **Free Tier** should handle typical traffic easily.
