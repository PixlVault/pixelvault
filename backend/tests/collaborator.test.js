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

beforeAll(async () => {
  const [width, height] = [256, 256];
  const buf = Buffer.alloc(width * height * 4).fill(0);
  const img = { data: Array.from(buf), width, height };
  const compressed = LZString.compressToBase64(JSON.stringify(img));

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
      .send({ title, imageData: compressed })
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
    expect(res.body).toEqual({ error: 'Missing field: `username`' });
  });

  test('without specifying a project', async () => {
    const res = await api
      .post('/api/collaboration')
      .send({ username: 'recipient' })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Missing field: `projectId`' });
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

describe('Invitation interactions - users can', () => {
  test('invite a user to a project', async () => {
    let res = await api
      .post('/api/collaboration')
      .send({ projectId: projects[0], username: 'recipient' })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(201);

    res = await api
      .post('/api/collaboration')
      .send({ projectId: projects[1], username: 'recipient' })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(201);

    res = await api
      .post('/api/collaboration')
      .send({ projectId: projects[2], username: 'recipient' })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(201);

    res = await api
      .post('/api/collaboration')
      .send({ projectId: projects[0], username: 'thirdParty' })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(201);
  });

  test('accept an invitation', async () => {
    let res = await api
      .get('/api/collaboration/user')
      .set('Authorization', tokens.recipient);

    expect(res.body[0]).toMatchObject(
      { accepted: false, project_id: projects[0], username: 'recipient' },
    );

    res = await api
      .put('/api/collaboration')
      .send({ accepted: true, projectId: projects[0] })
      .set('Authorization', tokens.recipient);
    expect(res.statusCode).toBe(200);

    res = await api
      .get('/api/collaboration/user')
      .set('Authorization', tokens.recipient);

    expect(res.body[0]).toMatchObject(
      { accepted: true, project_id: projects[0], username: 'recipient' },
    );
  });

  test('decline an invitation', async () => {
    let res = await api
      .get('/api/collaboration/user')
      .set('Authorization', tokens.recipient);
    expect(res.body).toHaveLength(3);

    res = await api
      .delete('/api/collaboration')
      .send({ username: 'recipient', projectId: projects[2] })
      .set('Authorization', tokens.recipient);
    expect(res.statusCode).toBe(204);

    res = await api
      .get('/api/collaboration/user')
      .set('Authorization', tokens.recipient);
    expect(res.body).toHaveLength(2);
  });

  test('have access revoked by the project owner', async () => {
    let res = await api
      .get(`/api/collaboration/project/${projects[0]}`)
      .set('Authorization', tokens.creator);
    expect(res.body).toHaveLength(2);

    res = await api
      .delete('/api/collaboration')
      .send({ username: 'thirdParty', projectId: projects[0] })
      .set('Authorization', tokens.creator);

    expect(res.statusCode).toBe(204);

    res = await api
      .get(`/api/collaboration/project/${projects[0]}`)
      .set('Authorization', tokens.creator);
    expect(res.body).toHaveLength(1);
  });
});

describe('Invitations can be retrieved', () => {
  test('for a given project', async () => {
    const res = await api
      .get(`/api/collaboration/project/${projects[0]}`)
      .set('Authorization', tokens.creator);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject([
      { accepted: true, project_id: projects[0], username: 'recipient' },
    ]);
  });

  test('for a given user', async () => {
    const res = await api
      .get('/api/collaboration/user')
      .set('Authorization', tokens.recipient);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject([
      { accepted: true, project_id: projects[0], username: 'recipient' },
      { accepted: false, project_id: projects[1], username: 'recipient' },
    ]);
  });
});

describe('Invitations cannot be retrieved', () => {
  test('by non-owners of a given project', async () => {
    const res = await api
      .get(`/api/collaboration/project/${projects[0]}`)
      .set('Authorization', tokens.recipient);

    expect(res.statusCode).toBe(401);
    expect(res.body).toStrictEqual({ error: 'Cannot retrieve invitations for non-owned project' });
  });
});

describe('Invitations cannot be updated', () => {
  test('without logging in', async () => {
    let res = await api
      .put('/api/collaboration')
      .send({ accepted: true, projectId: projects[0] });

    expect(res.statusCode).toBe(401);
    expect(res.body).toStrictEqual({ error: 'Must be logged in' });

    res = await api
      .delete('/api/collaboration')
      .send({ username: 'recipient', projectId: projects[0] });

    expect(res.statusCode).toBe(401);
    expect(res.body).toStrictEqual({ error: 'Must be logged in' });
  });

  test('without providing the new status', async () => {
    const res = await api
      .put('/api/collaboration')
      .send({ projectId: projects[0] })
      .set('Authorization', tokens.recipient);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Missing field: `accepted`' });
  });

  test('without specifiying a project', async () => {
    const res = await api
      .put('/api/collaboration')
      .send({ accepted: true })
      .set('Authorization', tokens.recipient);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Missing field: `projectId`' });
  });

  test('by non-owner users besides the recipient', async () => {
    const res = await api
      .delete('/api/collaboration')
      .send({ username: 'recipient', projectId: projects[0] })
      .set('Authorization', tokens.thirdParty);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Only a project\'s owner can remove other users.' });
  });

  test('for deletion without specifying a user', async () => {
    const res = await api
      .delete('/api/collaboration')
      .send({ projectId: projects[0] })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Missing field: `username`' });
  });

  test('for deletion without specifying a projectId', async () => {
    const res = await api
      .delete('/api/collaboration')
      .send({ username: 'recipient' })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Missing field: `projectId`' });
  });

  test('when trying to remove a project\'s author', async () => {
    const res = await api
      .delete('/api/collaboration')
      .send({ username: 'creator', projectId: projects[0] })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Cannot remove a project\'s author' });
  });

  test('if the user tries to "unaccept" an invitation', async () => {
    const res = await api
      .put('/api/collaboration')
      .send({ accepted: false, projectId: projects[0], username: 'recipient' })
      .set('Authorization', tokens.recipient);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Invitation\'s accepted status can only be changed to `true`' });
  });
});

afterAll(() => {
  db.end();
});
