const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const authorizedUsersPath = path.join(__dirname, '../authorized_users.json');

module.exports = (app) => {
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

  app.use(passport.initialize());
  app.use(passport.session());

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
};
