const app = require('../src/server');
const { sequelize } = require('../src/models');

module.exports = async (req, res) => {
  try {
    // 1. Authenticate DB
    await sequelize.authenticate();
    
    // 2. Sync DB
    // Optimization: In a real high-scale app, use migrations instead of sync() at runtime.
    // For this project, we sync, but catch errors gracefully.
    try {
       await sequelize.sync();
    } catch (syncError) {
       console.error('Database Sync Error:', syncError);
       // If sync fails (e.g. read-only filesystem with SQLite), we might still try to run 
       // if tables exist, but usually this is fatal.
       if (!process.env.DATABASE_URL) {
           return res.status(500).send('Configuration Error: DATABASE_URL is missing. SQLite cannot run on Vercel.');
       }
       throw syncError;
    }
    
    // 3. Hand over to Express
    app(req, res);
  } catch (error) {
    console.error('Serverless Function Error:', error);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
};
