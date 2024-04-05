const express = require('express');

const Comment = require('../models/comment');

const router = express.Router();

router.post('/', async (req, res) => {
  if (req.token === undefined) {
    return res.status(401).json({ error: 'Must be logged in' });
  }

  try {
    const result = await Comment.create(req.body.post_id, req.token.username, req.body.content);
    return res.status(201).json({ comment_id: result.insertId });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
});

router.delete('/', async (req, res) => {
  if (req.token === undefined) {
    return res.status(401).json({ error: 'Must be logged in' });
  }

  try {
    const comment = await Comment.get(req.body.comment_id);
    if (comment.author !== req.token.username) {
      return res.status(401).json(
        { error: 'Unauthorised: Only the author of a comment can delete that comment' },
      );
    }

    // There's no reason to try deleting the comment if it doesn't exist.
    if (comment === null) return res.status(204).send();

    await Comment.delete(req.body.comment_id);
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
});

const setLike = async (req, res) => {
  if (req.token === undefined) {
    return res.status(401).json({ error: 'Must be logged in' });
  }

  try {
    if (req.method === 'POST') {
      await Comment.like(req.body.comment_id, req.token.username);
      return res.status(201).send();
    }

    if (req.method === 'DELETE') {
      await Comment.unlike(req.body.comment_id, req.token.username);
      return res.status(204).send();
    }

    return res.status(404).send();
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
};

router.post('/like', setLike);
router.delete('/like', setLike);

const setHidden = async (req, res) => {
  if (req.token === undefined) {
    return res.status(401).json({ error: 'Must be logged in' });
  }

  if (req.token.is_admin === 0) {
    return res.status(401).json({ error: 'Unauthorised: Non-admin users cannot hide or unhide a comment' });
  }

  try {
    if (req.method === 'POST') {
      await Comment.like(req.body.comment_id, req.token.username);
      return res.status(201).send();
    }

    if (req.method === 'DELETE') {
      await Comment.unlike(req.body.comment_id, req.token.username);
      return res.status(204).send();
    }

    return res.status(404).send();
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
};

router.post('/hide', setHidden);
router.delete('/hide', setHidden);

module.exports = router;