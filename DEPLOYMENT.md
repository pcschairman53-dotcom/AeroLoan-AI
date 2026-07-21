# CrediShield AI - Production Deployment & Integration Guide

This guide details the steps required to deploy the CrediShield AI Credit Underwriting Portal to production. 

---

## Architecture Overview

1. **Frontend (Client-Side SPA)**: Built with React, TypeScript, and Tailwind CSS. Packaged using Vite and optimized with lazy-loading chunk splitting. Hosted on **Vercel** or any static host.
2. **Backend Service**: FastAPI (Python) or Express (Node.js) credit prediction engine. Exposes the `/predict` POST endpoint for real-time risk assessment scoring. Hosted on **Render** (or similar PaaS).

---

## Required Environment Variables

Configure these in your respective deployment dashboards. Never commit actual secrets or production keys to source control.

| Service | Environment Variable | Purpose / Description | Example Value |
| :--- | :--- | :--- | :--- |
| **Frontend** (Vercel) | `VITE_API_BASE_URL` | The secure, absolute URL where your backend service is deployed. Do not include trailing slashes. | `https://credishield-api.onrender.com` |
| **Backend** (Render) | `PORT` | Dynamic port exposed by Render. Render injects this automatically. | `8000` or `10000` |
| **Backend** (Render) | `GEMINI_API_KEY` | Required if your backend uses Gemini AI for supplementary rationale. | *(Secret API key from Google AI Studio)* |

---

## Local Development vs. Production Commands

### Local Development Setup
Run these commands to build, test, or review the application locally:

```bash
# 1. Install dependencies
npm install

# 2. Start the Vite development server (bound on http://localhost:3000)
npm run dev

# 3. Perform TypeScript and strict static typing checks
npm run lint

# 4. Compile a local production build
npm run build
```

---

## 1. Frontend Deployment (Vercel)

Vercel detects the Vite project structure automatically and builds the application optimized for global CDN distribution.

### Step-by-Step Vercel Setup:
1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **Add New** > **Project** and link your Git repository.
3. Configure the **Build & Development Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (Root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://YOUR_BACKEND_SERVICE_URL` *(Replace with your deployed Render service URL)*
5. Click **Deploy**.
6. Vercel utilizes the preconfigured `/vercel.json` rewrite rules to prevent 404 errors when reloading subroutes (e.g., `/dashboard`, `/analytics`).

---

## 2. Backend Deployment (Render)

Render automatically compiles and hosts web service backends with auto-scaling and zero-downtime rollouts.

### Step-by-Step Render Setup:
1. Log into your [Render Dashboard](https://render.com).
2. Click **New +** > **Web Service**.
3. Connect your backend service Git repository.
4. Configure the **Service Settings**:
   - **Name**: `credishield-api`
   - **Environment**: `Python` or `Node` (depending on your backend language)
   - **Branch**: `main`
   - **Build Command**: `pip install -r requirements.txt` *(FastAPI)* or `npm install` *(Express)*
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT` *(FastAPI)* or `node dist/server.cjs` *(Express)*
5. Scroll down to **Advanced** > **Environment Variables** and add:
   - `GEMINI_API_KEY`: *(Your Google GenAI token)*
6. Click **Create Web Service**.

---

## Security & Performance Verification

Before public release, verify that the following optimization criteria are met:

- [x] **No Exposed API Keys**: Sensitive keys like `GEMINI_API_KEY` are isolated inside backend-only containers.
- [x] **Code Splitting Active**: Heavy rendering assets (e.g., `recharts` for charting, `motion` for layout transitions) are isolated in separate asynchronous bundles.
- [x] **Graceful Network Fallbacks**: The frontend `apiInstance` incorporates a 10,000ms timeout window and displays beautiful, detailed local fallback alerts if the backend goes offline.
- [x] **SEO Optimized**: Meta tags, Open Graph tags, and inline vector favicons are compiled directly into the HTML index head.
