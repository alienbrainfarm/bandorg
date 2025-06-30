const request = require('supertest');
const { expect } = require('chai');
const path = require('path');
const fs = require('fs');
const app = require('../src/index'); // Import the actual app

const dbPath = path.join(__dirname, '../db.json');

describe('Events API', () => {
  beforeEach((done) => {
    // Clear the db.json before each test
    fs.writeFile(dbPath, JSON.stringify({ events: [] }, null, 2), done);
  });

  it('should get all events', (done) => {
    request(app)
      .get('/api/events')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.an('array').that.is.empty;
        done();
      });
  });

  it('should create a new event', (done) => {
    const newEvent = {
      title: 'Test Event',
      start: new Date().toISOString(),
      end: new Date().toISOString(),
    };

    request(app)
      .post('/api/events')
      .send(newEvent)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('id');
        expect(res.body.title).to.equal('Test Event');
        done();
      });
  });
});
