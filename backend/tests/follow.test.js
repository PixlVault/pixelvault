require('dotenv').config();

const supertest = require('supertest');
const app = require('../app');
const db = require('../utils/database');

const api = supertest(app);

let auth = null;

beforeAll(async () => {
  db.query('DELETE FROM project_invite;');
  db.query('DELETE FROM project;');
  db.query('DELETE FROM follow;');
  db.query('DELETE FROM user;');

  await api.post('/api/user').send({
    username: 'user', password: 'password', email: 'email@email.com',
  });

  const res = await api
    .post('/api/login')
    .send({ username: 'user', password: 'password' });
  auth = `token ${res.body.token}`;

  await api.post('/api/user').send({
    username: 'otherUser', password: 'password', email: 'otherEmail@email.com',
  });
});

describe('Users can follow each other', () => {
  test('A valid user can follow another', async () => {
    const res = await api
      .post('/api/user/user/following')
      .set('Authorization', auth)
      .send({ followee: 'otherUser' });

    expect(res.statusCode).toBe(201);
  });

  test('Cannot change following status without authorisation', async () => {
    const res = await api
      .post('/api/user/user/following')
      .send({ followee: 'otherUser' });

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Not logged in' });
  });

  test('Cannot follow non-existent user', async () => {
    const res = await api
      .post('/api/user/user/following')
      .set('Authorization', auth)
      .send({ followee: 'nonExistent' });

    expect(res.statusCode).toBe(400);
  });

  test('A user cannot follow themselves', async () => {
    const res = await api
      .post('/api/user/user/following')
      .set('Authorization', auth)
      .send({ followee: 'user' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'User cannot follow itself' });
  });

  test('Can retrieve a user\'s followers', async () => {
    const res = await api.get('/api/user/user/following');
    expect(res.body).toEqual(['otherUser']);
  });

  test('A valid user can unfollow another', async () => {
    const res = await api
      .delete('/api/user/user/following')
      .set('Authorization', auth)
      .send({ followee: 'otherUser' });

    expect(res.statusCode).toBe(201);
  });
});

afterAll(() => {
  db.end();
});
