require('dotenv').config();

const supertest = require('supertest');
const app = require('../app');
const { db } = require('../utils/database');
const LZString = require('lz-string');

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
});

describe('Posts can be created', () => {
  test('from an existing project', async () => {
    let res = await api.post('/api/post')
      .send({ post_id: projects[0], tags: ['tag1', 'tag2'] })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(201);

    // Force posts to have different publication times
    await new Promise((resolve) => { setTimeout(resolve, 1000); });

    res = await api.post('/api/post')
      .send({
        post_id: projects[1], licence: 'Creative Commons', tags: ['tag2'],
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

describe('Posts can be deleted', () => {
  test('published project', async () => {
    const [width, height] = [256, 256];
    const buf = Buffer.alloc(width * height * 4).fill(0);
    const img = { data: Array.from(buf), width, height };
    const compressed = LZString.compressToBase64(JSON.stringify(img));

    let res = await api.post('/api/project')
      .send({ title: 'delete me!', imageData: compressed })
      .set('Authorization', tokens.creator);

    const pid = res.body.projectId;

    // Publish project
    await api.post('/api/post')
      .send({ post_id: pid })
      .set('Authorization', tokens.creator);

    // Verify success.
    res = await api.post('/api/post/search/')
      .send({ post_id: pid });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);

    // Delete post.
    res = await api.delete('/api/post')
      .send({ post_id: pid })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(204);

    // Verify deletion.
    res = await api.post('/api/post/search/')
      .send({ post_id: pid });
    expect(res.statusCode).toBe(404);
  });
});

describe('Posts can be liked', () => {
  test('by users', async () => {
    let res = await api.post('/api/post/likes')
      .send({ post_id: projects[1] })
      .set('Authorization', tokens.other);
    expect(res.statusCode).toBe(200);

    res = await api.post('/api/post/likes')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.other);
    expect(res.statusCode).toBe(200);

    res = await api.post('/api/post/likes')
      .send({ post_id: projects[1] })
      .set('Authorization', tokens.friend);
    expect(res.statusCode).toBe(200);

    res = await api.post('/api/post/search/')
      .send({ author: 'creator' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject([
      { likes: 1 },
      { likes: 2 },
      { likes: 0 },
    ]);
  });

  test('and unliked', async () => {
    let res = await api.delete('/api/post/likes')
      .send({ post_id: projects[1] })
      .set('Authorization', tokens.other);
    expect(res.statusCode).toBe(200);

    res = await api.post('/api/post/search/')
      .send({ project_id: projects[1] });
    expect(res.statusCode).toBe(200);
    expect(res.body[0].likes).toBe(1);
  });

  test('liking the same post twice has no effect', async () => {
    let res = await api.post('/api/post/likes')
      .send({ post_id: projects[1] })
      .set('Authorization', tokens.other);
    expect(res.statusCode).toBe(200);

    res = await api.post('/api/post/search/')
      .send({ project_id: projects[1] });
    const likeCount = res.body[0].likes;

    res = await api.post('/api/post/likes')
      .send({ post_id: projects[1] })
      .set('Authorization', tokens.other);
    expect(res.statusCode).toBe(200);

    res = await api.post('/api/post/search/')
      .send({ project_id: projects[1] });
    expect(res.body[0].likes).toBe(likeCount);
  });

  test('unliking the same post twice has no effect', async () => {
    let res = await api.delete('/api/post/likes')
      .send({ post_id: projects[1] })
      .set('Authorization', tokens.other);
    expect(res.statusCode).toBe(200);

    res = await api.post('/api/post/search/')
      .send({ project_id: projects[1] });
    const likeCount = res.body[0].likes;

    res = await api.delete('/api/post/likes')
      .send({ post_id: projects[1] })
      .set('Authorization', tokens.other);
    expect(res.statusCode).toBe(200);

    res = await api.post('/api/post/search/')
      .send({ project_id: projects[1] });
    expect(res.body[0].likes).toBe(likeCount);
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
      },
      {
        post_id: projects[1],
        title: 'two',
        created_by: 'creator',
        licence: 'Creative Commons',
      },
      {
        post_id: projects[2],
        title: 'three',
        created_by: 'creator',
        licence: null,
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
    }]);
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
      },
      {
        post_id: projects[2],
        title: 'three',
        created_by: 'creator',
        licence: null,
      },
    ]);
  });

  test('by multiple attributes', async () => {
    const res = await api.post('/api/post/search')
      .send({
        title: 'one', tags: ['tag1'], author: 'creator',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body).toMatchObject([
      {
        post_id: projects[0],
        title: 'one',
        created_by: 'creator',
        licence: null,
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
      },
      {
        post_id: projects[1],
        title: 'two',
        created_by: 'creator',
        licence: 'Creative Commons',
      },
      {
        post_id: projects[2],
        title: 'three',
        created_by: 'creator',
        licence: null,
      },
    ]);
  });
});

describe('Post queries can be sorted', () => {
  test('by likes (descending)', async () => {
    const res = await api.post('/api/post/search')
      .send({ order_by: 'likes', ascending: false });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject([
      {
        post_id: projects[0],
        likes: 1,
      },
      {
        post_id: projects[1],
        likes: 1,
      },
      {
        post_id: projects[2],
        likes: 0,
      },
    ]);
  });

  test('by likes (ascending)', async () => {
    const res = await api.post('/api/post/search')
      .send({ order_by: 'likes', ascending: true });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject([
      {
        post_id: projects[2],
        likes: 0,
      },
      {
        post_id: projects[0],
        likes: 1,
      },
      {
        post_id: projects[1],
        likes: 1,
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
      },
      {
        post_id: projects[1],
        title: 'two',
        created_by: 'creator',
        licence: 'Creative Commons',
      },
      {
        post_id: projects[2],
        title: 'three',
        created_by: 'creator',
        licence: null,
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
      },
      {
        post_id: projects[1],
        title: 'two',
        created_by: 'creator',
        licence: 'Creative Commons',
      },
      {
        post_id: projects[0],
        title: 'one',
        created_by: 'creator',
        licence: null,
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

describe('Posts can be hidden/unhidden', () => {
  test('by the author', async () => {
    let res = await api.post('/api/post/hide')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(201);

    res = await api.post('/api/post/search')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(404);

    res = await api.delete('/api/post/hide')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(204);

    res = await api.post('/api/post/search')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.creator);
    expect(res.body[0].is_hidden).toBe(0);
  });

  test('by admins', async () => {
    let res = await api.post('/api/login')
      .send({ username: process.env.ROOT_USERNAME, password: process.env.ROOT_PASSWORD });
    tokens.admin = `token ${res.body.token}`;

    res = await api.post('/api/post/hide')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.admin);
    expect(res.statusCode).toBe(201);

    res = await api.delete('/api/post/hide')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.admin);
    expect(res.statusCode).toBe(204);
  });

  test('Only admins can view hidden posts', async () => {
    let res = await api.post('/api/post/hide')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.admin);
    expect(res.statusCode).toBe(201);

    res = await api.post('/api/post/search')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.admin);
    expect(res.statusCode).toBe(200);
    expect(res.body[0].is_hidden).toBe(1);

    res = await api.post('/api/post/search')
      .send({ title: 'one' })
      .set('Authorization', tokens.admin);
    expect(res.statusCode).toBe(200);
    expect(res.body[0].is_hidden).toBe(1);

    res = await api.post('/api/post/search')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(404);

    res = await api.post('/api/post/search')
      .send({ title: 'one' })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(0);

    res = await api.delete('/api/post/hide')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.admin);
    expect(res.statusCode).toBe(204);
  });

  test('but not by non-admin, non-owners', async () => {
    let res = await api.post('/api/post/hide')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.other);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Cannot un/hide a non-owned post' });

    res = await api.delete('/api/post/hide')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.other);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Cannot un/hide a non-owned post' });
  });

  test('if hidden by an admin, cannot be changed by the owner', async () => {
    let res = await api.post('/api/post/hide')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.admin);
    expect(res.statusCode).toBe(201);

    res = await api.delete('/api/post/hide')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(401);

    res = await api.post('/api/post/hide')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(401);

    res = await api.delete('/api/post/hide')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.admin);
    expect(res.statusCode).toBe(204);
  });

  test('if hidden by an owner, cannot be unhidden by an admin', async () => {
    let res = await api.post('/api/post/hide')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(201);

    res = await api.delete('/api/post/hide')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.admin);
    expect(res.statusCode).toBe(401);

    // Cleanup:
    res = await api.delete('/api/post/hide')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(204);
  });
});

describe('Liked posts can be', () => {
  test('fetched for a particular user', async () => {
    let res = await api.post('/api/post/likes')
      .send({ post_id: projects[0] })
      .set('Authorization', tokens.other);
    expect(res.statusCode).toBe(200);

    res = await api.post('/api/post/likes')
      .send({ post_id: projects[1] })
      .set('Authorization', tokens.other);
    expect(res.statusCode).toBe(200);

    res = await api.get('/api/post/other/liked')
      .send();
    expect(res.statusCode).toBe(200);

    const ids = res.body.map((p) => p.post_id);
    ids.sort();

    const expectation = [projects[0], projects[1]];
    expectation.sort();

    expect(ids).toEqual(expectation);
  });
});

afterAll(() => {
  db.end();
});
