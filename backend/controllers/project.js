const express = require('express');
const LZString = require('lz-string');

const Project = require('../models/project');

const router = express.Router();

router.get('/:projectId', async (req, res) => {
  try {
    const project = await Project.get(req.params.projectId);
    return project === null
      ? res.status(404).json({ error: 'Project does not exist' })
      : res.status(200).json(project);
  } catch (error) {
    console.error(error);
    // TODO: May not be wise to send verbatim error back?
    return res.status(400).json({ error: error.message });
  }
});

router.get('/createdBy/:username', async (req, res) => {
  try {
    const projects = await Project.getCreatedBy(req.params.username);
    return projects === null
      ? res.status(404).json({ error: 'No projects found' })
      : res.status(200).json(projects);
  } catch (e) {
    console.error(e);
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
    console.error(err);
    return res.status(400).send();
  }

  // Then try to update it:
  if (!project) { return res.status(404).json({ error: 'Project does not exist' }); }

  const authorised = project.created_by === req.token.username
    || collaborators.includes(req.token.username);

  if (!authorised) {
    return res.status(401).json({ error: 'Not authorised to edit this project' });
  }

  const { title, imageData } = req.body;
  try {
    await Project.update(req.params.projectId, title, imageData);
    return res.status(200).json({});
  } catch (err) {
    console.error(err);
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
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  if (!req.token) {
    return res.status(401).json({ error: 'Must be logged in' });
  }

  const { title, imageData } = req.body;

  console.log('received', imageData);

  try {
    const result = await Project.insert(title, req.token.username, imageData);
    return res.status(201).json({ projectId: result.project_id });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;
