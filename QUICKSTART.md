# ⚡ Quick Start Guide

Get your Secure Script Delivery Platform up and running in 5 minutes!

## 🚀 Option 1: Deploy to Vercel (Fastest)

### Step 1: Get a Database

Choose one:

**A) Vercel Postgres (Easiest)**
```bash
# On Vercel Dashboard
1. Create Storage → Postgres
2. Copy POSTGRES_PRISMA_URL
```

**B) Neon (Free)**
```bash
1. Visit https://neon.tech
2. Create project → Copy connection string
```

**C) Supabase (Free)**
```bash
1. Visit https://supabase.com
2. New project → Settings → Database → Connection string
```

### Step 2: Generate Keys

```bash
# Run these 3 commands:
openssl rand -base64 32  # AUTH_SECRET
openssl rand -base64 32  # GG_SECRET_KEY
openssl rand -base64 32  # ENCRYPTION_KEY

# Save the outputs!
```

### Step 3: Deploy

**Via GitHub:**
1. Push code to GitHub
2. Visit [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables:
   ```
   DATABASE_URL=postgresql://...
   AUTH_SECRET=<from-step-2>
   GG_SECRET_KEY=<from-step-2>
   ENCRYPTION_KEY=<from-step-2>
   ```
5. Click **Deploy**

**Via CLI:**
```bash
npm i -g vercel
vercel login
vercel

# Add environment variables when prompted
```

### Step 4: Setup Database

After deployment:
```bash
vercel env pull .env.local
npx prisma db push
```

### Step 5: Create Admin Account

1. Visit `https://your-app.vercel.app/login`
2. Click "Register"
3. Create account
4. Login

**Done!** 🎉

---

## 💻 Option 2: Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### Steps

```bash
# 1. Clone & Install
git clone <your-repo>
cd project
npm install

# 2. Setup Environment
cp .env.example .env

# Edit .env file with your values:
# DATABASE_URL="postgresql://user:password@localhost:5432/scriptdelivery"
# AUTH_SECRET="your-secret-key"
# GG_SECRET_KEY="your-gg-key"
# ENCRYPTION_KEY="your-encryption-key"

# 3. Setup Database
npx prisma generate
npx prisma db push

# 4. Run Development Server
npm run dev

# 5. Open http://localhost:3000
```

**Done!** Your local server is running.

---

## 🎮 Using with Game Guardian

### Step 1: Create a Script

1. Login to dashboard
2. Click "New Script"
3. Enter:
   - **Name**: "Test Script"
   - **Content**: 
     ```lua
     gg.alert("✅ Loaded from secure server!")
     print("Hello from secure delivery!")
     ```
4. Save and copy the **Script ID** from URL

### Step 2: Setup Loader

Copy this to Game Guardian:

```lua
-- CONFIGURATION
local DOMAIN = "your-app.vercel.app"
local GG_KEY = "your-gg-secret-key"
local ENCRYPTION_KEY = "your-encryption-key"
local SCRIPT_ID = "your-script-id"

-- DECRYPTION FUNCTION
local function decryptScript(encrypted)
    -- Install crypto-js for Lua or use simpler encoding
    local CryptoJS = require("crypto-js")
    local bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY)
    return bytes:toString(CryptoJS.enc.Utf8)
end

-- LOADER
local function loadScript()
    local response = gg.makeRequest({
        url = "https://" .. DOMAIN .. "/api/raw/" .. SCRIPT_ID,
        headers = {
            ["X-GG-KEY"] = GG_KEY,
            ["X-CLIENT-TYPE"] = "GG"
        }
    })
    
    if response.code == 200 then
        local decrypted = decryptScript(response.content)
        load(decrypted)()
        return true
    else
        gg.alert("❌ Failed: " .. response.code)
        return false
    end
end

-- RUN
loadScript()
```

### Step 3: Test

1. Run loader in Game Guardian
2. Should see: "✅ Loaded from secure server!"
3. Update script in dashboard
4. Run loader again - gets new version automatically!

---

## 🔐 Verify Security

### Test 1: Browser Blocking

```bash
# Try opening in browser:
https://your-app.vercel.app/api/raw/YOUR_SCRIPT_ID

# Should redirect to homepage ✅
```

### Test 2: Valid Headers

```bash
curl "https://your-app.vercel.app/api/raw/YOUR_SCRIPT_ID" \
  -H "X-GG-KEY: your-gg-secret-key" \
  -H "X-CLIENT-TYPE: GG"

# Should return encrypted content ✅
```

### Test 3: Invalid Headers

```bash
curl "https://your-app.vercel.app/api/raw/YOUR_SCRIPT_ID"

# Should redirect (302) ✅
```

---

## 📋 Checklist

Deployment:
- [ ] Database created
- [ ] Environment variables set in Vercel
- [ ] Code pushed to Git
- [ ] Deployed successfully
- [ ] Database schema pushed (`npx prisma db push`)
- [ ] Can access homepage
- [ ] Can register/login
- [ ] Dashboard loads

Script Creation:
- [ ] Created first script
- [ ] Script shows in dashboard
- [ ] Can edit script
- [ ] Version history works
- [ ] Can copy script ID

Security:
- [ ] Browser blocked from raw endpoint
- [ ] Valid headers return encrypted script
- [ ] Scripts are encrypted
- [ ] HTTPS working

Game Guardian:
- [ ] Loader configured with correct keys
- [ ] Script loads successfully
- [ ] Updates work without changing loader

---

## 🆘 Common Issues

### Build Fails
```bash
# Make sure Prisma is generated
npx prisma generate
npm run build
```

### Database Connection Error
```bash
# Check DATABASE_URL format
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

### 401 Unauthorized
```bash
# Clear cookies and login again
# Check AUTH_SECRET is set correctly
```

### Script Not Loading in GG
```bash
# Verify:
1. Script ID is correct
2. GG_SECRET_KEY matches Vercel
3. ENCRYPTION_KEY matches Vercel
4. Script status is ACTIVE
5. Headers are correct
```

### Raw Endpoint Returns 404
```bash
# Check:
1. Script exists in database
2. URL format: /api/raw/SCRIPT_ID (not /raw/SCRIPT_ID)
3. Script is not deleted
```

---

## 🎯 Next Steps

After setup:

1. **Customize Design**
   - Edit colors in `tailwind.config.ts`
   - Modify layouts in `/app`

2. **Add Features**
   - Rate limiting
   - Analytics
   - Script categories
   - User management

3. **Optimize**
   - Add caching
   - Implement CDN
   - Optimize database queries

4. **Monitor**
   - Check Vercel logs
   - Monitor database usage
   - Track API requests

---

## 📚 Documentation

- **Full Guide**: See `README.md`
- **API Reference**: See `API.md`
- **Security**: See `SECURITY_ARCHITECTURE.md`
- **Deployment**: See `DEPLOYMENT.md`
- **Features**: See `FEATURES.md`

---

## 💬 Support

If you encounter issues:

1. Check the documentation
2. Review error messages in Vercel logs
3. Verify environment variables
4. Test endpoints with cURL
5. Check GitHub Issues

---

## 🎉 Success!

Your secure script delivery platform is ready!

**Features Working:**
✅ Secure authentication
✅ Script management
✅ Version control
✅ Encrypted delivery
✅ Browser protection
✅ Game Guardian integration

**Start managing your scripts securely!**

---

**Platform Status**: Production Ready
**Deploy Time**: ~5 minutes
**Difficulty**: Easy

Enjoy your new secure script delivery platform! 🚀
