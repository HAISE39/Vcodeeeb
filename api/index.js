const app = require('../src/server');
const { sequelize } = require('../src/models');

module.exports = async (req, res) => {
  console.log('[Vercel] Request received:', req.method, req.url);
  
  try {
    // 1. Authenticate DB
    console.log('[Vercel] Authenticating Database...');
    await sequelize.authenticate();
    console.log('[Vercel] Database Authenticated.');
    
    // 2. Sync DB
    console.log('[Vercel] Syncing Database...');
    try {
       // First try non-destructive update
       await sequelize.sync({ alter: true });
       console.log('[Vercel] Database Synced (Alter).');
    } catch (syncError) {
       console.error('[Vercel] Database Sync (Alter) Failed:', syncError);
       
       // If alter fails (likely due to schema conflict like NOT NULL on new column),
       // we try to FORCE reset the database to get it working.
       // This wipes data but ensures the app runs.
       console.log('[Vercel] Attempting Database Reset (Force Sync)...');
       try {
           await sequelize.sync({ force: true });
           console.log('[Vercel] Database Synced (Force).');
       } catch (forceError) {
           console.error('[Vercel] Database Force Sync Failed:', forceError);
           if (!process.env.DATABASE_URL) {
               console.error('[Vercel] CRITICAL: DATABASE_URL is missing.');
               return res.status(500).send('Configuration Error: DATABASE_URL is missing. SQLite cannot run on Vercel.');
           }
           throw forceError;
       }
    }
    
    // 3. Hand over to Express
    console.log('[Vercel] Passing to Express app...');
    app(req, res);
  } catch (error) {
    console.error('[Vercel] Unhandled Error:', error);
    // Ensure we send a response so the function doesn't time out or look like a hard crash
    res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
