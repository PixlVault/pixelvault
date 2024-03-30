const express = require('express');

const Project = require('../models/project');

const router = express.Router({ mergeParams: true });

router.get('/', async (req, res) => {
  const { projectId } = req.params;
  if (projectId === undefined) {
    return res.status(400).json({ error: 'Must provide a Project ID' });
  }

  try {
    const invites = await Project.invitations(projectId);
    return res.status(200).json({ invites });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  if (req.token === undefined) {
    return res.status(401).json({ error: 'Must be logged in' });
  }

  const { projectId } = req.params;
  if (projectId === undefined) {
    return res.status(400).json({ error: 'Must provide a Project ID' });
  }

  const { username } = req.body;
  if (username === undefined) {
    return res.status(400).json({ error: 'Must provide a username' });
  }

  try {
    const project = await Project.get(projectId);
    if (req.token.username !== project.created_by) {
      return res.status(401).json({ error: 'Only a project\'s author can invite users' });
    }

    if (username === project.created_by) {
      return res.status(400).json({ error: 'Cannot invite a user to a project they own' });
    }

    await Project.invite(username, projectId);
    return res.status(200);
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2' && error.sqlMessage.endsWith('`user` (`username`))')) {
      return res.status(404).send({ error: 'User could not be found' });
    }

    console.error(error);
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

  const { projectId } = req.params;
  if (projectId === undefined) {
    return res.status(400).json({ error: 'Must provide a Project ID' });
  }

  const { status } = req.body;
  if (status === undefined) {
    return res.status(400).json({ error: 'Must provide the invitation\'s new status' });
  }

  if (req.body.accepted !== true) {
    return res.status(400).json({ error: 'Invitation\'s accepted status can only be changed to `true`' });
  }

  try {
    const result = await Project.accept(req.token.username, req.params.project);
    console.log(result);

    return res.status(200).send();
  } catch (error) {
    console.error(error);
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

  const { projectId } = req.params;
  if (projectId === undefined) {
    return res.status(400).json({ error: 'Must provide the ID of the corresponding project.' });
  }

  const { username } = req.body;
  if (username === undefined) {
    return res.status(400).json({ error: 'Must provide the username of the user to uninvite' });
  }

  try {
    // Only the project creator can uninvite other users:
    const project = await Project.get(projectId);
    if (username !== req.token.username) {
      if (project.created_by !== req.token.userame) {
        return res.status(401).json({ error: 'Only a project\'s owner can remove other users.' });
      }
    }

    // Even if executed, this wouldn't remove the creator's access,
    // but this should still be considered an invalid request.
    if (username === project.created_by) {
      return res.status(400).json({ error: 'Cannot remove a project\'s author' });
    }

    await Project.uninvite(projectId);
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;
