# 🚀 TerraSignal AI — 5-Minute Live Cloud Deployment Guide

This guide walks you through deploying **TerraSignal AI** to a **live public URL** so anyone (including judges and investors) can access it directly from their phones or laptops.

---

## 🌟 Recommended Free Stack
- **Frontend (Next.js 14)**: Hosted on **Vercel** *(100% Free, Global CDN, 2-minute setup)*.
- **Backend (FastAPI & ML Engine)**: Hosted on **Render.com** or **Railway.app** *(100% Free Tier, Auto-Deploy from GitHub)*.

---

## 📋 Step 1: Push Code to GitHub

Open PowerShell in the project directory (`c:\Users\mathiyazhagan\Desktop\LAND`) and run:

```bash
git init
git add .
git commit -m "Initial commit: TerraSignal AI Production Release"

# Create a new repository on GitHub (e.g. github.com/your-username/terrasignal-ai)
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/terrasignal-ai.git
git push -u origin main
```

---

## 🐍 Step 2: Deploy Backend to Render.com (3 Minutes)

1. Go to **[render.com](https://render.com)** and Sign Up / Log In with your GitHub account.
2. Click **"New +"** $\rightarrow$ **"Web Service"**.
3. Connect your GitHub repository: `terrasignal-ai`.
4. Fill in the following settings:
   - **Name**: `terrasignal-backend`
   - **Region**: Singapore or Oregon
   - **Branch**: `main`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
5. In **"Environment Variables"**, add:
   - `PYTHONPATH` = `.`
   - `PYTHON_VERSION` = `3.11.0`
6. Click **"Create Web Service"**.
7. Once deployed, Render gives you a public URL (e.g. `https://terrasignal-backend.onrender.com`).

*(Verify: Open `https://terrasignal-backend.onrender.com/docs` to see the live Swagger API docs!)*

---

## ⚡ Step 3: Deploy Frontend to Vercel (2 Minutes)

1. Go to **[vercel.com](https://vercel.com)** and Sign In with GitHub.
2. Click **"Add New..."** $\rightarrow$ **"Project"**.
3. Select your `terrasignal-ai` repository.
4. Configure the project:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click "Edit" and select **`frontend`**.
5. In **"Environment Variables"**, add:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://terrasignal-backend.onrender.com/api/v1` *(your Render backend URL)*
6. Click **"Deploy"**.
7. In ~60 seconds, your site is live at:  
   👉 **`https://terrasignal-ai.vercel.app`**

---

## 🐳 Alternative: 1-Command Local/VPS Docker Deployment

If you want to run both Frontend and Backend together in Docker containers:

```bash
docker-compose up --build -d
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

---

## ✅ Deployment Checklist

- [x] `Dockerfile` created for Backend containerization.
- [x] `frontend/Dockerfile` created for Frontend containerization.
- [x] `docker-compose.yml` created for multi-container orchestration.
- [x] `render.yaml` created for 1-click Render blueprint deployments.
- [x] Environment variable `NEXT_PUBLIC_API_URL` linked to FastAPI REST API.

---

*TerraSignal AI — Ready for Production Cloud Deployment.*
