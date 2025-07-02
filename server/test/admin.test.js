const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/index'); // Import the actual app
const { authorizedUsersPath } = require('./testSetup');
const fs = require('fs');

describe('Admin API', () => {
  beforeEach((done) => {
    // Clear and re-initialize authorized_users.json before each test
    fs.writeFileSync(authorizedUsersPath, JSON.stringify([{ email: 'admin@example.com', isAdmin: true }, { email: 'user@example.com', isAdmin: false }]));
    done();
  });

  it('should get all users', (done) => {
    const agent = request.agent(app);
    agent.get('/api/admin/users')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.an('array').with.lengthOf(2);
        done();
      });
  });

  it('should add a new user', (done) => {
    const newUser = { email: 'new@example.com', isAdmin: false };
    const agent = request.agent(app);
    agent.post('/api/admin/users')
      .send(newUser)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.an('array').with.lengthOf(3);
        done();
      });
  });

  it('should update a user to be an admin', (done) => {
    const updatedUser = { email: 'user@example.com', isAdmin: true };
    const agent = request.agent(app);
    agent.put('/api/admin/users')
      .send(updatedUser)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        const updatedUserFromFile = res.body.find(u => u.email === 'user@example.com');
        expect(updatedUserFromFile.isAdmin).to.be.true;
        done();
      });
  });

  it('should delete a user', (done) => {
    const userToDelete = { email: 'user@example.com' };
    request(app)
      .delete('/api/admin/users')
      .send(userToDelete)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.an('array').with.lengthOf(1);
        done();
      });
  });

  it('should not delete the primary admin', (done) => {
    const userToDelete = { email: 'admin@example.com' };
    process.env.ADMIN_EMAIL = 'admin@example.com';
    request(app)
      .delete('/api/admin/users')
      .send(userToDelete)
      .expect(403)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
});
