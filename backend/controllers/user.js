const express = require('express');

const User = require('../models/user');

const router = express.Router();

router.get('/:username', async (req, res) => {
  try {
    const user = await User.get(req.params.username);
    return user === null
      ? res.status(404).json({ error: 'User does not exist' })
      : res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { username, password, email } = req.body;
  try {
    await User.insert(username, password, email);
    return res.status(201).send();
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
});

router.get('/:username/following', async (req, res) => {
  try {
    const following = await User.getFollowing(req.params.username);
    return res.status(200).json(following);
  } catch (err) {
    console.error(err);
    return res.status(400).send();
  }
});

router.post('/:username/following', async (req, res) => {
  if (!req.token) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  if (req.token.username !== req.params.username) {
    return res.status(401).json({ error: 'Cannot alter another user\'s followed accounts' });
  }

  const { followee } = req.body;
  try {
    await User.follow(req.params.username, followee);
    return res.status(201).send();
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
});

router.delete('/:username/following', async (req, res) => {
  if (!req.token) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  if (req.token.username !== req.params.username) {
    return res.status(401).json({ error: 'Cannot alter another user\'s followed accounts' });
  }

  try {
    await User.unfollow(req.token.username, req.params.username);
    return res.status(201).send();
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;
