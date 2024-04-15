const jwt = require('jsonwebtoken');
const LZString = require('lz-string');

const log = require('../utils/logger');
const Project = require('../models/project');

const PULSE_INTERVAL_MS = 60000;

/**
 * Synchronise the project's state with the database's state.
 * @param {Object} session Session metadata
 * @param {string} projectId The ID of the project.
 * @param {Object} io
 */
const syncProject = async (session, projectId, io) => {
  log.info(`Saving '${projectId}'...`);

  session.collaborators = await Project.collaborators(projectId);
  (await io.in(projectId).fetchSockets()).forEach((socket) => {
    if (!session.collaborators.includes(socket.user)) {
      socket.emit('error', 'You have been removed from this project.');
      return socket.disconnect();
    }
  });

  try {
    await Project.setImageData(
      projectId,
      LZString.compressToBase64(JSON.stringify(session.canvas)),
    );
    log.info(`Successfully saved project '${projectId}'.`);
  } catch (error) {
    if (error.message === 'Project does not exist.') {
      io.in(projectId).emit('error', 'This project has been deleted.');
      io.in(projectId).disconnectSockets();
    }

    if (error.message === 'Cannot alter a published project\'s image data.') {
      io.in(projectId).emit('error', 'Project has been published and can no longer be edited.');
      io.in(projectId).disconnectSockets();
    }

    log.warn('error saving project :', error);
  }
};

const attachWebSocketService = (server) => {
  log.info('Initialising WS Server');

  // Keep track of which sessions are open, using a project's ID as the session ID.
  const sessions = {};

  const io = require('socket.io')(server, {
    cors: { origin: '*' },
    path: '/ws/edit',
    maxHttpBufferSize: 5e6 });

  io.of('/ws/edit');

  io.use(async (socket, next) => {
    // Try verifying the user's identity:
    try {
      const auth = socket.handshake.auth.token;
      const decoded = jwt.verify(auth, process.env.JWT_SECRET);
      socket.user = decoded.username;
    } catch (e) {
      log.error(e);
      socket.emit('error', 'Could not authenticate user');
      return socket.disconnect();
    }
    next();
  });

  io.on('connection', async (socket) => {
    if (socket.handshake.query.pid === undefined) {
      socket.emit('error', 'Must specify a project ID');
      return socket.disconnect();
    }

    const projectId = socket.handshake.query.pid;
    if (sessions[projectId] === undefined) {
      const collaborators = await Project.collaborators(projectId);
      // If it has no collaborators, the project does not exist:
      if (collaborators.length === 0) {
        socket.emit('error', 'Project could not be found.');
        return socket.disconnect();
      }

      // Test if the user has permission to join the project.
      if (collaborators.includes(socket.user)) {
        socket.join(projectId);
      } else {
        socket.emit('error', `User ${socket.user} does not have permission to edit ${projectId}`);
        return socket.disconnect();
      }

      const isPublished = (await Project.isPublished(projectId)).is_published === 1;
      if (isPublished) {
        socket.emit('error', 'Project has been published and can no longer be edited.');
        return socket.disconnect();
      }

      // If the session hasn't already been initialised, do so;
      // Fetch image data from the database and store it in the session's data.
      sessions[projectId] = { collaborators, canvas: null, clients: [] };
      try {
        const rawData = await Project.getImageData(projectId);
        const data = JSON.parse(LZString.decompressFromBase64(rawData.toString()));
        sessions[projectId].canvas = data;
      } catch (e) {
        log.error(e);
        socket.emit('error', 'Something went wrong!');
        socket.disconnect();
      }
      log.info(`Created new session ${projectId}`);

      // Automatically synchronise the project with the database to avoid loss
      // of work in the event of a crash, and to keep the collaborators list up to date.
      sessions[projectId].pulse = setInterval(() => {
        if (sessions[projectId] !== undefined && sessions[projectId].canvas !== undefined) {
          syncProject(sessions[projectId], projectId, io);
        }
      }, PULSE_INTERVAL_MS);
    } else if (sessions[projectId].collaborators.includes(socket.user)) {
      socket.join(projectId);
    } else {
      socket.emit('error', `User ${socket.user} does not have permission to edit ${projectId}`);
      return socket.disconnect();
    }

    sessions[projectId].clients.push(socket);
    socket.emit('load', LZString.compressToBase64(JSON.stringify(sessions[projectId].canvas)));
    socket.broadcast.to(projectId).emit('joined', socket.user);
    log.http(`Client connected to session ${projectId} (${sessions[projectId].clients.length} total).`);

    const updateCanvasState = (newState) => {
      const updates = JSON.parse(newState);
      Object.keys(updates).forEach((i) => {
        if (!isNaN(i)) {
          sessions[projectId].canvas.data[i] = updates[i];
        } else {
          log.warn('Non-Numeric key detected');
        }
      });
      socket.broadcast.to(projectId).emit('update', JSON.stringify(updates));
    };

    socket.on('update', (data) => updateCanvasState(data));

    socket.on('disconnect', async () => {
      socket.broadcast.to(projectId).emit('left', socket.user);
      syncProject(sessions[projectId], projectId, io);
      clearInterval(sessions[projectId].pulse);

      // Remove the client from the session:
      const loc = sessions[projectId].clients.indexOf(socket);
      sessions[projectId].clients.splice(loc, 1);
      log.http(`Client disconnected from session ${projectId}`);

      // If no users are connected to a session, clean it up:
      if (sessions[projectId].clients.length === 0) {
        delete sessions[projectId];
        log.info(`Session ${projectId} is now closed`);
      }
    });
  });
};

module.exports = { attachWebSocketService };
