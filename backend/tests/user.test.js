require('dotenv').config();

const supertest = require('supertest');
const app = require('../app');
const db = require('../utils/database');

const api = supertest(app);

beforeAll(async () => {
  db.query('DELETE FROM project;');
  db.query('DELETE FROM user;');
});

describe('Users can be created', () => {
  test('Valid user is inserted', async () => {
    // User doesn't already exist:
    expect((await api.get('/api/user/user')).statusCode).toBe(404);

    // POST the user to the API:
    const res = await api
      .post('/api/user')
      .send({ username: 'user', password: 'password', email: 'email@email.com' });
    expect(res.statusCode).toBe(201);

    // User is now present in database:
    expect((await api.get('/api/user/user')).statusCode).toBe(200);
  });

  test('Missing usernames are rejected', async () => {
    const res = await api
      .post('/api/user')
      .send({ password: 'password' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'No username provided' });
  });

  test('Missing passwords are rejected', async () => {
    const res = await api
      .post('/api/user')
      .send({ username: 'user' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'No password provided' });
  });
});

describe('Users can be retrieved by their username', () => {
  test('Valid ID', async () => {
    const res = await api.get('/api/user/user');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      username: 'user',
      biography: null,
      experience: 0,
      twitter: null,
      instagram: null,
      tiktok: null,
      youtube: null,
    });
  });

  test('Invalid ID', async () => {
    const res = await api.get('/api/user/non-existent');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'User does not exist' });
  });
});

describe('Users can follow each other', () => {
  test.todo('Can retrieve a user\'s followers');
  test.todo('A valid user can follow another');
  test.todo('A valid user can unfollow another');
  test.todo('Invalid user is rejected');
  test.todo('Cannot change following status without authorisation');
  test.todo('Cannot unfollow someone they are not following');
  test.todo('Cannot follow a user which does not exist');
});

// TODO for some reason the API seems to be staying open??
afterAll(() => {
  db.end();
});
