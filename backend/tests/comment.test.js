require('dotenv').config();

const supertest = require('supertest');
const app = require('../app');
const { db } = require('../utils/database');

const api = supertest(app);

// Some routes require authentication, so we must first log in and save
// the authentication token returned from the API.
const tokens = {};
let projects = [];
let comments = [];

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

  const posts = projects.map(
    (projectId) => api.post('/api/post')
      .send({ post_id: projectId })
      .set('Authorization', tokens.creator),
  );
  await Promise.all(posts);
});

describe('Comments can be', () => {
  test('added to a post', async () => {
    let res = await api.post('/api/comment')
      .send({ post_id: projects[0], content: 'Hello :)' })
      .set('Authorization', tokens.friend);

    comments.push(res.body.comment_id);

    expect(res.statusCode).toBe(201);

    res = await api.post('/api/post/search')
      .send({ post_id: projects[0] });
    expect(res.statusCode).toBe(200);
    expect(res.body[0].comments).toMatchObject([
      { content: 'Hello :)', likes: 0, author: 'friend' },
    ]);
  });

  test('liked by users', async () => {
    // Send a like to a comment:
    let res = await api.post('/api/comment/like')
      .send({ comment_id: comments[0] })
      .set('Authorization', tokens.friend);
    expect(res.statusCode).toBe(201);

    // Verify that it has been received:
    res = await api.post('/api/post/search')
      .send({ post_id: projects[0] });
    expect(res.statusCode).toBe(200);
    expect(res.body[0].comments).toMatchObject([
      { content: 'Hello :)', likes: 1, author: 'friend' },
    ]);

    // Do the same again:
    res = await api.post('/api/comment/like')
      .send({ comment_id: comments[0] })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(201);

    res = await api.post('/api/post/search')
      .send({ post_id: projects[0] });
    expect(res.statusCode).toBe(200);
    expect(res.body[0].comments).toMatchObject([
      { content: 'Hello :)', likes: 2, author: 'friend' },
    ]);
  });

  test('unliked by users', async () => {
    let res = await api.delete('/api/comment/like')
      .send({ comment_id: comments[0] })
      .set('Authorization', tokens.friend);
    expect(res.statusCode).toBe(204);

    res = await api.post('/api/post/search')
      .send({ post_id: projects[0] });
    expect(res.statusCode).toBe(200);
    expect(res.body[0].comments).toMatchObject([
      { content: 'Hello :)', likes: 1, author: 'friend' },
    ]);
  });

  test('deleted by their author', async () => {
    let res = await api.post('/api/post/search')
      .send({ post_id: projects[0] });
    expect(res.statusCode).toBe(200);
    const commentCount = res.body[0].comments.length;

    res = await api.post('/api/comment')
      .send({ post_id: projects[0], content: 'Hello Again' })
      .set('Authorization', tokens.friend);
    expect(res.statusCode).toBe(201);

    const commentId = res.body.comment_id;

    res = await api.post('/api/post/search')
      .send({ post_id: projects[0] });
    expect(res.statusCode).toBe(200);
    expect(res.body[0].comments).toHaveLength(commentCount + 1);

    res = await api.delete('/api/comment')
      .send({ comment_id: commentId })
      .set('Authorization', tokens.friend);
    expect(res.statusCode).toBe(204);

    res = await api.post('/api/post/search')
      .send({ post_id: projects[0] });
    expect(res.statusCode).toBe(200);
    expect(res.body[0].comments).toHaveLength(commentCount);
  });

  test('deleted only by their author', async () => {
    const res = await api.delete('/api/comment')
      .send({ comment_id: comments[0] })
      .set('Authorization', tokens.creator);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorised: Only the author of a comment can delete that comment' });
  });
});

describe('Comments cannot be altered without logging in', () =>{
  test('creation', async () => {
    const res = await api.post('/api/comment')
      .send({ post_id: projects[0], content: 'Hello :)' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Must be logged in' });
  });

  test('liking', async () => {
    const res = await api.post('/api/comment/like')
      .send({ comment_id: comments[0] });
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Must be logged in' });
  });

  test('unliking', async () => {
    const res = await api.delete('/api/comment/like')
      .send({ comment_id: comments[0] });
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Must be logged in' });
  });

  test('hiding', async () => {
    const res = await api.post('/api/comment/hide')
      .send({ comment_id: comments[0] });
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Must be logged in' });
  });

  test('unhiding', async () => {
    const res = await api.delete('/api/comment/hide')
      .send({ comment_id: comments[0] });
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Must be logged in' });
  });
});

describe('Comments can be hidden', () => {
  test.todo('by admins');

  test('but not by non-admins', async () => {
    const res = await api.post('/api/comment/hide')
      .send({ comment_id: comments[0] })
      .set('Authorization', tokens.friend);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorised: Non-admin users cannot hide or unhide a comment' });
  });
});

describe('Comments can be unhidden', () => {
  test.todo('by admins');

  test('but not by non-admins', async () => {
    const res = await api.delete('/api/comment/hide')
      .send({ comment_id: comments[0] })
      .set('Authorization', tokens.friend);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorised: Non-admin users cannot hide or unhide a comment' });
  });
});

afterAll(() => {
  db.end();
});
