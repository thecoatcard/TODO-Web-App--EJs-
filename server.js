// server.js

const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const helmet = require('helmet');
require('dotenv').config();

const connectDB = require('./config/database');
const startScheduler = require('./services/scheduler');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// --- Initial Setup ---
const app = express();
app.set('trust proxy', 1); // <-- THIS LINE IS THE FIX
connectDB(); // Connect to MongoDB
require('./config/passport-setup'); // Configure Passport strategies

// --- View Engine and Middleware ---
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- Security Middleware ---
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "default-src": ["'self'"],
      "script-src": [
        "'self'", 
        "https://cdn.tailwindcss.com", 
        "https://cdn.jsdelivr.net"
      ],
      "style-src": [
        "'self'", 
        "https://cdn.jsdelivr.net", 
        "https://fonts.googleapis.com", 
        "'unsafe-inline'"
      ],
      "font-src": [
        "'self'", 
        "https://fonts.gstatic.com"
      ],
    },
  })
);

// --- Session and Authentication Middleware ---
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(passport.initialize());
app.use(passport.session());

// --- Flash Notifications Middleware ---
app.use(flash());
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.info = req.flash('info');
    next();
});

// --- Routes ---
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));

// --- Error Handling Middleware ---
app.use(notFound);
app.use(errorHandler);

// --- Start Server (for local development) ---
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        startScheduler(); 
    });
}

// Export the app for Vercel
module.exports = app;
