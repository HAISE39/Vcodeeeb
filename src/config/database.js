const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

if (process.env.DATABASE_URL) {
  // Use PostgreSQL if DATABASE_URL is defined (e.g. Vercel, Heroku, Supabase)
  console.log('Initializing Sequelize with PostgreSQL...');
  // Force load pg to ensure it's available in the bundle
  require('pg'); 
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false, // Set to console.log to debug SQL
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  if (isProduction) {
    console.error('CRITICAL ERROR: Running in production (Vercel) but DATABASE_URL is not set!');
    console.error('You must set DATABASE_URL environment variable to a valid PostgreSQL connection string.');
    // We let it crash or fall back, but falling back to SQLite on Vercel WILL fail.
    // Proceeding to SQLite will cause "Read-only file system" error.
  }

  // Fallback to SQLite for local development
  console.log('Initializing Sequelize with SQLite...');
  
  // On Vercel, if we reach here, it means DATABASE_URL is missing.
  // We MUST NOT try to use a file-based SQLite because of read-only FS.
  // We'll use in-memory SQLite just to prevent the app from crashing during module load,
  // so that api/index.js can catch the missing env var error and report it.
  const storage = isProduction ? ':memory:' : path.join(__dirname, '../../database.sqlite');
  
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storage,
    logging: false
  });
}

module.exports = sequelize;
