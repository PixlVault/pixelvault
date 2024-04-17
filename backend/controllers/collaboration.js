const express = require('express');

const log = require('../utils/logger');
const Collaboration = require('../models/collaboration');
const Project = require('../models/project');

const router = express.Router();

router.get('/user', async (req, res) => {
  if (req.token === undefined) {
    return res.status(401).json({ error: 'Must be logged in to view invitations' });
  }

  try {
    const invites = await Collaboration.userInvitations(req.token.username);
    return res.status(200).json(invites);
  } catch (error) {
    log.error(error);
    return res.status(400).send({ error: 'Error retrieving invitations' });
  }
});


router.get('/project/:project_id', async (req, res) => {
  if (req.token === undefined) {
    return res.status(401).json({ error: 'Must be logged in to view invitations' });
  }

  try {
    const project = await Project.get(req.params.project_id);
    if (project.created_by !== req.token.username) {
      return res.status(401).json({ error: 'Cannot retrieve invitations for non-owned project' });
    }

    const invites = await Collaboration.projectInvitations(req.params.project_id);
    return res.status(200).json(invites);
  } catch (error) {
    log.error(error);
    return res.status(400).send({ error: 'Error retrieving invitations' });
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

    const invites = await Collaboration.projectInvitations(projectId);
    if (invites.filter((i) => i.username.toLowerCase() === username.toLowerCase()).length > 0) {
      return res.status(400).json({ error: 'User has already been invited to the project' });
    }

    await Collaboration.invite(username, projectId);
    return res.status(201).send();
  } catch (error) {
    if (error.message === 'User does not exist') {
      return res.status(404).send({ error: 'User could not be found' });
    }

    log.error(error);
    return res.status(400).send({ error: 'Error inviting user' });
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
