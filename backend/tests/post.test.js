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
  [tokens.creator, tokens.friend, tokens.other] = await Promise.all(authStrings);

  await api.post('/api/user/friend/following')
    .send({ followee: 'creator' })
    .set('Authorization', tokens.friend);

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
      .send({ post_id: projects[0], cost: 1, tags: ['tag1', 'tag2'] })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(201);

    // Force posts to have different publication times
    await new Promise((resolve) => { setTimeout(resolve, 1000); });

    res = await api.post('/api/post')
      .send({
        post_id: projects[1], cost: 7, licence: 'Creative Commons', tags: ['tag2'],
      })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(201);

    await new Promise((resolve) => { setTimeout(resolve, 1000); });

    res = await api.post('/api/post')
      .send({ post_id: projects[2], tags: ['tag1'] })
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

  test('by tag', async () => {
    const res = await api.post('/api/post/search')
      .send({ tags: ['tag1'] });

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
        post_id: projects[2],
        title: 'three',
        created_by: 'creator',
        licence: null,
        cost: 0,
        artwork: null,
      },
    ]);
  });

  test('by multiple attributes', async () => {
    const res = await api.post('/api/post/search')
      .send({
        title: 'one', tags: ['tag1'], min_cost: 0, max_cost: 1, author: 'creator',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body).toMatchObject([
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

  test('from followed accounts', async () => {
    const res = await api.post('/api/post/search')
      .send({ only_show_followed: true })
      .set('Authorization', tokens.friend);

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

  test('without an existing project', async () => {
    const res = await api.post('/api/post')
      .send({ post_id: 'f5dc7fc0-e7a6-11ee-901d-49e4cea720ab' })
      .set('Authorization', tokens.other);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'No such project exists' });
  });

  test('without being logged in', async () => {
    const res = await api.post('/api/post')
      .send({ post_id: projects[0] });

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Must be logged in' });
  });

  test('if a post already exists for a given project', async () => {
    const res = await api.post('/api/post')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.creator);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Post already exists for this project' });
  });
});

describe('posts can be updated', () => {
  test('tags can be set for a post', async () => {
    let res = await api.put('/api/post')
      .send({ post_id: projects[0], tags: ['tag1', 'tag3'] })
      .set('Authorization', tokens.creator);

    expect(res.statusCode).toBe(200);

    res = await api.post('/api/post/search')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.creator);

    expect(res.body).toMatchObject([{
      post_id: projects[0],
      tags: ['tag1', 'tag3'],
    }]);
  });

  test('only existing posts can be updated', async () => {
    const res = await api.post('/api/post')
      .send({ post_id: 'f5dc7fc0-e7a6-11ee-901d-49e4cea720ab' })
      .set('Authorization', tokens.other);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'No such project exists' });
  });

  test('non-author users cannot update a post', async () => {
    const res = await api.put('/api/post')
      .send({ post_id: projects[0], tags: ['tag1', 'tag3'] })
      .set('Authorization', tokens.other);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Cannot update a non-owned project' });
  });
});

describe('Posts can be liked', () => {
  test.todo('by other users');
  test.todo('and unliked');
});

describe('Posts can be hidden', () => {
  test('by the author', async () => {
    let res = await api.post('/api/post/hidden')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(200);

    res = await api.post('/api/post/search')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.creator);

    expect(res.body[0].is_hidden).toBe(1);
  });

  test.todo('by admins');
  test.todo('but not by non-admin, non-owners');
  test.todo('if hidden by an admin, cannot be unhidden by the owner');
});

afterAll(() => {
  db.end();
});
