require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3001;
const dbPath = path.join(__dirname, '../db.json');
const authorizedUsersPath = path.join(__dirname, '../authorized_users.json');

// --- Passport Configuration ---
if (process.env.NODE_ENV !== 'test') {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  (accessToken, refreshToken, profile, cb) => {
    console.log('GoogleStrategy callback: profile.emails[0].value', profile.emails[0].value);
    fs.readFile(authorizedUsersPath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading authorized_users.json in GoogleStrategy:', err);
        return cb(err);
      }
      console.log('GoogleStrategy callback: authorizedUsersPath', authorizedUsersPath);
      console.log('GoogleStrategy callback: authorized_users.json content', data);
      const authorizedUsers = JSON.parse(data);
      const userEmail = profile.emails[0].value.toLowerCase();

      const foundUser = authorizedUsers.find(u => u.email === userEmail);

      if (foundUser) {
        console.log('GoogleStrategy callback: foundUser.email', foundUser.email);
        const user = { email: userEmail, id: profile.id, isAdmin: foundUser.isAdmin };
        return cb(null, user);
      } else {
        console.log('GoogleStrategy callback: Unauthorized email', userEmail);
        return cb(null, false, { message: 'Unauthorized email.' });
      }
    });
  }));

  passport.serializeUser((user, done) => {
    console.log('Serializing user:', user);
    done(null, user);
  });

  passport.deserializeUser(async (user, done) => {
    console.log('Deserializing user:', user);
    try {
      const data = await fsPromises.readFile(authorizedUsersPath, 'utf8');
      const authorizedUsers = JSON.parse(data);
      const foundUser = authorizedUsers.find(u => u.email.toLowerCase() === user.email.toLowerCase());

      if (foundUser) {
        console.log('Deserialized user found:', { ...user, isAdmin: foundUser.isAdmin });
        done(null, { ...user, isAdmin: foundUser.isAdmin });
      } else {
        console.log('Deserialized user not found in authorized_users.json');
        done(null, false);
      }
    } catch (err) {
      console.error('Error deserializing user from authorized_users.json:', err);
      done(err);
    }
  });
}

// --- Middleware ---
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'test_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

if (process.env.NODE_ENV !== 'test') {
  app.use(passport.initialize());
  app.use(passport.session());
} else {
  app.use((req, res, next) => {
    req.user = { email: 'test@example.com', isAdmin: true };
    next();
  });
}

// Serve static files from the React app
const clientBuildPath = '/app/client/build';
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
    if (err) { console.error('Error during logout:', err); }
    res.redirect('/logout-success');
  });
});

// Middleware to check if user is authenticated
const isAuthenticated = async (req, res, next) => {
  if (req.isAuthenticated()) {
    try {
      const data = await fsPromises.readFile(authorizedUsersPath, 'utf8');
      const authorizedUsers = JSON.parse(data);
      const foundUser = authorizedUsers.find(u => u.email.toLowerCase() === req.user.email.toLowerCase());

      if (foundUser) {
        req.user.isAdmin = foundUser.isAdmin; // Update isAdmin status
        return next();
      } else {
        // User no longer authorized, log them out
        req.logout((err) => {
          if (err) { console.error('Error logging out unauthorized user:', err); }
          res.status(401).send('Unauthorized: Your account is no longer authorized.');
        });
      }
    } catch (err) {
      console.error('Error reading authorized users in isAuthenticated middleware:', err);
      return res.status(500).send('Internal Server Error');
    }
  } else {
    res.status(401).send('Unauthorized');
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (process.env.NODE_ENV === 'test' || (req.isAuthenticated() && req.user.isAdmin)) {
    return next();
  }
  res.status(403).send('Forbidden');
};

// --- API Routes ---
app.get('/api/current_user', (req, res) => {
  console.log('/api/current_user: req.user', req.user);
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
    newEvent.createdBy = req.user.email;
    newEvent.lastUpdatedBy = req.user.email;
    db.events.push(newEvent);
    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
      if (err) {
        return res.status(500).send('Error writing to database.');
      }
      res.status(201).json(newEvent);
    });
  });
});

