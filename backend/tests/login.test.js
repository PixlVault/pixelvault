require('dotenv').config();

const supertest = require('supertest');
const app = require('../app');
const db = require('../utils/database');

const api = supertest(app);

beforeAll(async () => {
  db.query('DELETE FROM project_invite;');
  db.query('DELETE FROM project;');
  db.query('DELETE FROM follow;');
  db.query('DELETE FROM user;');

  await api.post('/api/user').send({
    username: 'user', password: 'password', email: 'email@email.com',
  });
});

describe('Users can log in', () => {
  test('Valid credentials accepted.', async () => {
    const res = await api
      .post('/api/login')
      .send({ username: 'user', password: 'password' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('Incorrect password is rejected.', async () => {
    const res = await api
      .post('/api/login')
      .send({ username: 'user', password: 'wrongPassword' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Invalid username or password provided' });
  });

  test('Missing username is rejected.', async () => {
    const res = await api
      .post('/api/login')
      .send({ password: 'password' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'No username provided' });
  });

  test('Missing password is rejected.', async () => {
    const res = await api
      .post('/api/login')
      .send({ username: 'user' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'No password provided' });
  });

  test('Non-existent user cannot sign in.', async () => {
    const res = await api
      .post('/api/login')
      .send({ username: 'doesnotexist', password: 'password' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Invalid username or password provided' });
  });
});

// TODO for some reason the API seems to be staying open??
afterAll(() => {
  db.end();
});
