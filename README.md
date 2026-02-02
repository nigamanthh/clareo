# 🚀 Complete Deployment Guide - JEE Website

This guide will help you deploy your entire JEE website with all components working.

## Architecture Overview

- **Frontend**: React app + Static HTML pages → Netlify
- **Backend**: Express.js API server → Render.com
- **APIs**: Gemini AI (chatbot) + D-ID (video generation)

---

## 📋 Prerequisites

1. GitHub account (you already have this!)
2. Netlify account (free): https://app.netlify.com/
3. Render account (free): https://render.com/
4. API Keys:
   - Gemini AI: https://aistudio.google.com/app/apikey
   - D-ID: https://studio.d-id.com/

---

## Part 1: Deploy Backend to Render.com

### Step 1.1: Create Web Service on Render

1. Go to https://render.com/ and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select repository: **SNUC-IITKGP**

### Step 1.2: Configure Backend Settings

**Basic Settings:**
- **Name**: `jee-backend` (or any name you prefer)
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: `my-jee-website/server`
- **Runtime**: Node
- **Build Command**: Leave empty or use `npm install` (Render auto-installs)
- **Start Command**: `npm start` or `node index.js`
- **Instance Type**: Free

### Step 1.3: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add these:

| Key | Value | Where to get it |
|-----|-------|-----------------|
| `GEMINI_API_KEY` | Your Gemini API key | https://aistudio.google.com/app/apikey |
| `DID_API_KEY` | Your D-ID API key | https://studio.d-id.com/ → Account → API Key |
| `FRONTEND_URL` | `*` (for now) | Will update after frontend deployment |
| `NODE_VERSION` | `20` | N/A |

### Step 1.4: Deploy Backend

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. **Copy your backend URL**: `https://jee-backend-xxxx.onrender.com`
4. Keep this URL - you'll need it for frontend!

---

## Part 2: Deploy Frontend to Netlify

### Step 2.1: Update Frontend Environment Variable

**IMPORTANT**: Before deploying, update the backend URL:

1. Go to your repository on GitHub
2. Edit `my-jee-website/.env.example`
3. Update `VITE_BACKEND_URL` to your Render backend URL
4. Also update `shared/chatbot.js` line 4 with your backend URL

### Step 2.2: Deploy to Netlify

1. Go to https://app.netlify.com/
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Select repository: **SNUC-IITKGP**
5. Configure build settings:

**Build Settings:**
- **Base directory**: `my-jee-website`
- **Build command**: `npm run build`
- **Publish directory**: `my-jee-website/dist`

### Step 2.3: Add Environment Variables on Netlify

1. Go to **Site settings** → **Environment variables**
2. Click **"Add a variable"**
3. Add this variable:

| Key | Value |
|-----|-------|
| `VITE_BACKEND_URL` | Your Render backend URL (e.g., `https://jee-backend-xxxx.onrender.com`) |

### Step 2.4: Deploy

1. Click **"Deploy site"**
2. Wait for build to complete (2-5 minutes)
3. Your site will be live at: `https://random-name.netlify.app`
4. You can customize the domain name in **Site settings** → **Domain management**

---

## Part 3: Update CORS Settings

### Step 3.1: Update Backend CORS

1. Go back to your Render dashboard
2. Open your backend service
3. Go to **Environment** tab
4. Update `FRONTEND_URL` variable:
   - Old value: `*`
   - New value: Your Netlify URL (e.g., `https://your-site.netlify.app`)
5. Click **"Save Changes"**
6. Service will auto-redeploy

---

## Part 4: Testing Everything

### ✅ Test Checklist

1. **React App Homepage**
   - Visit your Netlify URL
   - Should see "Welcome to JEE Prep"
   - Dr. Neutron chatbot button visible (🤖)

2. **Dr. Neutron Chatbot**
   - Click chatbot button
   - Type a question: "What is Newton's first law?"
   - Should get AI response
   - Try video generation button (🎬)

3. **Static HTML Pages**
   - Visit: `https://your-site.netlify.app/choosegalaxy/choose-galaxy.html`
   - Chatbot should work here too
   - Navigate through galaxy selection → dashboard

4. **Duel Challenge**
   - Visit: `https://your-site.netlify.app/duel-challenge-final/duel-landing.html`
   - Test both modes (Random Opponent / Challenge Friend)

---

## 🐛 Troubleshooting

### Chatbot Not Responding

**Check:**
1. Backend is running on Render (check dashboard)
2. `VITE_BACKEND_URL` is set correctly on Netlify
3. CORS error in browser console? Update `FRONTEND_URL` on Render
4. API keys are correct on Render

**Fix:**
- Redeploy frontend: Netlify → **Deploys** → **Trigger deploy**
- Check Render logs: Render dashboard → **Logs** tab

### Video Generation Not Working

**Check:**
1. D-ID API key is valid (check credits at https://studio.d-id.com/)
2. Backend logs on Render for errors
3. Video generation requires credits on D-ID

### Build Failed on Netlify

**Check:**
1. Build logs on Netlify
2. Make sure `netlify.toml` is in `my-jee-website/` folder
3. Node version compatibility

**Fix:**
- Clear cache and redeploy: **Site settings** → **Build & deploy** → **Clear cache**

---

## 📝 Important Notes

### Free Tier Limitations

**Render.com:**
- Backend sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds (cold start)
- 750 hours/month free

**Netlify:**
- 100GB bandwidth/month
- 300 build minutes/month

### Keeping Backend Awake (Optional)

Use a service like **UptimeRobot** (free) to ping your backend every 5 minutes:
1. Sign up at https://uptimerobot.com/
2. Add monitor: Your Render backend URL
3. Check interval: 5 minutes

### API Costs

- **Gemini AI**: Free tier available (check quotas)
- **D-ID**: Pay-per-video (check pricing)

---

## 🎉 You're Done!

Your complete JEE website is now live with:
- ✅ AI-powered Dr. Neutron chatbot
- ✅ Video generation capabilities
- ✅ Interactive galaxy exploration
- ✅ Duel challenge games
- ✅ All standalone HTML pages

**Your URLs:**
- Frontend: `https://your-site.netlify.app`
- Backend: `https://jee-backend-xxxx.onrender.com`
- GitHub: `https://github.com/Pranesh2k6/SNUC-IITKGP`

---

## 🔄 Future Updates

To update your website:

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```
3. Netlify auto-deploys frontend
4. Render auto-deploys backend

---

Need help? Check:
- Netlify docs: https://docs.netlify.com/
- Render docs: https://render.com/docs/
