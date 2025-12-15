const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const { sequelize } = require('./models');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const rawRoutes = require('./routes/raw');
const publicRoutes = require('./routes/public');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// Request Logger
app.use((req, res, next) => {
    console.log(`[Express] ${req.method} ${req.url}`);
    next();
});

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => res.redirect('/dashboard'));
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/raw', rawRoutes);
app.use('/', publicRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Express] Unhandled Error:', err);
  res.status(500).send('Internal Server Error (Express)');
});

// Export app for Vercel
module.exports = app;

// Start Server if run directly
if (require.main === module) {
    sequelize.sync({ force: false }).then(() => {
        console.log('Database synced');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    }).catch(err => {
        console.error('Failed to sync db', err);
    });
}
