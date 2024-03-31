require('dotenv').config();

const supertest = require('supertest');
const app = require('../app');
const { db } = require('../utils/database');

const api = supertest(app);

// Some routes require authentication, so we must first log in and save
// the authentication token returned from the API.
const tokens = {};
let projects = [];

beforeAll(async () => {
  db.query('DELETE FROM project;');
  db.query('DELETE FROM user;');

  const users = ['creator', 'friend', 'other'];

  const userCreation = users.map((username) => api.post('/api/user')
    .send({ username, password: 'password', email: `${username}@email.com` }));
  await Promise.all(userCreation);

  const authStrings = users.map((username) => api.post('/api/login')
    .send({ username, password: 'password' })
    .then((res) => `token ${res.body.token}`));
  [tokens.creator, tokens.recipient, tokens.thirdParty] = await Promise.all(authStrings);

  projects = ['one', 'two', 'three'].map(
    (title) => api.post('/api/project')
      .send({ title, imageData: null })
      .set('Authorization', tokens.creator)
      .then((res) => res.body.projectId),
  );
  projects = await Promise.all(projects);
});

describe('Posts can be created', () => {
  test('not by non-authors', async () => {
    const res = await api.post('/api/post')
      .send({ projectId: projects[0] })
      .set('Authorization', tokens.other);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Not authorised to publish this project' });
  });

  test('from an existing project', async () => {
    let res = await api.post('/api/post')
      .send({ projectId: projects[0] })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(201);

    res = await api.post('/api/post')
      .send({ projectId: projects[1] })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(201);

    res = await api.post('/api/post')
      .send({ projectId: projects[2] })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(201);
  });
});

describe('Posts can be searched', () => {
  test.todo('by title');
  test.todo('by author');
  test.todo('by tag');
  test.todo('by licence');
  test.todo('by cost (between x and y)');
  test.todo('by multiple attributes');
});

describe('Post queries can be sorted', () => {
  test.todo('by likes (most -> least)');
  test.todo('by cost  (most -> least)');
  test.todo('by cost  (least -> most)');
  test.todo('by publication date (oldest -> newest)');
  test.todo('by publication date (newest -> oldest)');
});

describe('Post details can be retrieved', () => {
  test.todo('by id');
});

describe('Posts cannot be created', () => {
  test.todo('without an existing project');
  test.todo('by a non-author of a project');
  test.todo('without being logged in');
});

describe('Posts can be updated', () => {
  test.todo('change of tags');
})

describe('Posts can be removed', () => {
  test.todo('by the author');
  test.todo('by admins');
})

afterAll(() => {
  db.end();
});

// TODO:
// - User, delete account
// - Admin, delete user
// - Admin, delete...