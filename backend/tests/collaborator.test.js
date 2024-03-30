require('dotenv').config();

const supertest = require('supertest');
const app = require('../app');
const db = require('../utils/database');

const api = supertest(app);

// Some routes require authentication, so we must first log in and save
// the authentication token returned from the API.
const tokens = {}
let projects = [];

beforeAll(async () => {
  db.query('DELETE FROM project_invite;');
  db.query('DELETE FROM project;');
  db.query('DELETE FROM follow;');
  db.query('DELETE FROM user;');

  const users = ['creator', 'recipient', 'thirdParty'];

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

describe('Invitations cannot be sent', () => {
  test('without logging in', async () => {
    const res = await api
      .post('/api/collaboration')
      .send({ username: 'recipient', projectId: projects[0] });
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Must be logged in' });
  });

  test('without specifying a user', async () => {
    const res = await api
      .post('/api/collaboration')
      .send({ projectId: projects[0] })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Must provide a username' });
  });

  test('without specifying a project', async () => {
    const res = await api
      .post('/api/collaboration')
      .send({ username: 'recipient' })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Must provide a Project ID' });
  });

  test('to a non-existent user', async () => {
    const res = await api
      .post('/api/collaboration')
      .send({ username: 'nonExistent', projectId: projects[0] })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'User could not be found' });
  });

  test('to a project\'s owner', async () => {
    const res = await api
      .post('/api/collaboration')
      .send({ username: 'creator', projectId: projects[0] })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Cannot invite a user to a project they own' });
  });

  test('by non-owners of a project', async () => {
    const res = await api
      .post('/api/collaboration')
      .send({ username: 'otherUser', projectId: projects[0] })
      .set('Authorization', tokens.recipient);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Only a project\'s author can invite users' });
  });
});

describe('Invitations can be retrieved', () => {
  test.todo('for a given project');
  test.todo('only if a project ID is specified');
});

describe('Invitations can', () => {
  test.todo('be sent to a valid user');
  test.todo('be accepted by the recipient');
  test.todo('be declined by the recipient');
  test.todo('be revoked by the project owner');
});

describe('Invitations cannot be updated', () => {
  test.todo('without logging in');
  test.todo('without providing the new status');
  test.todo('without specifiying a project');
  test.todo('by any user besides the recipient');
  test.todo('if the user tries to "unaccept" an invitation');
});

afterAll(() => {
  db.end();
});
