const express = require('express');
const multer = require('multer');
const fs = require('fs');

const log = require('../utils/logger');
const User = require('../models/user');

const router = express.Router();

router.get('/:username', async (req, res) => {
  try {
    const user = await User.get(req.params.username);
    return user === null
      ? res.status(404).json({ error: 'User does not exist' })
      : res.status(200).json(user);
  } catch (error) {
    log.error(error);
    return res.status(400).json({ error: error.message });
  }
});

router.put('/', async (req, res) => {
  if (!req.token) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  try {
    await User.update(req.token.username, req.body);
    return res.status(200).send();
  } catch (error) {
    log.error(error);
    return res.status(400).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { username, password, email } = req.body;
  try {
    await User.insert(username, password, email);
    return res.status(201).send();
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.sqlMessage.endsWith("'user.PRIMARY'")) {
        return res.status(400).json({ error: 'User already exists' });
      }
      if (error.sqlMessage.endsWith("'user.email'")) {
        return res.status(400).json({ error: 'Email is already associated with an account' });
      }
    } else {
      log.error(error);
      return res.status(400).json({ error: error.message });
    }
    return res.status(400).send();
  }
});

router.delete('/', async (req, res) => {
  if (req.token === undefined) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  try {
    await User.delete(req.token.username);
    return res.status(204).send();
  } catch (error) {
    log.error(error);
    return res.status(400).json({ error: 'An error occurred, please contact support to delete your account' });
  }
});

const setBanned = async (req, res) => {
  if (req.body.username === undefined) {
    return res.status(400).json({ error: 'Must specify a username' });
  }

  if (req.token === undefined) {
    return res.status(401).json({ error: 'Must be logged in' });
  }

  if (req.token.is_admin !== 1) {
    return res.status(401).json({ error: 'Only admins can ban or unban users' });
  }

  try {
    if (req.method === 'POST') {
      await User.ban(req.body.username);
      return res.status(201).send();
    }
    if (req.method === 'DELETE') {
      await User.unban(req.body.username);
      return res.status(204).send();
    }
    return res.status(404).send();
  } catch (error) {
    log.error(error);
    return res.status(400).send();
  }
};

router.post('/ban', setBanned);
router.delete('/ban', setBanned);

router.get('/:username/following', async (req, res) => {
  try {
    const following = await User.getFollowing(req.params.username);
    return res.status(200).json(following);
  } catch (err) {
    log.error(err);
    return res.status(400).send();
  }
});

const setAdmin = async (req, res) => {
  if (req.token === undefined) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  if (req.token.is_admin !== 1) {
    return res.status(401).json({ error: 'Not authorised to promote other users.' });
  }

  try {
    if (req.method === 'POST') {
      const changed = await User.promoteAdmin(req.body.username);
      return changed === 0
        ? res.status(304).json({ info: 'No change occurred - the user may not exist.' })
        : res.status(201).send();
    }

    if (req.method === 'DELETE') {
      const changed = await User.demoteAdmin(req.body.username);
      return changed === 0
        ? res.status(304).json({ info: 'No change occurred - the user may not exist.' })
        : res.status(204).send();
    }

    return res.status(404).send();
  } catch (error) {
    log.error(error);
    return res.status(400).json({ error: error.message });
  }
};

router.post('/admin', setAdmin);
router.delete('/admin', setAdmin);

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
    log.error(error);
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
    log.error(error);
    return res.status(400).json({ error: error.message });
  }
});

const isLoggedIn = (req, res, next) => {
  if (!req.token) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  return next();
};

// The following code supports uploading of profile pictures.
// Note that multer writes to disk even when the file is too large, so we first
// write to a temporary directory, and only when this has succeeded do we move the
// image to its final location.
const upload = multer({
  storage: multer.diskStorage({
    destination: 'img/temp',
  }),
  limits: { fields: 0, files: 1, fileSize: 100000 },
  fileFilter: (req, file, callback) => {
    console.log('b', req.file, req.file?.buffer);
    if (file.mimetype !== 'image/png') {
      callback(new Error('Image must be a PNG.'));
    } else {
      callback(null, true);
    }
  },
});

const uploadImage = (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err instanceof multer.MulterError || (err !== undefined && err.message === 'Image must be a PNG.')) {
      return res.status(400).json({ error: 'Could not upload image; please ensure it is a valid PNG file of size at most 100KB.' });
    }
    if (err) {
      console.error(err);
      next(new Error('Server Error'));
    }
    next();
  });
};

router.post('/upload_img', isLoggedIn, uploadImage, (req, res) => {
  if (req.file === undefined) {
    return res.status(400).json({ error: 'Could not upload image; please ensure it is a valid PNG file of size at most 100KB.' });
  }

  fs.rename(req.file.path, `img/profile_img/${req.token.username}.png`, (err) => {
    if (err) {
      log.error(err);
      return res.status(400).json({ error: 'Server error, image could not be saved' });
    }
  });

  return res.status(201).send();
});

router.use('/img', express.static('img/profile_img'));

module.exports = router;
