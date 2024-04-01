const express = require('express');

const Post = require('../models/post');
const Project = require('../models/project');

const router = express.Router();

// POST for resource retrieval isn't entirely appropriate for a RESTful API, 
// but given GET requests do not have a request body we cannot avoid this.
router.post('/search', async (req, res) => {
  const removeSensitiveData = (post) => {
    delete post.hidden_by;
    delete post.project_id;
    return post;
  };

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
    )).map((p) => removeSensitiveData(p));

    return res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
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
    console.error(error);
    return res.status(400).json({ error: error.message });
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
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
});

const hideOrUnhide = async (req, res) => {
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
      return res.status(404).json({ error: 'Cannot hide a post which does not exist' });
    }

    if (project.created_by !== req.token.username && req.token.is_admin !== true) {
      return res.status(401).json({ error: 'Cannot hide a non-owned post' });
    }

    const post = await Post.getById(postId);
    if (post === null) {
      return res.status(404).json({ error: 'Cannot hide a post which does not exist' });
    }

    if (req.method === 'POST') {
      // Prevent a user by overriding their post being hidden by an admin.
      if (post.is_hidden === true && req.token.is_admin !== true) {
        return res.status(200).send();
      }
      await Post.hide(postId, req.token.username);
    }

    if (req.method === 'DELETE') {
      // Prevent a user from undoing an admin hiding a post.
      if (post.is_hidden === true
        && post.hidden_by !== project.created_by
        && req.token.is_admin !== true) {
        return res.status(200).send();
      }
      await Post.unhide(postId);
    }
    return res.status(200).send();
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
};

router.post('/hidden', hideOrUnhide);
router.delete('/hidden', hideOrUnhide);

module.exports = router;
