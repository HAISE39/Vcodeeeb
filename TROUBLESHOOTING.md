# Troubleshooting Vercel Crashes

If you are seeing `500: INTERNAL_SERVER_ERROR` or `FUNCTION_INVOCATION_FAILED`, please follow these steps.

## 1. Check Function Logs (Not Build Logs)
The "Build Logs" usually say "Deployment completed". This is misleading if the app crashes at runtime.
You need to go to **Vercel Dashboard > Your Project > Logs** and look at the "Functions" tab.

Look for lines starting with `[Vercel]`.

## 2. Common Errors

### "Configuration Error: DATABASE_URL is missing"
**Cause:** You did not add the `DATABASE_URL` environment variable in Vercel.
**Fix:**
1. Go to Project Settings > Environment Variables.
2. Add `DATABASE_URL`.
3. Value should be a PostgreSQL connection string (e.g., from Neon, Supabase, or Vercel Postgres).
4. **Redeploy** the application (Deployment > Redeploy) for changes to take effect.

### "SequelizeConnectionError: password authentication failed"
**Cause:** Wrong database credentials.
**Fix:** Check your `DATABASE_URL`.

### "Error: Cannot find module 'pg'"
**Cause:** The PostgreSQL driver wasn't bundled.
**Fix:** I have already added `require('pg')` in the config to force this, so this shouldn't happen.

### "Error: Failed to lookup view..."
**Cause:** EJS templates were not copied.
**Fix:** I have updated `vercel.json` to include `src/views/**`.

## 3. SQLite on Vercel
**Crucial:** You cannot use SQLite on Vercel because the file system is read-only.
If the logs say `Initializing Sequelize with SQLite...`, then the app failed to detect `DATABASE_URL` and is trying to fall back to SQLite, which causes the crash.

## 4. Still Crashing?
If the logs show `[Vercel] Authenticating Database...` but never `[Vercel] Database Authenticated.`, the connection is timing out.
- Check if your Database allows connections from external IPs (0.0.0.0/0).
- Check if "SSL" is required (the code currently forces SSL).
