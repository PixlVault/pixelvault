require('dotenv').config();

const supertest = require('supertest');
const app = require('../app');
const { db } = require('../utils/database');

const api = supertest(app);

beforeAll(async () => {
  db.query('DELETE FROM transaction;');
  db.query('DELETE FROM project_invite;');
  db.query('DELETE FROM project;');
  db.query('DELETE FROM follow;');
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

    await api
      .post('/api/user')
      .send({ username: 'otherUser', password: 'password', email: 'anotheremail@email.com' });

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

  test('Non-unique emails are rejected', async () => {
    const res = await api
      .post('/api/user')
      .send({ username: 'uniqueUser', password: 'password', email: 'email@email.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Email is already associated with an account' });
  });

  test('Usernames cannot be duplicated', async () => {
    const res = await api
      .post('/api/user')
      .send({ username: 'user', password: 'password', email: 'uniqueemail@email.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'User already exists' });
  });
});

describe('Users can be deleted', () => {
  test('only by their owner', async () => {
    await api.post('/api/user')
      .send({ username: 'toBeDeleted', password: 'password', email: 'gone@email.com' });

    let res = await api.post('/api/login')
      .send({ username: 'toBeDeleted', password: 'password' });

    const auth = `token ${res.body.token}`;

    res = await api.delete('/api/user').set('Authorization', auth);
    expect(res.statusCode).toBe(204);
  });
});

let bannedUserToken = null;
describe('Users can be banned', () => {
  test('not by non-admins', async () => {
    let res = await api.post('/api/login')
      .send({ username: 'user', password: 'password' });

    bannedUserToken = `token ${res.body.token}`;

    res = await api.post('/api/user/ban')
      .send({ username: 'user' })
      .set('Authorization', bannedUserToken);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Only admins can ban or unban users' });
  });

  test('by admins', async () => {
    let res = await api.post('/api/login')
      .send({ username: process.env.ROOT_USERNAME, password: process.env.ROOT_PASSWORD });

    const userAuth = `token ${res.body.token}`;

    res = await api.post('/api/user/ban')
      .send({ username: 'user' })
      .set('Authorization', userAuth);
    expect(res.statusCode).toBe(201);
  });
});

describe('Banned users cannot interact with the site', () => {
  test('Cannot log in', async () => {
    const res = await api.post('/api/login')
      .send({ username: 'user', password: 'password' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'User account has been banned' });
  });

  test('Cannot use existing valid token to bypass a ban', async () => {
    const res = await api.post('/api/project')
      .send({ title: 'some Title', imageData: null })
      .set('Authorization', bannedUserToken);
    expect(res.statusCode).toBe(401);
  });
});

describe('Users can be unbanned', () => {
  test('not by non-admins', async () => {
    let res = await api.post('/api/login')
      .send({ username: 'otherUser', password: 'password' });

    const userAuth = `token ${res.body.token}`;

    res = await api.delete('/api/user/ban')
      .send({ username: 'user' })
      .set('Authorization', userAuth);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Only admins can ban or unban users' });
  });

  test('by admins', async () => {
    let res = await api.post('/api/login')
      .send({ username: process.env.ROOT_USERNAME, password: process.env.ROOT_PASSWORD });

    const userAuth = `token ${res.body.token}`;

    res = await api.delete('/api/user/ban')
      .send({ username: 'user' })
      .set('Authorization', userAuth);
    expect(res.statusCode).toBe(204);
  });
});

describe('Users can become admin', () => {
  let adminToken;
  test('promoted by admin', async () => {
    let res = await api.post('/api/login')
      .send({ username: process.env.ROOT_USERNAME, password: process.env.ROOT_PASSWORD });
    adminToken = `token ${res.body.token}`;

    res = await api.post('/api/user/admin')
      .send({ username: 'user' })
      .set('Authorization', adminToken);
    expect(res.statusCode).toBe(201);
  });

  test('demoted by admin', async () => {
    const res = await api.delete('/api/user/admin')
      .send({ username: 'user' })
      .set('Authorization', adminToken);
    expect(res.statusCode).toBe(204);
  });

  test('cannot promote non-existent users', async () => {
    const res = await api.post('/api/user/admin')
      .send({ username: 'doesntexist' })
      .set('Authorization', adminToken);
    expect(res.statusCode).toBe(304);
  });

  test('non-admins cannot promote users', async () => {
    let res = await api.post('/api/login')
      .send({ username: 'user', password: 'password' });
    const userToken = `token ${res.body.token}`;

    res = await api.post('/api/user/admin')
      .send({ username: 'user' })
      .set('Authorization', userToken);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Not authorised to promote other users.' });
  });
});

describe('Accounts can be updated', () => {
  test('update own details', async () => {
    let res = await api.post('/api/login')
      .send({ username: 'user', password: 'password' });

    const token = res.body.token;

    // Change the password.
    res = await api
      .put('/api/user')
      .send({ username: 'user', password: 'newPassword' })
      .set('Authorization', `token ${token}`);
    expect(res.statusCode).toBe(200);

    // Try using it.
    res = await api
      .post('/api/login')
      .send({ username: 'user', password: 'newPassword' });
    expect(res.statusCode).toBe(200);

    // Change it back!
    res = await api
      .put('/api/user')
      .send({ username: 'user', password: 'password' })
      .set('Authorization', `token ${token}`);
    expect(res.statusCode).toBe(200);
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

// TODO for some reason the API seems to be staying open??
afterAll(() => {
  db.end();
});
