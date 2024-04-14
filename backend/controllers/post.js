const express = require('express');

const log = require('../utils/logger');
const Post = require('../models/post');
const Project = require('../models/project');

const router = express.Router();

const removeSensitiveData = (post) => {
  delete post.hidden_by;
  delete post.project_id;
  return post;
};

// POST for resource retrieval isn't entirely appropriate for a RESTful API,
// but given GET requests do not have a request body we cannot avoid this.
router.post('/search', async (req, res) => {
  try {
    if (req.body.post_id !== undefined) {
      const post = (await Post.getById(req.body.post_id))
        .map((p) => removeSensitiveData(p));

      if (post.length === 0) {
        return res.status(404).json({ error: `Post with id '${req.body.post_id}' could not be found` });
      }
      return res.status(200).json(post);
    }

    let username;
    if (req.body.only_show_followed === true) {
      if (req.token === undefined) {
        return res.status(400).json({ error: 'Cannot return results from followed accounts if user is not signed in.' });
      }
      username = req.token.username;
    }

    const posts = (await Post.search(
      username,
      req.body.author,
      req.body.licence,
      req.body.order_by,
      req.body.ascending !== false,
      req.body.only_show_followed === true,
      req.body.tags,
      req.body.min_cost,
      req.body.max_cost,
      req.body.title,
      req.body.limit,
      req.body.offset,
    )).map((p) => removeSensitiveData(p));

    return res.status(200).json(posts);
  } catch (error) {
    log.error(error);
    return res.status(400).json({ error: error.message });
  }
});

router.get('/:username/liked', async (req, res) => {
  try {
    const likedPosts = (await Post.getLikedBy(req.params.username))
      .map(removeSensitiveData);
    return res.status(200).json(likedPosts);
  } catch (err) {
    log.error(err);
    return res.status(400).send();
  } 
});

router.post('/', async (req, res) => {
  if (req.token === undefined) {
    return res.status(401).json({ error: 'Must be logged in' });
  }

  const projectId = req.body.post_id;
  if (projectId === undefined) {
    return res.status(400).json({ error: 'Missing required field: `post_id`' });
  }

  try {
    // Only allow a user to publish a project they own.
    const project = await Project.get(projectId);
    if (project === null) {
      return res.status(404).json({ error: 'No such project exists' });
    }

    if (project.created_by !== req.token.username) {
      return res.status(401).json({ error: 'Cannot publish a non-owned project' });
    }

    await Post.create(req.body);
    return res.status(201).send();
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Post already exists for this project' });
    }
    log.error(error);
    return res.status(400).json({ error: error.message });
  }
});

router.delete('/', async (req, res) => {
  if (req.token === undefined) {
    return res.status(401).json({ error: 'Must be logged in' });
  }

  if (req.body === undefined || req.body.post_id === undefined) { 
    return res.status(400).json({ error: 'Missing required field: `post_id`' });
  }

  const postId = req.body.post_id;

  try {
    // Only allow a user to unpublish a project they own.
    const project = await Project.get(postId);
    if (project === null) {
      return res.status(404).json({ error: 'No such project exists' });
    }

    if (project.created_by !== req.token.username) {
      return res.status(401).json({ error: 'Cannot delete a non-owned project' });
    }

    await Post.delete(postId);
    return res.status(204).send();
  } catch (error) {
    log.error(error);
    return res.status(400).json({ error: 'Could not delete project.' });
  }
});

router.put('/', async (req, res) => {
  if (req.token === undefined) {
    return res.status(401).json({ error: 'Must be logged in' });
  }

  const postId = req.body.post_id;
  if (postId === undefined) {
    return res.status(400).json({ error: 'Missing required field: `post_id`' });
  }

  try {
    // Only allow a user to update a post they own.
    const project = await Project.get(postId);
    if (project === null) {
      // If the project doesn't exist, the post also cannot exist.
      return res.status(404).json({ error: 'Cannot update a post which does not exist' });
    }

    if (project.created_by !== req.token.username) {
      return res.status(401).json({ error: 'Cannot update a non-owned project' });
    }

    await Post.update(postId, req.body);
    return res.status(200).send();
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(404).json({ error: 'Cannot update a post which does not exist' });
    }
    log.error(error);
    return res.status(400).json({ error: error.message });
  }
});

const setLike = async (req, res) => {
  if (req.token === undefined) {
    return res.status(401).json({ error: 'Must be logged in' });
  }

  const postId = req.body.post_id;
  if (postId === undefined) {
    return res.status(400).json({ error: 'Missing required field: `post_id`' });
  }

  try {
    if (req.method === 'POST') {
      await Post.like(req.token.username, postId);
    } else if (req.method === 'DELETE') {
      await Post.unlike(req.token.username, postId);
    } else {
      log.error('Impossible route reached', req.method);
      return res.status(404).send();
    }
    return res.status(200).send();
  } catch (error) {
    log.error(error);
    return res.status(400).json({ error: error.message });
  }
};

router.post('/likes', setLike);
router.delete('/likes', setLike);

const setHidden = async (req, res) => {
  if (req.token === undefined) {
    return res.status(401).json({ error: 'Must be logged in' });
  }

  const postId = req.body.post_id;
  if (postId === undefined) {
    return res.status(400).json({ error: 'Missing required field: `post_id`' });
  }

  try {
    // Only allow a user to update a post they own.
    const project = await Project.get(postId);
    if (project === null) {
      return res.status(404).json({ error: 'Cannot un/hide a post which does not exist' });
    }

    if (project.created_by !== req.token.username && req.token.is_admin !== 1) {
      return res.status(401).json({ error: 'Cannot un/hide a non-owned post' });
    }

    const post = (await Post.getById(postId))[0];
    if (post === undefined) {
      return res.status(404).json({ error: 'Cannot un/hide a post which does not exist' });
    }

    if (req.method === 'POST') {
      // Don't execute a SQL update if there's nothing to change;
      // Also, prevent a user from overwriting 'hidden_by' field on their post
      // after it has been hidden by an admin.
      if (post.is_hidden === 0 || req.token.is_admin === 1) {
        await Post.hide(postId, req.token.username);
        return res.status(201).send();
      }
      return res.status(401).json({ error: 'Unauthorised to hide this post' });
    }

    if (req.method === 'DELETE') {
      if (post.is_hidden === 0) return res.status(204).send();
      // If an author hid a post, only the author should be able to unhide it.
      // If an admin hid a post, any admin - but not the author - should be able to unhide it.
      const hiddenByAuthor = post.created_by === post.hidden_by;
      if ((req.token.username === post.created_by && hiddenByAuthor)
        || (req.token.is_admin === 1 && !hiddenByAuthor)) {
        await Post.unhide(postId);
        return res.status(204).send();
      }
      return res.status(401).json({ error: 'Unauthorised to unhide this post' });
    }

    return res.status(404).send();
  } catch (error) {
    log.error(error);
    return res.status(400).json({ error: error.message });
  }
};

router.use('/img', express.static('img/post_img'));

router.post('/hide', setHidden);
router.delete('/hide', setHidden);

module.exports = router;
