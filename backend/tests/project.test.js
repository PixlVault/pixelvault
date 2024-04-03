require('dotenv').config();

const supertest = require('supertest');
const app = require('../app');
const { db } = require('../utils/database');

const api = supertest(app);

// Some routes require authentication, so we must first log in and save
// the authentication token returned from the API.
let userToken;
let friendToken;
let foeToken;

// Note: We can't know what the project ID will be ahead of time,
// so we get this from the 'creation' test, and then use this in
// later tests.
let newProjectId;

beforeAll(async () => {
  db.query('DELETE FROM transaction;');
  db.query('DELETE FROM project;');
  db.query('DELETE FROM follow;');
  db.query('DELETE FROM user;');

  await api
    .post('/api/user')
    .send({ username: 'user', password: 'password', email: 'user@email.com' });

  await api
    .post('/api/user')
    .send({ username: 'friend', password: 'password', email: 'friend@email.com' });

  await api
    .post('/api/user')
    .send({ username: 'foe', password: 'password', email: 'foe@email.com' });

  let res = await api
    .post('/api/login')
    .send({ username: 'user', password: 'password' });
  userToken = `token ${res.body.token}`;

  res = await api
    .post('/api/login')
    .send({ username: 'friend', password: 'password' });
  friendToken = `token ${res.body.token}`;

  res = await api
    .post('/api/login')
    .send({ username: 'foe', password: 'password' });
  foeToken = `token ${res.body.token}`;
});

describe('Projects can be created', () => {
  test('Valid project is created', async () => {
    // POST the project to the API:
    const res = await api
      .post('/api/project')
      .set('Authorization', userToken)
      .send({ title: 'For lack of a better name', imageData: [] });

    expect(res.statusCode).toBe(201);
    newProjectId = res.body.projectId;

    // Project is now present in database:
    expect(
      (await api.get(`/api/project/${newProjectId}`).set('Authorization', userToken)).statusCode,
    ).toBe(200);
  });

  test('Missing project title gets rejected', async () => {
    const res = await api
      .post('/api/project')
      .set('Authorization', userToken)
      .send({ });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'No project title provided' });
  });

  test('Logged out users cannot create a project.', async () => {
    const res = await api
      .post('/api/project')
      .send({ title: 'For lack of a better name' });

    expect(res.statusCode).toBe(401);
  });
});

describe('Project details can be retrieved', () => {
  test('using a valid Project ID', async () => {
    const res = await api
      .get(`/api/project/${newProjectId}`)
      .set('Authorization', userToken);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({
      project_id: newProjectId,
      title: 'For lack of a better name',
      created_by: 'user',
    }));
  });

  test('according to their author', async () => {
    const res = await api
      .get('/api/project/createdBy/user')
      .set('Authorization', userToken);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject([{
      project_id: newProjectId,
      title: 'For lack of a better name',
      created_by: 'user',
    }]);
  });
});

describe('Project details cannot be retrieved', () => {
  test('using an invalid ID format', async () => {
    const res = await api
      .get('/api/project/12345')
      .set('Authorization', userToken);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid Project ID provided' });
  });

  test('by a non-collaborator user', async () => {
    const res = await api
      .get(`/api/project/${newProjectId}`)
      .set('Authorization', foeToken);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Non-collaborators cannot retrieve project details' });
  });

  test('for a non-existent project', async () => {
    const res = await api
      .get('/api/project/f5dc7fc0-e7a6-11ee-901d-49e4cea720ab')
      .set('Authorization', userToken);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Project does not exist' });
  });
});

describe('Projects can be updated', () => {
  test('Project Title can be updated', async () => {
    let res = await api
      .put(`/api/project/${newProjectId}`)
      .set('Authorization', userToken)
      .send({ title: 'New Title!' });

    expect(res.statusCode).toBe(200);

    res = await api
      .get(`/api/project/${newProjectId}`)
      .set('Authorization', userToken);

    expect(res.body.title).toBe('New Title!');
  });

  test('Unauthorised user cannot update a project\'s details', async () => {
    let res = await api
      .put(`/api/project/${newProjectId}`)
      .send({ title: 'Some other title :(' })
      .set('Authorization', foeToken);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Not authorised to edit this project' });

    res = await api
      .get(`/api/project/${newProjectId}`)
      .set('Authorization', userToken);

    expect(res.body.title).toBe('New Title!');
  });

  test('Collaborators can update a project\'s details', async () => {
    await api
      .post('/api/collaboration')
      .send({ projectId: newProjectId, username: 'friend' })
      .set('Authorization', userToken);

    await api
      .put('/api/collaboration')
      .send({ username: 'friend', projectId: newProjectId, accepted: true })
      .set('Authorization', friendToken);

    let res = await api
      .put(`/api/project/${newProjectId}`)
      .send({ title: 'A different title!' })
      .set('Authorization', friendToken);

    expect(res.statusCode).toBe(200);

    res = await api
      .get(`/api/project/${newProjectId}`)
      .set('Authorization', friendToken);

    expect(res.body.title).toBe('A different title!');
  });
});

describe('Projects can be deleted', () => {
  test('Non-owners cannot delete a project', async () => {
    const res = await api
      .delete(`/api/project/${newProjectId}`)
      .set('Authorization', friendToken);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'User does not have permission to delete this project' });
  });

  test('logged out users cannot delete a project', async () => {
    const res = await api
      .delete(`/api/project/${newProjectId}`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Must be logged in' });
  });

  test('Valid deletion request', async () => {
    const res = await api
      .delete(`/api/project/${newProjectId}`)
      .set('Authorization', userToken);

    expect(res.statusCode).toBe(204);
  });

  test('Non-existent project cannot be deleted', async () => {
    const res = await api
      .delete('/api/project/f5dc7fc0-e7a6-11ee-901d-49e4cea720ab')
      .set('Authorization', userToken);

    expect(res.statusCode).toBe(404);
    expect(res.body).toStrictEqual({ error: 'Project could not be found' });
  });

  test('Invalid UUID is rejected', async () => {
    const res = await api
      .delete('/api/project/f5dc7fc0-e7a6-11ee-901d-49e4cea720abX')
      .set('Authorization', userToken);

    expect(res.statusCode).toBe(400);
    expect(res.body).toStrictEqual({ error: 'Invalid Project ID provided' });
  });
});

afterAll(() => {
  db.end();
});
