const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const passport = require('passport');
const flash = require('connect-flash');
const MySQLStore = require('express-mysql-session')(session);
const mysql = require('mysql2');

// Initialize Express app
const app = express();
const port = 3000;

// MySQL connection options
const options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
      // Replace with your actual MySQL password
    database: 'users',
};

// Create MySQL connection
const connection = mysql.createConnection(options);

// Configure session store with MySQL
const sessionStore = new MySQLStore({}, connection);

// Session configuration
app.use(session({
    secret: 'your-secret-key',
    store: sessionStore, // Use the MySQL session store
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 50 * 24 * 60 * 60 * 1000, // 50 days
        secure: false, // Set to true if using HTTPS
        httpOnly: true, // Cookie is only accessible by the web server
    }
}));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 

// Flash messages middleware
app.use(flash());

// Passport.js setup
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  // Replace this with your own logic to fetch user by id
  const user = { id: 1, username: 'testUser' };
  done(null, user);
});

// Middleware to make user and session data available in templates
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn || false;
  res.locals.user = req.session.user || null;
  next();
});

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Import and use routes
const index_router = require("./routes/index");
app.use("/", index_router);

// Start server
app.listen(port, () => {
  console.log(`Server started at ${port}`);
});
