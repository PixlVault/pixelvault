require('dotenv').config();

const supertest = require('supertest');
const app = require('../app');
const db = require('../utils/database');

const api = supertest(app);

// Some routes require authentication, so we must first log in and save
// the authentication token returned from the API.
let authToken;

// Note: We can't know what the project ID will be ahead of time,
// so we get this from the 'creation' test, and then use this in
// later tests.
let newProjectId;

beforeAll(async () => {
  db.query('DELETE FROM project;');

  const res = await api
    .post('/login')
    .send({ username: 'user', password: 'password' });

  authToken = `token ${res.body.token}`;
});

describe('Projects can be created', () => {
  test('Valid project is created', async () => {
    // POST the project to the API:
    const res = await api
      .post('/project')
      .set('Authorization', authToken)
      .send({ title: 'For lack of a better name', imageData: [] });

    expect(res.statusCode).toBe(201);
    newProjectId = res.body.projectId;

    // Project is now present in database:
    expect(
      (await api.get(`/project/${newProjectId}`).set('Authorization', authToken)).statusCode,
    ).toBe(200);
  });

  test('Missing project title gets rejected', async () => {
    const res = await api
      .post('/project')
      .set('Authorization', authToken)
      .send({ });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'No project title provided' });
  });

  test('Logged out users cannot create a project.', async () => {
    const res = await api
      .post('/project')
      .send({ title: 'For lack of a better name' });

    expect(res.statusCode).toBe(401);
  });
});

describe('Project details can be retrieved via their Project ID', () => {
  test('Valid ID', async () => {
    const res = await api
      .get(`/project/${newProjectId}`)
      .set('Authorization', authToken);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({
      project_id: newProjectId,
      title: 'For lack of a better name',
      created_by: 'user',
    }));
  });

  test('Invalid ID Format is rejected', async () => {
    const res = await api
      .get('/project/12345')
      .set('Authorization', authToken);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid Project ID provided' });
  });

  test('Non-existent project', async () => {
    const res = await api
      .get('/project/f5dc7fc0-e7a6-11ee-901d-49e4cea720ab')
      .set('Authorization', authToken);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Project does not exist' });
  });
});

describe('Projects can be updated', () => {
  test('Project Title can be updated', async () => {
    let res = await api
      .put(`/project/${newProjectId}`)
      .set('Authorization', authToken)
      .send({ projectData: { title: 'New Title!' } });

    expect(res.statusCode).toBe(200);

    res = await api
      .get(`/project/${newProjectId}`)
      .set('Authorization', authToken);

    expect(res.body.title).toBe('New Title!');
  });

  test('Unauthorised user cannot update a project\'s details', async () => {
    let res = await api
      .put(`/project/${newProjectId}`)
      .send({ projectData: { title: 'Some other title :(' } });

    expect(res.statusCode).toBe(401);

    res = await api
      .get(`/project/${newProjectId}`)
      .set('Authorization', authToken);

    expect(res.body.title).toBe('New Title!');
  });

  test.todo('Collaborators can update a project\'s details');
});

describe('Projects can be deleted', () => {
  test.todo('Non-owners cannot delete a project');

  test('Valid deletion request', async () => {
    const res = await api
      .delete(`/project/${newProjectId}`)
      .set('Authorization', authToken);

    expect(res.statusCode).toBe(204);
  });

  test('Non-existent project cannot be deleted', async () => {
    const res = await api
      .delete('/project/f5dc7fc0-e7a6-11ee-901d-49e4cea720ab')
      .set('Authorization', authToken);

    expect(res.statusCode).toBe(404);
    expect(res.body).toStrictEqual({ error: 'Project could not be found' });
  });

  test('Invalid UUID is rejected', async () => {
    const res = await api
      .delete('/project/f5dc7fc0-e7a6-11ee-901d-49e4cea720abX')
      .set('Authorization', authToken);

    expect(res.statusCode).toBe(400);
    expect(res.body).toStrictEqual({ error: 'Invalid Project ID provided' });
  });
});

afterAll(() => {
  db.end();
});
