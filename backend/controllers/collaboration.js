const express = require('express');

const log = require('../utils/logger');
const Collaboration = require('../models/collaboration');
const Project = require('../models/project');

const router = express.Router();

router.get('/', async (req, res) => {
  const { projectId, username } = req.body;

  const hasProjId = projectId !== undefined;
  const hasUsername = username !== undefined;

  if (!hasProjId && !hasUsername) {
    return res.status(400).json({ error: 'Missing field: Must provide either a `username` or `projectId` field' });
  }

  if (hasProjId && hasUsername) {
    return res.status(400).json(
      { error: 'Ambiguous request: Must provide only one of a `username` or `projectId`' },
    );
  }

  if (hasUsername) {
    if (req.token.username !== username) {
      return res.status(401).json({ error: 'Cannot retrieve another user\'s invitations' });
    }
  } else {
    try {
      const project = await Project.get(projectId);
      if (project.created_by !== req.token.username) {
        return res.status(401).json({ error: 'Cannot retrieve invitations for non-owned project' });
      }
    } catch (error) {
      log.error(error);
      return res.status(400).send({ error: error.message });
    }
  }

  const getInvitations = hasUsername
    ? () => Collaboration.userInvitations(username)
    : () => Collaboration.projectInvitations(projectId);

  try {
    const invites = await getInvitations();
    return res.status(200).json({ invites });
  } catch (error) {
    log.error(error);
    return res.status(400).send({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  if (req.token === undefined) {
    return res.status(401).json({ error: 'Must be logged in' });
  }

  const { username, projectId } = req.body;
  if (projectId === undefined) {
    return res.status(400).json({ error: 'Missing field: `projectId`' });
  }
  if (username === undefined) {
    return res.status(400).json({ error: 'Missing field: `username`' });
  }

  try {
    const project = await Project.get(projectId);
    if (req.token.username !== project.created_by) {
      return res.status(401).json({ error: 'Only a project\'s author can invite users' });
    }

    if (username === project.created_by) {
      return res.status(400).json({ error: 'Cannot invite a user to a project they own' });
    }

    await Collaboration.invite(username, projectId);
    return res.status(201).send();
  } catch (error) {
    if (error.message === 'User does not exist') {
      return res.status(404).send({ error: 'User could not be found' });
    }

    log.error(error);
    return res.status(400).send({ error: error.message });
  }
});

/**
 * Update the status of an invitation.
 * (i.e. accept a pending invitation)
 */
router.put('/', async (req, res) => {
  if (req.token === undefined) {
    return res.status(401).json({ error: 'Must be logged in' });
  }

  const { accepted, projectId } = req.body;
  if (accepted === undefined) {
    return res.status(400).json({ error: 'Missing field: `accepted`' });
  }

  if (projectId === undefined) {
    return res.status(400).json({ error: 'Missing field: `projectId`' });
  }

  if (accepted !== true) {
    return res.status(400).json({ error: 'Invitation\'s accepted status can only be changed to `true`' });
  }

  try {
    await Collaboration.accept(req.token.username, projectId);
    return res.status(200).send();
  } catch (error) {
    log.error(error);
    return res.status(400).json({ error: error.message });
  }
});

/**
 * Remove a user from a project.
 */
router.delete('/', async (req, res) => {
  if (req.token === undefined) {
    return res.status(401).json({ error: 'Must be logged in' });
  }

  const { username, projectId } = req.body;
  if (username === undefined) {
    return res.status(400).json({ error: 'Missing field: `username`' });
  }

  if (projectId === undefined) {
    return res.status(400).json({ error: 'Missing field: `projectId`' });
  }

  try {
    // Only the project creator can uninvite other users:
    const project = await Project.get(projectId);
    if (username !== req.token.username) {
      if (project.created_by !== req.token.username) {
        return res.status(401).json({ error: 'Only a project\'s owner can remove other users.' });
      }
    }

    // Even if executed, this wouldn't remove the creator's access,
    // but this should still be considered an invalid request.
    if (username === project.created_by) {
      return res.status(400).json({ error: 'Cannot remove a project\'s author' });
    }

    await Collaboration.uninvite(username, projectId);
    return res.status(204).send();
  } catch (error) {
    log.error(error);
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;
