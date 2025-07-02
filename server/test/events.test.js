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

  it('should update an event', (done) => {
    const newEvent = {
      id: 1,
      title: 'Test Event',
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      createdBy: 'test@example.com'
    };
    fs.writeFile(dbPath, JSON.stringify({ events: [newEvent] }, null, 2), () => {
      const updatedEvent = { ...newEvent, title: 'Updated Test Event' };
      request(app)
        .put('/api/events/1')
        .send(updatedEvent)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.be.an('object');
          expect(res.body.title).to.equal('Updated Test Event');
          done();
        });
    });
  });

  it('should delete an event', (done) => {
    const newEvent = {
      id: 1,
      title: 'Test Event',
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      createdBy: 'test@example.com'
    };
    fs.writeFile(dbPath, JSON.stringify({ events: [newEvent] }, null, 2), () => {
      request(app)
        .delete('/api/events/1')
        .expect(204)
        .end((err, res) => {
          if (err) return done(err);
          fs.readFile(dbPath, 'utf8', (err, data) => {
            if (err) return done(err);
            const db = JSON.parse(data);
            expect(db.events).to.be.an('array').that.is.empty;
            done();
          });
        });
    });
  });
});
