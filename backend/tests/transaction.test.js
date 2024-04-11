require('dotenv').config();

const LZString = require('lz-string');
const supertest = require('supertest');
const app = require('../app');
const { db } = require('../utils/database');

const api = supertest(app);

// Some routes require authentication, so we must first log in and save
// the authentication token returned from the API.
const tokens = {};
let projects = [];
let transaction;

beforeAll(async () => {
  const [width, height] = [256, 256];
  const buf = Buffer.alloc(width * height * 4).fill(0);
  const img = { data: Array.from(buf), width, height };
  const compressed = LZString.compressToBase64(JSON.stringify(img));

  db.query('DELETE FROM transaction;');
  db.query('DELETE FROM project;');
  db.query('DELETE FROM user;');

  const users = ['creator', 'friend', 'other'];

  const userCreation = users.map((username) => api.post('/api/user')
    .send({ username, password: 'password', email: `${username}@email.com` }));
  await Promise.all(userCreation);

  const authStrings = users.map((username) => api.post('/api/login')
    .send({ username, password: 'password' })
    .then((res) => `token ${res.body.token}`));
  [tokens.creator, tokens.friend, tokens.other] = await Promise.all(authStrings);

  await api.post('/api/user/friend/following')
    .send({ followee: 'creator' })
    .set('Authorization', tokens.friend);

  projects = ['one', 'two', 'three'].map(
    (title) => api.post('/api/project')
      .send({ title, imageData: compressed })
      .set('Authorization', tokens.creator)
      .then((res) => res.body.projectId),
  );
  projects = await Promise.all(projects);

  const posts = projects.map(
    (projectId) => api.post('/api/post')
      .send({ post_id: projectId })
      .set('Authorization', tokens.creator),
  );
  await Promise.all(posts);
});

describe('Transactions can be created and updated', () => {
  test('valid purchase', async () => {
    let res = await api.post('/api/transaction')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.friend);
    expect(res.statusCode).toBe(201);
    transaction = res.body.transaction_id;

    res = await api.get('/api/transaction/user')
      .set('Authorization', tokens.friend);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test.todo('author cannot purchase their own post');
  test.todo('new status can be set');
});

describe('Transactions can be retrieved per-user', () => {
  test('for a logged-in user', async () => {
    const res = await api.get('/api/transaction/user')
      .set('Authorization', tokens.friend);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject([
      {
        post_id: projects[0],
        username: 'friend',
        status: 'complete',
      },
    ]);
  });

  test('not without logging in', async () => {
    const res = await api.get('/api/transaction/user');
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Must be logged in' });
  });
});

describe('Transactions can be retrieved per-post', () => {
  test('for a valid post', async () => {
    const res = await api.get(`/api/transaction/post/${projects[0]}`)
      .set('Authorization', tokens.creator);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject([
      {
        post_id: projects[0],
        username: 'friend',
        status: 'complete',
      },
    ]);
  });

  test('only by the author', async () => {
    const res = await api.get(`/api/transaction/post/${projects[0]}`)
      .set('Authorization', tokens.other);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorised to view transactions for this post' });
  });

  test('not for a non-existent post', async () => {
    const res = await api.get('/api/transaction/post/f5dc7fc0-e7a6-11ee-901d-49e4cea720ab')
      .set('Authorization', tokens.other);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Post does not exist' });
  });

  test('not without logging in', async () => {
    const res = await api.get(`/api/transaction/post/${projects[0]}`);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Must be logged in' });
  });
});

afterAll(() => {
  db.end();
});
