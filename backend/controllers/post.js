const express = require('express');

const Post = require('../models/post');
const Project = require('../models/project');

const router = express.Router();

// POST for resource retrieval isn't entirely appropriate for a RESTful API, 
// but given GET requests do not have a request body we cannot avoid this.
router.post('/search', async (req, res) => {
  const removeSensitiveData = (post) => {
    delete post.is_hidden;
    delete post.hidden_by;
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
      return res.status(400).json({ error: 'No such project exists' });
    }

    if (project.created_by !== req.token.username) {
      return res.status(401).json({ error: 'Cannot publish a non-owned project' });
    }

    await Post.create(req.body);
    return res.status(201).send();
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
