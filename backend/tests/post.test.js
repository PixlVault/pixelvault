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
  [tokens.creator, tokens.recipient, tokens.other] = await Promise.all(authStrings);

  projects = ['one', 'two', 'three'].map(
    (title) => api.post('/api/project')
      .send({ title, imageData: null })
      .set('Authorization', tokens.creator)
      .then((res) => res.body.projectId),
  );
  projects = await Promise.all(projects);
});

describe('Posts can be created', () => {
  test('from an existing project', async () => {
    let res = await api.post('/api/post')
      .send({ post_id: projects[0], cost: 1 })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(201);

    // Force posts to have different publication times
    await new Promise((resolve) => { setTimeout(resolve, 1000); });

    res = await api.post('/api/post')
      .send({ post_id: projects[1], cost: 7, licence: 'Creative Commons' })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(201);

    await new Promise((resolve) => { setTimeout(resolve, 1000); });

    res = await api.post('/api/post')
      .send({ post_id: projects[2] })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(201);
  });
});

describe('Posts can be searched', () => {
  test('by post ID', async () => {
    const res = await api.post('/api/post/search')
      .send({ post_id: projects[1] });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject([{
      post_id: projects[1],
      title: 'two',
      created_by: 'creator',
      licence: 'Creative Commons',
      cost: 7,
      artwork: null,
    }]);
  });

  test('not by an invalid ID', async () => {
    const res = await api.post('/api/post/search')
      .send({ post_id: 'f5dc7fc0-e7a6-11ee-901d-49e4cea720ab' });
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: "Post with id 'f5dc7fc0-e7a6-11ee-901d-49e4cea720ab' could not be found" });
  });

  test('by title', async () => {
    const res = await api.post('/api/post/search')
      .send({ title: 'one' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject([{
      post_id: projects[0],
      title: 'one',
      created_by: 'creator',
      licence: null,
      cost: 1,
      artwork: null,
    }]);
  });

  test('by author', async () => {
    let res = await api.post('/api/post/search')
      .send({ author: 'creator' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject([
      {
        post_id: projects[0],
        title: 'one',
        created_by: 'creator',
        licence: null,
        cost: 1,
        artwork: null,
      },
      {
        post_id: projects[1],
        title: 'two',
        created_by: 'creator',
        licence: 'Creative Commons',
        cost: 7,
        artwork: null,
      },
      {
        post_id: projects[2],
        title: 'three',
        created_by: 'creator',
        licence: null,
        cost: 0,
        artwork: null,
      },
    ]);

    res = await api.post('/api/post/search')
      .send({ author: 'other' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject([]);
  });

  test('by licence', async () => {
    const res = await api.post('/api/post/search')
      .send({ licence: 'Creative Commons' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject([{
      post_id: projects[1],
      title: 'two',
      created_by: 'creator',
      licence: 'Creative Commons',
      cost: 7,
      artwork: null,
    }]);
  });

  test('by cost range', async () => {
    let res = await api.post('/api/post/search')
      .send({ min_cost: 7, max_cost: 7 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject([{
      post_id: projects[1],
      title: 'two',
      created_by: 'creator',
      licence: 'Creative Commons',
      cost: 7,
      artwork: null,
    }]);

    res = await api.post('/api/post/search')
      .send({ min_cost: 0, max_cost: 7 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject([
      {
        post_id: projects[0],
        title: 'one',
        created_by: 'creator',
        licence: null,
        cost: 1,
        artwork: null,
      },
      {
        post_id: projects[1],
        title: 'two',
        created_by: 'creator',
        licence: 'Creative Commons',
        cost: 7,
        artwork: null,
      },
      {
        post_id: projects[2],
        title: 'three',
        created_by: 'creator',
        licence: null,
        cost: 0,
        artwork: null,
      },
    ]);

    res = await api.post('/api/post/search')
      .send({ min_cost: 0, max_cost: 0 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject([
      {
        post_id: projects[2],
        title: 'three',
        created_by: 'creator',
        licence: null,
        cost: 0,
        artwork: null,
      },
    ]);

    res = await api.post('/api/post/search')
      .send({ min_cost: 2, max_cost: 6 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test.todo('by multiple attributes');
  test.todo('by tag');
});

describe('Post queries can be sorted', () => {
  test.todo('by likes (most -> least)');

  test('by cost (ascending)', async () => {
    const res = await api.post('/api/post/search')
      .send({ order_by: 'cost' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject([
      {
        post_id: projects[2],
        title: 'three',
        created_by: 'creator',
        licence: null,
        cost: 0,
        artwork: null,
      },
      {
        post_id: projects[0],
        title: 'one',
        created_by: 'creator',
        licence: null,
        cost: 1,
        artwork: null,
      },
      {
        post_id: projects[1],
        title: 'two',
        created_by: 'creator',
        licence: 'Creative Commons',
        cost: 7,
        artwork: null,
      },
    ]);
  });

  test('by cost (descending)', async () => {
    const res = await api.post('/api/post/search')
      .send({ order_by: 'cost', ascending: false });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject([
      {
        post_id: projects[1],
        title: 'two',
        created_by: 'creator',
        licence: 'Creative Commons',
        cost: 7,
        artwork: null,
      },
      {
        post_id: projects[0],
        title: 'one',
        created_by: 'creator',
        licence: null,
        cost: 1,
        artwork: null,
      },
      {
        post_id: projects[2],
        title: 'three',
        created_by: 'creator',
        licence: null,
        cost: 0,
        artwork: null,
      },
    ]);
  });

  test('by publication date (oldest first)', async () => {
    const res = await api.post('/api/post/search')
      .send({ order_by: 'published_on' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject([
      {
        post_id: projects[0],
        title: 'one',
        created_by: 'creator',
        licence: null,
        cost: 1,
        artwork: null,
      },
      {
        post_id: projects[1],
        title: 'two',
        created_by: 'creator',
        licence: 'Creative Commons',
        cost: 7,
        artwork: null,
      },
      {
        post_id: projects[2],
        title: 'three',
        created_by: 'creator',
        licence: null,
        cost: 0,
        artwork: null,
      },
    ]);
  });

  test('by publication date (newest first)', async () => {
    const res = await api.post('/api/post/search')
      .send({ order_by: 'published_on', ascending: false });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject([
      {
        post_id: projects[2],
        title: 'three',
        created_by: 'creator',
        licence: null,
        cost: 0,
        artwork: null,
      },
      {
        post_id: projects[1],
        title: 'two',
        created_by: 'creator',
        licence: 'Creative Commons',
        cost: 7,
        artwork: null,
      },
      {
        post_id: projects[0],
        title: 'one',
        created_by: 'creator',
        licence: null,
        cost: 1,
        artwork: null,
      },
    ]);
  });
});

describe('Posts cannot be created', () => {
  test('by non-authors of a project', async () => {
    const res = await api.post('/api/post')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.other);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Cannot publish a non-owned project' });
  });
  test.todo('without an existing project');
  test.todo('without being logged in');
  test.todo('if a post already exists for a given project');
});

describe('Posts can be updated', () => {
  test.todo('change of tags');
});

describe('Posts can be removed', () => {
  test.todo('by the author');
  test.todo('by admins');
});

afterAll(() => {
  db.end();
});
