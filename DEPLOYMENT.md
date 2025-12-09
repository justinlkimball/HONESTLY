# Production Deployment Guide

## Fastest Path: Vercel + Supabase (5 minutes)

Both are production-grade. Vercel is the company behind Next.js. Supabase gives you PostgreSQL with pgvector built-in.

---

## Step 1: Create Supabase Database (2 minutes)

### 1.1 Sign Up & Create Project
1. Go to https://supabase.com
2. Sign up / Log in
3. Click **"New Project"**
4. Fill in:
   - **Name:** honestly-db
   - **Database Password:** (generate strong password - SAVE THIS)
   - **Region:** Choose closest to you
5. Click **"Create new project"** (takes ~2 min to provision)

### 1.2 Enable pgvector Extension
1. In your Supabase project, go to **Database** → **Extensions**
2. Search for **"vector"**
3. Enable **"vector"** extension
4. Or run this in SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

### 1.3 Get Database URL
1. Go to **Settings** → **Database**
2. Scroll to **Connection string** → **URI**
3. Click **"URI"** tab
4. Copy the connection string (looks like: `postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres`)
5. **SAVE THIS** - you'll need it for Vercel

---

## Step 2: Deploy to Vercel (3 minutes)

### 2.1 Install Vercel CLI
```bash
npm install -g vercel
```

### 2.2 Deploy from Your Local Machine
```bash
# Make sure you're in the HONESTLY directory
cd /path/to/HONESTLY

# Login to Vercel (opens browser)
vercel login

# Deploy
vercel
```

**Follow the prompts:**
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **What's your project's name?** → honestly (or whatever you want)
- **In which directory is your code located?** → ./
- **Want to override settings?** → No

Vercel will:
1. Upload your code
2. Build the app
3. Deploy it
4. Give you a URL like: `https://honestly-xxx.vercel.app`

### 2.3 Add Environment Variables
The deploy will FAIL first time (expected - missing env vars). Now add them:

```bash
# Add database URL (paste your Supabase connection string)
vercel env add DATABASE_URL production

# Add Anthropic API key
vercel env add ANTHROPIC_API_KEY production

# Add auth secret (generate random 32+ character string)
vercel env add AUTH0_SECRET production

# Add base URL (use your Vercel URL)
vercel env add NEXT_PUBLIC_APP_URL production

# Add mock auth flag
vercel env add USE_MOCK_AUTH production
# Enter: true
```

**To generate AUTH0_SECRET:**
```bash
openssl rand -base64 32
```

### 2.4 Redeploy with Environment Variables
```bash
vercel --prod
```

---

## Step 3: Initialize Production Database (1 minute)

### 3.1 Update Your Local .env
Create a `.env.production` file:

```env
DATABASE_URL="your_supabase_connection_string_here"
```

### 3.2 Push Schema to Production
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to Supabase
DATABASE_URL="your_supabase_url" npx prisma db push
```

This creates all tables in your Supabase database.

---

## Step 4: Verify Deployment

1. Visit your Vercel URL: `https://honestly-xxx.vercel.app`
2. You should see the signup/login screen
3. Create an account
4. Create a profile
5. Test the full flow

---

## Step 5: Custom Domain (Optional)

### 5.1 Add Domain in Vercel
1. Go to your project in Vercel dashboard
2. **Settings** → **Domains**
3. Add your domain (e.g., `honestly.app`)
4. Follow DNS instructions

---

## Alternative: Railway (All-in-One) (10 minutes)

If you prefer everything in one place:

### 1. Sign Up for Railway
1. Go to https://railway.app
2. Sign up with GitHub
3. **"New Project"** → **"Deploy from GitHub repo"**
4. Connect your GitHub and select HONESTLY repo

### 2. Add PostgreSQL
1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway provisions a PostgreSQL instance

### 3. Enable pgvector
1. Click on your PostgreSQL service
2. Go to **"Connect"** tab
3. Copy the **"Postgres Connection URL"**
4. Use a PostgreSQL client or Railway's console:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

### 4. Add Environment Variables
In your Railway project settings, add:
- `DATABASE_URL` → (Railway auto-provides this)
- `ANTHROPIC_API_KEY` → your key
- `AUTH0_SECRET` → generate with `openssl rand -base64 32`
- `NEXT_PUBLIC_APP_URL` → `https://your-app.railway.app`
- `USE_MOCK_AUTH` → `true`

### 5. Deploy
Railway auto-deploys on git push. Or click **"Deploy"** in the dashboard.

### 6. Initialize Database
```bash
DATABASE_URL="railway_postgres_url" npx prisma db push
```

Railway gives you a URL like: `https://honestly-production.up.railway.app`

---

## Costs Breakdown

### Vercel + Supabase (RECOMMENDED)
- **Vercel Free Tier:**
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Custom domains
  - Good for testing + moderate traffic

- **Supabase Free Tier:**
  - 500 MB database
  - 50 MB file storage
  - Unlimited API requests
  - Good for hundreds of users

**Cost: $0/month for MVP testing**

### Railway
- **Free Trial:** $5 credit
- **After:** ~$10-20/month for app + database
- **Scales:** Can handle serious traffic

### Vercel Pro + Supabase Pro (When You Scale)
- **Vercel Pro:** $20/month (unlimited bandwidth, better performance)
- **Supabase Pro:** $25/month (8 GB database, daily backups, more)
- **Total:** $45/month (can handle thousands of users)

---

## Which Should You Choose?

| Option | Speed | Cost (MVP) | Production-Ready | Complexity |
|--------|-------|------------|------------------|------------|
| **Vercel + Supabase** | 5 min | Free | ✅ | Easy |
| **Railway** | 10 min | $10/mo | ✅ | Easy |
| **GCP Cloud Run** | 30+ min | ~$20/mo | ✅ | Hard |
| **Azure App Service** | 30+ min | ~$25/mo | ✅ | Hard |

**Recommendation: Vercel + Supabase**
- Fastest
- Free to start
- Actually production-grade (not "training wheels")
- Scales to serious traffic
- Easy to monitor and debug

---

## After Deployment

### Monitor Your App
- **Vercel:** Dashboard shows deployments, analytics, logs
- **Supabase:** Dashboard shows database queries, API usage

### Add Custom Domain
- Buy domain (Namecheap, Google Domains, Cloudflare)
- Add to Vercel in Settings → Domains
- Update DNS records

### Set Up Auth0 (When Ready)
1. Create Auth0 account
2. Create application
3. Update environment variables in Vercel
4. Push updated auth code

---

## Need Help?

**Vercel Issues:**
- Check build logs in Vercel dashboard
- Verify environment variables are set

**Database Issues:**
- Check Supabase connection string
- Verify pgvector extension is enabled
- Check Prisma migrations ran successfully

**App Issues:**
- Check Vercel function logs
- Verify Anthropic API key is valid
- Check browser console for errors

---

## Quick Command Reference

```bash
# Deploy to Vercel
vercel

# Deploy to production
vercel --prod

# Add environment variable
vercel env add VARIABLE_NAME production

# View logs
vercel logs

# Push database schema
DATABASE_URL="your_url" npx prisma db push

# Open Vercel dashboard
vercel open
```

---

Ready to deploy? **Start with Vercel + Supabase** - you'll have a live URL in 5 minutes.
