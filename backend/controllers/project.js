const express = require('express');
const LZString = require('lz-string');

const log = require('../utils/logger');
const Project = require('../models/project');

const router = express.Router();

router.get('/:projectId', async (req, res) => {
  if (req.token === undefined) {
    return res.status(401).json({ error: 'Must be logged in' });
  }

  try {
    const project = await Project.get(req.params.projectId);
    if (project === null) {
      return res.status(404).json({ error: 'Project does not exist' });
    }

    if (project.created_by !== req.token.username) {
      const collaborators = await Project.collaborators(req.params.projectId);
      if (!collaborators.includes(req.token.username)) {
        return res.status(401).json({ error: 'Non-collaborators cannot retrieve project details' });
      }
    }

    return res.status(200).json(project);
  } catch (error) {
    log.error(error);
    return res.status(400).json({ error: 'Could not retrieve project details' });
  }
});

router.get('/createdBy/:username', async (req, res) => {
  if (req.token === undefined) {
    return res.status(401).json({ error: 'Must be logged in' });
  }

  if (req.params.username !== req.token.username) {
    return res.status(401).json({ error: 'Cannot retrieve another user\'s projects' });
  }

  try {
    const projects = await Project.getCreatedBy(req.params.username);
    return projects === null
      ? res.status(404).json({ error: 'No projects found' })
      : res.status(200).json(projects);
  } catch (e) {
    log.error(e);
    return res.status(400).json({ error: 'Something went wrong' });
  }
});

router.put('/:projectId', async (req, res) => {
  if (!req.token) {
    return res.status(401).json({ error: 'Must be logged in' });
  }

  // First, check the project exists:
  let project = null;
  let collaborators = [];
  try {
    project = await Project.get(req.params.projectId);
    collaborators = await Project.collaborators(req.params.projectId);
  } catch (err) {
    log.error(err);
    return res.status(400).send();
  }

  // Then try to update it:
  if (!project) { return res.status(404).json({ error: 'Project does not exist' }); }

  const authorised = project.created_by === req.token.username
    || collaborators.includes(req.token.username);

  if (!authorised) {
    return res.status(401).json({ error: 'Not authorised to edit this project' });
  }

  try {
    await Project.update(req.params.projectId, req.body);
    return res.status(200).json({});
  } catch (err) {
    log.error(err);
    return res.status(400).send();
  }
});

router.delete('/:projectId', async (req, res) => {
  if (!req.token) {
    return res.status(401).json({ error: 'Must be logged in' });
  }

  try {
    const project = await Project.get(req.params.projectId);

    if (project === null) {
      return res.status(404).json({ error: 'Project could not be found' });
    }

    if (project.created_by !== req.token.username) {
      return res.status(401).json({ error: 'User does not have permission to delete this project' });
    }

    await Project.delete(req.params.projectId);
    return res.status(204).send();
  } catch (error) {
    log.error(error);
    return res.status(400).json({ error: 'An error occurred when deleting this project' });
  }
});

router.post('/', async (req, res) => {
  if (!req.token) {
    return res.status(401).json({ error: 'Must be logged in' });
  }

  const { title, imageData } = req.body;

  try {
    const result = await Project.insert(title, req.token.username, imageData);
    return res.status(201).json({ projectId: result.project_id });
  } catch (error) {
    log.error(error);
    return res.status(400).json({ error: 'An error occurred when creating this project' });
  }
});

module.exports = router;
