const app = require('../src/server');
const { sequelize } = require('../src/models');

module.exports = async (req, res) => {
  try {
    // Ensure DB connection is established
    await sequelize.authenticate();
    
    // Sync models (Safe for dev/small apps, use migrations for prod)
    // We use alter: true to update schema if changed, or just default sync
    await sequelize.sync();
    
    app(req, res);
  } catch (error) {
    console.error('Database Connection Error:', error);
    res.status(500).send('Internal Server Error: Database Connection Failed');
  }
};