app.put('/api/events/:id', isAuthenticated, (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading database.');
    }
    let db = JSON.parse(data);
    const eventId = parseInt(req.params.id);
    const eventIndex = db.events.findIndex(e => e.id === eventId);

    if (eventIndex === -1) {
      return res.status(404).send('Event not found.');
    }

    const eventToUpdate = db.events[eventIndex];

    if (eventToUpdate.createdBy !== req.user.email && !req.user.isAdmin) {
      return res.status(403).send('Forbidden: You can only edit events you created or if you are an admin.');
    }

    const updatedEvent = { ...eventToUpdate, ...req.body, lastUpdatedBy: req.user.email };
    db.events[eventIndex] = updatedEvent;

    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
      if (err) {
        return res.status(500).send('Error writing to database.');
      }
      res.status(200).json(updatedEvent);
    });
  });
});

app.delete('/api/events/:id', isAuthenticated, (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading database.');
    }
    let db = JSON.parse(data);
    const eventId = parseInt(req.params.id);
    const eventIndex = db.events.findIndex(e => e.id === eventId);

    if (eventIndex === -1) {
      return res.status(404).send('Event not found.');
    }

    const eventToDelete = db.events[eventIndex];

    if (eventToDelete.createdBy !== req.user.email && !req.user.isAdmin) {
      return res.status(403).send('Forbidden: You can only delete events you created or if you are an admin.');
    }

    db.events = db.events.filter(e => e.id !== eventId);

    fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
      if (err) {
        return res.status(500).send('Error writing to database.');
      }
      res.status(204).send(); // No Content
    });
  });
});

// Admin routes
app.get('/api/admin/users', isAdmin, async (req, res) => {
  try {
    const data = await fsPromises.readFile(authorizedUsersPath, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error('Error reading authorized users:', err);
    res.status(500).send('Error reading authorized users.');
  }
});

app.post('/api/admin/users', isAdmin, async (req, res) => {
  try {
    const data = await fsPromises.readFile(authorizedUsersPath, 'utf8');
    const authorizedUsers = JSON.parse(data);
    const { email, isAdmin: newIsAdmin } = req.body;

    if (!email) {
      return res.status(400).send('Email is required.');
    }

    if (authorizedUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).send('User with this email already exists.');
    }

    authorizedUsers.push({ email: email.toLowerCase(), isAdmin: !!newIsAdmin }); // Ensure isAdmin is boolean

    await fsPromises.writeFile(authorizedUsersPath, JSON.stringify(authorizedUsers, null, 2));
    res.status(201).json(authorizedUsers);
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).send('Error adding user.');
  }
});

app.put('/api/admin/users', isAdmin, async (req, res) => {
  try {
    const data = await fsPromises.readFile(authorizedUsersPath, 'utf8');
    let authorizedUsers = JSON.parse(data);
    const { email, isAdmin: updatedIsAdmin } = req.body;

    if (!email) {
      return res.status(400).send('Email is required.');
    }

    const userIndex = authorizedUsers.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    if (userIndex === -1) {
      return res.status(404).send('User not found.');
    }

    // Prevent changing admin status of the primary admin (from .env)
    if (email === process.env.ADMIN_EMAIL && updatedIsAdmin === false) {
      return res.status(403).send('Cannot demote the primary admin user.');
    }

    authorizedUsers[userIndex].isAdmin = !!updatedIsAdmin;

    await fsPromises.writeFile(authorizedUsersPath, JSON.stringify(authorizedUsers, null, 2));
    res.status(200).json(authorizedUsers);
  } catch (err) {
    console.error('Error updating admin status:', err);
    res.status(500).send('Error updating admin status.');
  }
});

app.delete('/api/admin/users', isAdmin, async (req, res) => {
  try {
    const data = await fsPromises.readFile(authorizedUsersPath, 'utf8');
    let authorizedUsers = JSON.parse(data);
    const emailToDelete = req.body.email;

    if (!emailToDelete) {
      return res.status(400).send('Email is required.');
    }

    // Prevent user from deleting themselves
    if (emailToDelete.toLowerCase() === req.user.email.toLowerCase()) {
      return res.status(403).send('Cannot delete your own account.');
    }

    // Prevent deleting the primary admin (from .env)
    if (emailToDelete.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).send('Cannot delete the primary admin user.');
    }

    const initialLength = authorizedUsers.length;
    authorizedUsers = authorizedUsers.filter(u => u.email.toLowerCase() !== emailToDelete.toLowerCase());

    if (authorizedUsers.length === initialLength) {
      return res.status(404).send('User not found.');
    }

    await fsPromises.writeFile(authorizedUsersPath, JSON.stringify(authorizedUsers, null, 2));
    res.status(200).json(authorizedUsers);
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).send('Error deleting user.');
  }
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
