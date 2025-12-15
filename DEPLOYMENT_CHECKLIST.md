# ✅ Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

## 📋 Pre-Deployment

### 1. Code Ready
- [x] All features implemented
- [x] Build passing (`npm run build`)
- [x] No TypeScript errors
- [x] No console errors
- [x] Git repository initialized

### 2. Environment Setup
- [ ] Database provisioned (Vercel Postgres/Neon/Supabase)
- [ ] Database URL obtained
- [ ] Auth secret generated (`openssl rand -base64 32`)
- [ ] GG secret key generated (`openssl rand -base64 32`)
- [ ] Encryption key generated (`openssl rand -base64 32`)
- [ ] Keys stored securely (password manager)

### 3. Configuration Files
- [x] `.env.example` exists with all variables
- [x] `.gitignore` excludes `.env` files
- [x] `vercel.json` configured (optional)
- [x] `package.json` has correct build script
- [x] `prisma/schema.prisma` is valid

## 🚀 Deployment Steps

### Step 1: Database Setup
- [ ] Created PostgreSQL database
- [ ] Copied connection string
- [ ] Tested connection (if local)
- [ ] SSL enabled (for remote databases)

### Step 2: Vercel Setup
- [ ] Signed up/logged into Vercel
- [ ] Connected GitHub account (if using GitHub)
- [ ] Created new project (or linked existing)

### Step 3: Git Push
```bash
- [ ] git add .
- [ ] git commit -m "Initial deployment"
- [ ] git push origin main
```

### Step 4: Vercel Configuration
- [ ] Imported repository in Vercel
- [ ] Selected framework: Next.js
- [ ] Set root directory: `./`
- [ ] Build command: `prisma generate && next build` (auto-detected)
- [ ] Output directory: `.next` (auto-detected)

### Step 5: Environment Variables
Add these in Vercel project settings:

```bash
- [ ] DATABASE_URL=postgresql://...
- [ ] AUTH_SECRET=<your-auth-secret>
- [ ] GG_SECRET_KEY=<your-gg-key>
- [ ] ENCRYPTION_KEY=<your-encryption-key>
```

### Step 6: Deploy
- [ ] Clicked "Deploy" button
- [ ] Build completed successfully
- [ ] No build errors
- [ ] Deployment URL received

### Step 7: Database Migration
```bash
- [ ] vercel env pull .env.local
- [ ] npx prisma db push
- [ ] Verified database tables created
```

## 🧪 Post-Deployment Testing

### Test 1: Homepage
- [ ] Visit `https://your-app.vercel.app`
- [ ] Homepage loads correctly
- [ ] No console errors
- [ ] Styling correct

### Test 2: Registration
- [ ] Go to `/login`
- [ ] Click "Register" tab
- [ ] Fill in email + password
- [ ] Submit form
- [ ] Redirects to dashboard
- [ ] No errors

### Test 3: Login
- [ ] Logout (if logged in)
- [ ] Go to `/login`
- [ ] Login with credentials
- [ ] Redirects to dashboard
- [ ] Session persists

### Test 4: Create Script
- [ ] Login to dashboard
- [ ] Click "New Script"
- [ ] Fill in script details:
  ```lua
  gg.alert("Test script loaded!")
  print("Hello from secure delivery")
  ```
- [ ] Save script
- [ ] Redirects to dashboard
- [ ] Script appears in list

### Test 5: Edit Script
- [ ] Click on script
- [ ] Modify content
- [ ] Save changes
- [ ] Version count increases
- [ ] Changes saved

### Test 6: Browser Blocking (CRITICAL)
```bash
# Open in browser:
https://your-app.vercel.app/api/raw/SCRIPT_ID

- [ ] Should redirect to homepage
- [ ] Should NOT show script content
- [ ] No errors in browser console
```

### Test 7: Valid Headers (CRITICAL)
```bash
curl "https://your-app.vercel.app/api/raw/SCRIPT_ID" \
  -H "X-GG-KEY: your-gg-secret-key" \
  -H "X-CLIENT-TYPE: GG"

- [ ] Returns encrypted content
- [ ] Status code 200
- [ ] Content-Type: text/plain
```

### Test 8: Invalid Headers
```bash
curl "https://your-app.vercel.app/api/raw/SCRIPT_ID"

- [ ] Redirects (302)
- [ ] Or returns error (401/403)
```

### Test 9: Version History
- [ ] Open script in editor
- [ ] View version history section
- [ ] Multiple versions listed
- [ ] Click "Restore" on old version
- [ ] Script restored successfully

### Test 10: Script Status
- [ ] Set script to "Disabled"
- [ ] Try accessing via API
- [ ] Should return error
- [ ] Set back to "Active"
- [ ] Should work again

## 🎮 Game Guardian Testing

### Test 11: Loader Setup
- [ ] Copied loader code from `/docs`
- [ ] Replaced `YOUR_DOMAIN` with Vercel domain
- [ ] Replaced `YOUR_GG_SECRET_KEY` with actual key
- [ ] Replaced `YOUR_ENCRYPTION_KEY` with actual key
- [ ] Replaced `YOUR_SCRIPT_ID` with real script ID

