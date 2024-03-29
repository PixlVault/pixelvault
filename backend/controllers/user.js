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
    return res.status(400).json({ error });
  }
});

router.post('/', async (req, res) => {
  const { username, password, email } = req.body;
  try {
    await User.insert(username, password, email);
    return res.status(201).send();
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error });
  }
});

router.get('/following', async (req, res) => {
  try {
    const following = await User.getFollowing(req.token.username);
    return res.status(200).json(following);
  } catch (err) {
    console.error(err);
    return res.status(400).send();
  }
});

router.post('/following/:username', async (req, res) => {
  if (!req.token) { return res.status(401).json({ error: 'Not logged in' }); }
  try {
    await User.follow(req.token.username, req.params.username);
    return res.status(201).send();
  } catch (err) {
    console.error(err);
    return res.status(400).send();
  }
});

router.delete('/following/:username', async (req, res) => {
  if (!req.token) { return res.status(401).json({ error: 'Not logged in' }); }
  try {
    await User.unfollow(req.token.username, req.params.username);
    return res.status(201).send();
  } catch (err) {
    console.error(err);
    return res.status(400).send();
  }
});

module.exports = router;
