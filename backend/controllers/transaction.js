const express = require('express');

const log = require('../utils/logger');
const Transaction = require('../models/transaction');
const Post = require('../models/post');

const router = express.Router();

// TODO: Until PayPal integration is complete, this endpoint lets us mock the
// process of purchasing an item and logging the transaction.
router.post('/', async (req, res) => {
  if (req.token === undefined) {
    return res.status(401).json({ error: 'Must be logged in' });
  }

  const postId = req.body.post_id;
  if (postId === undefined) {
    return res.status(401).json({ error: 'Missing or invalid field: `post_id`' });
  }

  // TODO: PayPal purchase processing!

  try {
    const result = await Transaction.create(postId, req.token.username, 'complete');
    return res.status(201).json({ transaction_id: result.insertId });
  } catch (error) {
    log.error(error);
    return res.status(400).send();
  }
});

router.get('/user', async (req, res) => {
  if (req.token === undefined) {
    return res.status(401).json({ error: 'Must be logged in' });
  }

  try {
    const transactions = await Transaction.getByUser(req.token.username);
    return res.status(200).json(transactions);
  } catch (error) {
    log.error(error);
    return res.status(400).send();
  }
});

router.get('/post/:postId', async (req, res) => {
  if (req.token === undefined) {
    return res.status(401).json({ error: 'Must be logged in' });
  }

  try {
    const post = (await Post.getById(req.params.postId))[0];
    if (post === undefined) {
      return res.status(404).json({ error: 'Post does not exist' });
    }

    if (post.created_by !== req.token.username) {
      return res.status(401).json({ error: 'Unauthorised to view transactions for this post' });
    }

    const transactions = await Transaction.getByPost(req.params.postId);
    return res.status(200).json(transactions);
  } catch (error) {
    log.error(error);
    return res.status(400).send();
  }
});

module.exports = router;
