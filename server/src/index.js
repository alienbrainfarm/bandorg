require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3001;
const dbPath = path.join(__dirname, '../db.json');
const authorizedUsersPath = path.join(__dirname, '../authorized_users.json');

// --- Passport Configuration ---
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
},
(accessToken, refreshToken, profile, cb) => {
  fs.readFile(authorizedUsersPath, 'utf8', (err, data) => {
    if (err) return cb(err);
    const authorizedUsers = JSON.parse(data);
    const userEmail = profile.emails[0].value;

    if (authorizedUsers.includes(userEmail)) {
      const user = { email: userEmail, id: profile.id };
      if (userEmail === process.env.ADMIN_EMAIL) {
        user.isAdmin = true;
      }
      return cb(null, user);
    } else {
      return cb(null, false, { message: 'Unauthorized email.' });
    }
  });
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// --- Middleware ---
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from the React app
const clientBuildPath = path.join(process.cwd(), 'client', 'build');
app.use(express.static(clientBuildPath));

// --- Authentication Routes ---
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send('Unauthorized');
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  res.status(403).send('Forbidden');
};

// --- API Routes ---
app.get('/api/current_user', (req, res) => {
  if (req.user) {
    res.json({ email: req.user.email, isAdmin: req.user.isAdmin });
  } else {
    res.json(null);
  }
});

app.get('/api/events', isAuthenticated, (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading database.');
    }
    res.json(JSON.parse(data).events);
  });
});

app.post('/api/events', isAuthenticated, (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading database.');
    }
    const db = JSON.parse(data);
    const newEvent = req.body;
    newEvent.id = Date.now();
    db.events.push(newEvent);
    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
      if (err) {
        return res.status(500).send('Error writing to database.');
      }
      res.status(201).json(newEvent);
    });
  });
});

// Admin routes
app.get('/api/admin/users', isAdmin, (req, res) => {
  fs.readFile(authorizedUsersPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading authorized users.');
    }
    res.json(JSON.parse(data));
  });
});

app.post('/api/admin/users', isAdmin, (req, res) => {
  fs.readFile(authorizedUsersPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading authorized users.');
    }
    const authorizedUsers = JSON.parse(data);
    const newUserEmail = req.body.email;
    if (newUserEmail && !authorizedUsers.includes(newUserEmail)) {
      authorizedUsers.push(newUserEmail);
      fs.writeFile(authorizedUsersPath, JSON.stringify(authorizedUsers, null, 2), (err) => {
        if (err) {
          return res.status(500).send('Error writing authorized users.');
        }
        res.status(201).json(authorizedUsers);
      });
    } else {
      res.status(400).send('Invalid or existing email.');
    }
  });
});

app.delete('/api/admin/users', isAdmin, (req, res) => {
  fs.readFile(authorizedUsersPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading authorized users.');
    }
    let authorizedUsers = JSON.parse(data);
    const emailToDelete = req.body.email;
    if (emailToDelete && authorizedUsers.includes(emailToDelete) && emailToDelete !== process.env.ADMIN_EMAIL) {
      authorizedUsers = authorizedUsers.filter(email => email !== emailToDelete);
      fs.writeFile(authorizedUsersPath, JSON.stringify(authorizedUsers, null, 2), (err) => {
        if (err) {
          return res.status(500).send('Error writing authorized users.');
        }
        res.status(200).json(authorizedUsers);
      });
    } else {
      res.status(400).send('Invalid email or cannot delete admin.');
    }
  });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}

module.exports = app;