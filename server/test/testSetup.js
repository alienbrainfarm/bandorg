const fs = require('fs');
const path = require('path');
const authorizedUsersPath = path.join(__dirname, '../authorized_users.json');



// This function will be called before each test suite
before(() => {
  process.env.NODE_ENV = 'test'; // Ensure NODE_ENV is set to test
});

// This function will be called before each test
beforeEach((done) => {
  // Ensure authorized_users.json is always valid for tests
  const initialUsers = [{ email: 'admin@example.com', isAdmin: true }, { email: 'user@example.com', isAdmin: false }];
  fs.writeFile(authorizedUsersPath, JSON.stringify(initialUsers, null, 2), (err) => {
    if (err) return done(err);
    done();
  });
});



module.exports = {
  authorizedUsersPath
};