### Test 12: GG Execution
- [ ] Run loader in Game Guardian
- [ ] Script loads successfully
- [ ] Alert/print messages appear
- [ ] No errors

### Test 13: Update Test
- [ ] Update script in dashboard
- [ ] Run loader again (without changes)
- [ ] Gets updated version
- [ ] New content executes

## 🔒 Security Verification

### Security Test 1: Password Hashing
- [ ] Create user
- [ ] Check database (Prisma Studio)
- [ ] Password is hashed (not plaintext)

### Security Test 2: Script Encryption
- [ ] Create script
- [ ] Check database
- [ ] `encrypted` field contains encrypted data
- [ ] Not readable plaintext

### Security Test 3: Protected Routes
- [ ] Logout
- [ ] Try accessing `/dashboard`
- [ ] Redirects to `/login`
- [ ] Cannot access without auth

### Security Test 4: API Protection
```bash
curl https://your-app.vercel.app/api/scripts

- [ ] Returns 401 Unauthorized
- [ ] Without session cookie
```

### Security Test 5: HTTPS
- [ ] Visit app
- [ ] Check URL has `https://`
- [ ] Lock icon in browser
- [ ] Certificate valid

## 📊 Performance Check

### Performance 1: Page Load
- [ ] Homepage loads in < 2 seconds
- [ ] Dashboard loads in < 3 seconds
- [ ] No excessive loading times

### Performance 2: API Response
- [ ] Script list API < 1 second
- [ ] Raw endpoint < 500ms
- [ ] Create script < 2 seconds

### Performance 3: Database
- [ ] Queries complete quickly
- [ ] No timeout errors
- [ ] Connection pooling works

## 📱 Mobile Testing

- [ ] Homepage responsive
- [ ] Login form works on mobile
- [ ] Dashboard usable on mobile
- [ ] Script editor usable
- [ ] Buttons touchable

## 🔧 Vercel Dashboard Check

### Vercel Settings
- [ ] Custom domain added (if applicable)
- [ ] Environment variables set for production
- [ ] Build & development settings correct
- [ ] Functions region set (optional)

### Vercel Logs
- [ ] Check function logs for errors
- [ ] Monitor for failed requests
- [ ] No unexpected errors

### Vercel Analytics (Optional)
- [ ] Enable Vercel Analytics
- [ ] Monitor page views
- [ ] Track performance

## 📝 Documentation Check

- [ ] README.md updated with live URL
- [ ] QUICKSTART.md has correct instructions
- [ ] API.md has correct endpoints
- [ ] Documentation accessible at `/docs`

## 🎯 Final Verification

### Must Work:
- [x] User registration ✅
- [x] User login ✅
- [x] Script CRUD ✅
- [x] Version control ✅
- [x] Browser blocking ✅
- [x] GG loader ✅
- [x] Encryption ✅
- [x] Header validation ✅

### Optional (Future):
- [ ] Rate limiting
- [ ] Analytics
- [ ] Custom domain
- [ ] Email notifications
- [ ] 2FA

## 🎉 Launch Checklist

### Pre-Launch
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Documentation complete
- [ ] Backup strategy in place

### Launch
- [ ] Announce to users
- [ ] Share documentation
- [ ] Provide support channel
- [ ] Monitor for issues

### Post-Launch
- [ ] Monitor Vercel logs
- [ ] Check database performance
- [ ] Collect user feedback
- [ ] Plan improvements

## ⚠️ Common Issues

### Build Fails
```bash
# Solution:
- Check Prisma generates correctly
- Verify DATABASE_URL is set
- Check for TypeScript errors
- Review build logs
```

### Database Connection Error
```bash
# Solution:
- Verify DATABASE_URL format
- Check database allows Vercel IPs
- Enable SSL in connection string
- Test with Prisma Studio
```

### Authentication Not Working
```bash
# Solution:
- Verify AUTH_SECRET is set
- Clear browser cookies
- Check session expiration
- Review NextAuth logs
```

### Raw Endpoint Returns 404
```bash
# Solution:
- Verify script exists
- Check script ID in URL
- Ensure script is ACTIVE
- Review API logs
```

### Headers Not Validating
```bash
# Solution:
- Verify GG_SECRET_KEY matches
- Check header names (case-sensitive)
- Review validation.ts logic
- Test with cURL first
```

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Project Docs**: See `/docs` on your app

## ✅ Deployment Complete

If all checkboxes are checked:

🎉 **Congratulations!** Your Secure Script Delivery Platform is live!

**Next Steps:**
1. Share URL with users
2. Distribute GG loader
3. Monitor usage
4. Collect feedback
5. Plan improvements

---

**Deployed on**: [Your deployment date]
**URL**: https://your-app.vercel.app
**Status**: ✅ Production Ready
