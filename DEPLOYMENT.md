# 🚀 Deployment Guide - Vercel

Complete guide to deploy your Secure Script Delivery Platform to Vercel.

## Prerequisites

- Vercel account (free tier works)
- GitHub/GitLab/Bitbucket account
- PostgreSQL database (Vercel Postgres, Neon, or Supabase)

## Step 1: Prepare Database

### Option A: Vercel Postgres (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create new Storage → Postgres
3. Copy the `POSTGRES_PRISMA_URL` connection string
4. Save for later

### Option B: Neon (Free Serverless)

1. Go to [Neon](https://neon.tech)
2. Create new project
3. Copy PostgreSQL connection string
4. Should look like: `postgresql://user:pass@host.neon.tech/dbname?sslmode=require`

### Option C: Supabase (Free Tier)

1. Go to [Supabase](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy "Connection string" (Transaction mode)

## Step 2: Generate Secret Keys

Generate secure keys for your application:

```bash
# Generate AUTH_SECRET
openssl rand -base64 32

# Generate GG_SECRET_KEY  
openssl rand -base64 32

# Generate ENCRYPTION_KEY
openssl rand -base64 32
```

Save these keys in a secure location!

## Step 3: Push Code to Git

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Secure Script Delivery Platform"

# Add remote (replace with your repo)
git remote add origin https://github.com/yourusername/your-repo.git

# Push
git push -u origin main
```

## Step 4: Deploy to Vercel

### Method 1: Vercel Dashboard (Easiest)

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `prisma generate && next build`
   - **Output Directory**: `.next`

5. Add Environment Variables:

```
DATABASE_URL=postgresql://...your-database-url
AUTH_SECRET=your-generated-auth-secret
GG_SECRET_KEY=your-generated-gg-key
ENCRYPTION_KEY=your-generated-encryption-key
```

6. Click "Deploy"

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# Set up and deploy? Yes
# Which scope? (Select your account)
# Link to existing project? No
# What's your project's name? secure-script-delivery
# In which directory is your code located? ./
# Want to override settings? No

# Add environment variables
vercel env add DATABASE_URL
vercel env add AUTH_SECRET
vercel env add GG_SECRET_KEY
vercel env add ENCRYPTION_KEY

# Deploy to production
vercel --prod
```

## Step 5: Setup Database Schema

After deployment, you need to push the database schema:

### Option A: Using Vercel CLI

```bash
# Set DATABASE_URL locally (temporarily)
export DATABASE_URL="your-production-database-url"

# Push schema
npx prisma db push

# Generate client
npx prisma generate
```

### Option B: Using Prisma Studio

```bash
# Open Prisma Studio with production DB
DATABASE_URL="your-db-url" npx prisma studio
```

### Option C: From Vercel Project

```bash
# Connect to Vercel project
vercel link

# Pull environment variables
vercel env pull

# Push database
npx prisma db push
```

## Step 6: Verify Deployment

### Check Homepage
Visit: `https://your-app.vercel.app`

Should see the homepage with:
- ✅ "Secure Script Delivery Platform"
- ✅ Features section
- ✅ "Get Started" button

### Check Login
Visit: `https://your-app.vercel.app/login`

Try registering:
- ✅ Register form works
- ✅ Can create account
- ✅ Redirects to dashboard

### Check Dashboard
After login:
- ✅ Dashboard loads
- ✅ Can create new script
- ✅ Scripts list appears

### Check Raw Endpoint (Most Important!)

Test browser blocking:
```bash
# In browser, try accessing:
https://your-app.vercel.app/api/raw/test-id

# Should redirect to homepage ✅
```

Test with valid headers:
```bash
curl -X GET "https://your-app.vercel.app/api/raw/SCRIPT_ID" \
  -H "X-GG-KEY: your-gg-secret-key" \
  -H "X-CLIENT-TYPE: GG"

# Should return encrypted script ✅
```

## Step 7: Create First Admin User

### Option 1: Via UI

1. Go to `/login`
2. Click "Register"
3. Create account with email/password

### Option 2: Via Database

If you need to make an existing user admin:

```sql
-- Using Prisma Studio or direct SQL
UPDATE "User" 
SET role = 'ADMIN' 
WHERE email = 'your@email.com';
```

## Step 8: Create Test Script

1. Login to dashboard
2. Click "New Script"
3. Fill in:
   - **Name**: Test Script
   - **Description**: My first script
   - **Content**: 
   ```lua
   gg.alert("Hello from secure delivery!")
   print("Script loaded successfully")
   ```
4. Click "Create Script"
5. Copy the Script ID from URL

## Step 9: Test with Game Guardian

Create a test loader in Game Guardian:

```lua
-- Replace YOUR_DOMAIN, YOUR_GG_KEY, YOUR_ENCRYPTION_KEY, YOUR_SCRIPT_ID
local function decryptScript(encrypted)
    local CryptoJS = require("crypto-js")
    local key = "YOUR_ENCRYPTION_KEY"
    local bytes = CryptoJS.AES.decrypt(encrypted, key)
    return bytes:toString(CryptoJS.enc.Utf8)
end

local function loadScript(scriptId)
    local response = gg.makeRequest({
        url = "https://YOUR_DOMAIN.vercel.app/api/raw/" .. scriptId,
        headers = {
            ["X-GG-KEY"] = "YOUR_GG_KEY",
            ["X-CLIENT-TYPE"] = "GG"
        }
    })
    
    if response.code == 200 then
        local decrypted = decryptScript(response.content)
        local func, err = load(decrypted)
        if func then
            func()
        else
            gg.alert("Error: " .. err)
        end
    else
        gg.alert("Failed: " .. response.code)
    end
end

loadScript("YOUR_SCRIPT_ID")
```

## Troubleshooting

### Build Fails

**Error**: Prisma Client not generated

**Solution**:
```bash
# Update build command in Vercel
prisma generate && next build
```

### Database Connection Error

**Error**: Can't connect to database

**Solution**:
1. Check DATABASE_URL is correct
2. Ensure database allows connections from Vercel IPs
3. Check SSL mode is enabled for remote connections

### 401 Unauthorized on Dashboard

**Error**: Not logged in

**Solution**:
1. Check AUTH_SECRET is set in Vercel
2. Clear browser cookies
3. Try logging in again

### Raw Endpoint Returns 404

**Error**: Script not found

**Solution**:
1. Verify script exists in database
2. Check script ID is correct
3. Ensure script status is ACTIVE

### Headers Not Working

**Error**: Still redirected with valid headers

**Solution**:
1. Verify GG_SECRET_KEY matches in Vercel and loader
2. Check X-CLIENT-TYPE = "GG" (case sensitive)
3. Test with curl to isolate issue

### Encryption/Decryption Fails

**Error**: Can't decrypt script

**Solution**:
1. Ensure ENCRYPTION_KEY is same in Vercel and loader
2. Check for whitespace/newlines in key
3. Verify encryption library is same version

## Post-Deployment

### Custom Domain (Optional)

1. Go to Vercel Project Settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration steps
5. Update loader URL

### Monitoring

Monitor your app:
- **Vercel Dashboard**: Analytics & Logs
- **Vercel Logs**: Real-time function logs
- **Database Metrics**: Query performance

### Backup Strategy

1. Enable database backups (depends on provider)
2. Export scripts regularly
3. Keep environment variables secure backup

### Updates

To deploy updates:
```bash
# Make changes
git add .
git commit -m "Your update message"
git push

# Vercel auto-deploys on push!
```

### Scaling

Free tier limits:
- Vercel: 100GB bandwidth, 100 hours function time
- Database: Depends on provider

For high traffic:
- Upgrade Vercel plan
- Use CDN for static assets
- Enable database connection pooling
- Add rate limiting

## Security Checklist Post-Deployment

- [ ] All environment variables set in Vercel
- [ ] Strong random keys used (32+ chars)
- [ ] Database SSL enabled
- [ ] HTTPS working (automatic on Vercel)
- [ ] Browser blocking tested
- [ ] Header validation tested
- [ ] Encryption working
- [ ] First admin account created
- [ ] Test script created and working
- [ ] Game Guardian loader tested
- [ ] `.env` not in Git repository
- [ ] Keys stored securely offline

## Need Help?

1. Check Vercel logs: `vercel logs`
2. Check database status in provider dashboard
3. Review error messages in browser console
4. Test API endpoints with Postman/curl
5. Check GitHub Issues for similar problems

## Success! 🎉

Your Secure Script Delivery Platform is now live!

- **Dashboard**: `https://your-app.vercel.app/dashboard`
- **API**: `https://your-app.vercel.app/api/*`
- **Docs**: `https://your-app.vercel.app/docs`

Share your loader with Game Guardian users and start managing scripts securely!

---

**Deployed on Vercel** ▲
