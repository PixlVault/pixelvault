const argon2 = require('argon2');
const express = require('express');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const router = express.Router();

router.post('/', async (req, res) => {
  const { username, password } = req.body;
  if (username === undefined) {
    return res.status(400).json({ error: 'No username provided' });
  }
  
  if (password === undefined) {
    return res.status(400).json({ error: 'No password provided' });
  }

  try {
    const user = await User.getDetails(username);

    if (user === null) {
      return res.status(401).json({ error: 'Invalid username or password provided' });
    }

    if (await argon2.verify(user.password_hash, password)) {
      delete user.password_hash;
      const token = jwt.sign(user, process.env.JWT_SECRET /*,  { expiresIn: '7d' } */ );
      return res.status(200).send({ token });
    } else {
      return res.status(401).json({ error: 'Invalid username or password provided' });
    }
  } catch (err) {
    console.error(err);
    return res.status(400).send();
  }
});

module.exports = router;