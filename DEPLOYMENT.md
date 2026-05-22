# TaskMate — Deployment Guide

Deploy TaskMate for free using:
- **Neon** — free PostgreSQL database
- **Render** — free backend hosting (FastAPI + WebSockets)
- **Netlify** — free frontend hosting (Next.js)

Total cost: **$0**

---

## Overview

```
Browser → Netlify (Next.js frontend)
             ↓ REST + WebSocket
          Render (FastAPI backend)
             ↓ SQL
           Neon (PostgreSQL)
```

---

## Step 1 — Push your code to GitHub

Everything must be on GitHub before deploying.

```bash
cd taskmate

git init
git add .
git commit -m "feat: initial TaskMate setup"

# Create a repo on github.com then:
git remote add origin https://github.com/YOUR_USERNAME/TaskMate.git
git branch -M main
git push -u origin main
```

---

## Step 2 — Set up the database on Neon (free)

1. Go to [neon.tech](https://neon.tech) and sign up (free, no credit card).
2. Click **New Project** → name it `taskmate` → click **Create Project**.
3. On the dashboard, find the **Connection string** — it looks like:
   ```
   postgresql://alex:password@ep-cool-name.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Copy it. You'll need it in the next step.

> Neon's free tier gives you 512 MB storage and 10 hours of compute per month — plenty for a student project.

---

## Step 3 — Deploy the backend on Render (free)

### 3a. Create the Web Service

1. Go to [render.com](https://render.com) and sign up with your GitHub account.
2. Click **New +** → **Web Service**.
3. Connect your GitHub repo (`TaskMate`).
4. Fill in the settings:

| Setting | Value |
|---|---|
| **Name** | `taskmate-backend` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `alembic upgrade head && uvicorn app.main:socket_app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | `Free` |

### 3b. Add environment variables

In the Render dashboard, go to **Environment** and add these:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string from Step 2 |
| `SECRET_KEY` | A long random string (generate one below) |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` |
| `ALLOWED_ORIGINS` | `https://your-app.netlify.app` *(update after Step 4)* |
| `PYTHON_VERSION` | `3.11.0` |

**Generate a SECRET_KEY** — run this in your terminal:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 3c. Deploy

Click **Create Web Service**. Render will build and deploy automatically.

After a few minutes, your backend will be live at:
```
https://taskmate-backend.onrender.com
```

Test it: open `https://taskmate-backend.onrender.com/docs` — you should see the FastAPI Swagger UI.

> **Note:** On Render's free tier, the service sleeps after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to wake up. This is normal.

---

## Step 4 — Deploy the frontend on Netlify (free)

### 4a. Add a netlify.toml to your frontend

Create this file at `frontend/netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

Then install the Netlify Next.js plugin in `frontend/package.json` — add to devDependencies:
```json
"@netlify/plugin-nextjs": "^5.3.3"
```

Commit and push:
```bash
git add frontend/netlify.toml frontend/package.json
git commit -m "chore: add netlify config"
git push
```

### 4b. Deploy on Netlify

1. Go to [netlify.com](https://netlify.com) and sign up with GitHub.
2. Click **Add new site** → **Import an existing project** → choose your GitHub repo.
3. Fill in the settings:

| Setting | Value |
|---|---|
| **Base directory** | `frontend` |
| **Build command** | `npm run build` |
| **Publish directory** | `frontend/.next` |

### 4c. Add environment variables

In Netlify, go to **Site configuration** → **Environment variables** → **Add a variable**:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://taskmate-backend.onrender.com` |
| `NEXT_PUBLIC_SOCKET_URL` | `https://taskmate-backend.onrender.com` |

### 4d. Deploy

Click **Deploy site**. After a minute or two, your frontend is live at:
```
https://random-name-123.netlify.app
```

You can rename it under **Site configuration** → **Site details** → **Change site name** to get something like `taskmate-app.netlify.app`.

---

## Step 5 — Connect frontend and backend

Now that you have both URLs, update the backend's CORS setting:

1. Go to your Render backend dashboard.
2. Go to **Environment** → edit `ALLOWED_ORIGINS`:
   ```
   https://taskmate-app.netlify.app
   ```
3. Render will automatically redeploy.

---

## Step 6 — Verify everything works

Go through this checklist:

- [ ] Open `https://taskmate-app.netlify.app/register` — create an account
- [ ] Log in — you should be redirected to the dashboard
- [ ] Create a team
- [ ] Create a task and move it through statuses
- [ ] Open two browser tabs and test the chat (real-time messages)
- [ ] Upload a file
- [ ] Check the activity feed on the dashboard

---

## Custom Domain (optional, free)

Both Netlify and Render support custom domains at no extra cost.

**Netlify:**
1. Go to **Domain management** → **Add a domain**.
2. Add your domain (e.g. `taskmate.yourdomain.com`).
3. Add a CNAME record pointing to your Netlify URL in your DNS provider.

**Render:**
1. Go to your web service → **Settings** → **Custom Domains**.
2. Add your domain and follow the DNS instructions.

---

## Redeployment

Every time you push to `main`, both Netlify and Render will **automatically redeploy**. No manual steps needed.

```bash
# Make changes, then:
git add .
git commit -m "feat: your change"
git push origin main
# → Netlify and Render pick it up automatically
```

---

## Troubleshooting

### Backend won't start on Render
- Check the **Logs** tab in your Render dashboard.
- Make sure `DATABASE_URL` is set and includes `?sslmode=require` (Neon requires SSL).
- Make sure `PYTHON_VERSION` is set to `3.11.0`.

### Frontend shows "Failed to fetch" errors
- Make sure `NEXT_PUBLIC_API_URL` in Netlify points to your Render URL (no trailing slash).
- Check that `ALLOWED_ORIGINS` on Render includes your exact Netlify URL.

### WebSocket / chat not connecting
- Render's free tier supports WebSockets natively — no extra config needed.
- Make sure `NEXT_PUBLIC_SOCKET_URL` is set in Netlify environment variables.

### Database connection errors
- Neon free tier pauses after 5 minutes of inactivity. The first query after a pause takes 1–2 seconds — this is normal.
- Make sure you copied the full Neon connection string including `?sslmode=require`.

### Render service is sleeping
- Free tier services sleep after 15 min of no traffic. Add a free uptime monitor at [uptimerobot.com](https://uptimerobot.com) — set it to ping `https://taskmate-backend.onrender.com/` every 5 minutes to keep it awake.

---

## Free Tier Limits Summary

| Service | Free Limit | Notes |
|---|---|---|
| Neon | 512 MB storage, 10 compute hrs/month | Enough for development and small teams |
| Render | 750 hrs/month, sleeps after 15 min idle | One free service runs continuously |
| Netlify | 100 GB bandwidth, 300 build mins/month | More than enough for any project |

---

## Architecture After Deployment

```
Student's Browser
      │
      ▼
┌─────────────────────┐
│  Netlify CDN        │  https://taskmate-app.netlify.app
│  Next.js frontend   │
└──────────┬──────────┘
           │  HTTPS REST + WSS (WebSocket Secure)
           ▼
┌─────────────────────┐
│  Render             │  https://taskmate-backend.onrender.com
│  FastAPI + Socket.io│
└──────────┬──────────┘
           │  SSL/TLS PostgreSQL
           ▼
┌─────────────────────┐
│  Neon               │
│  PostgreSQL 16      │
└─────────────────────┘
```
