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
       await sequelize.sync();
       console.log('[Vercel] Database Synced.');
    } catch (syncError) {
       console.error('[Vercel] Database Sync Error:', syncError);
       if (!process.env.DATABASE_URL) {
           console.error('[Vercel] CRITICAL: DATABASE_URL is missing.');
           return res.status(500).send('Configuration Error: DATABASE_URL is missing. SQLite cannot run on Vercel.');
       }
       // If it's not a missing DB URL, rethrow to see what else it could be
       throw syncError;
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
