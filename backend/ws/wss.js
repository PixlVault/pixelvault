const jwt = require('jsonwebtoken');
const LZString = require('lz-string');

const log = require('../utils/logger');
const Project = require('../models/project');

const AUTOSAVE_INTERVAL_MS = 60000;

const saveProject = async (projectId, imageData) => {
  log.info(`Saving '${projectId}'...`);
  try {
    await Project.setImageData(
      projectId,
      LZString.compressToBase64(JSON.stringify(imageData)),
    );
    log.info(`Successfully saved project '${projectId}'.`);
  } catch (error) {
    log.warn('error saving project :', error);
  }
};

/**
 * Tests whether a username is allowed to join a room or not.
 * @param {string} username The username of the user.
 * @param {string} projectId The ID of the project they wish to join.
 * @returns {Promise<boolean>} true if they have permission, else false.
 */
const canJoinSession = async (username, projectId) => {
  try {
    const collaborators = await Project.collaborators(projectId);
    if (collaborators.includes(username)) return true;
  } catch (e) {
    log.error(e);
  }
  return false;
};

const attachWebSocketService = (server) => {
  log.info('Initialising WS Server');

  // Keep track of which sessions are open, using a project's ID as the session ID.
  const sessions = {};

  const io = require('socket.io')(server, { cors: { origin: '*' }, path: '/ws/edit' });
  io.of('/ws/edit');

  io.use(async (socket, next) => {
    // Try verifying the user's identity:
    try {
      const auth = socket.handshake.auth.token;
      jwt.verify(auth, process.env.JWT_SECRET, (err, decoded) => {
        if (err !== null) {
          return socket.disconnect('Could not authenticate user');
        }
        socket.user = decoded.username;
      });
    } catch (e) {
      log.error(e);
      return socket.disconnect('Something went wrong!');
    }
    next();
  });

  io.on('connection', async (socket) => {
    if (socket.handshake.query.pid === undefined) {
      return socket.disconnect('Must specify a project ID');
    }

    // Test if the user has permission to join a project.
    const projectId = socket.handshake.query.pid;

    if (await canJoinSession(socket.user, projectId)) {
      socket.join(projectId);
    } else {
      return socket.disconnect(`User ${socket.user} does not have permission to edit ${projectId}`);
    }

    if (sessions[projectId] === undefined) {
      // If the session hasn't already been initialised, do so;
      // Fetch image data from the database and store it in the session's data.
      sessions[projectId] = { canvas: null, clients: [] };
      try {
        const rawData = await Project.getImageData(projectId);
        const data = JSON.parse(LZString.decompressFromBase64(rawData.toString()));
        sessions[projectId].canvas = data;
      } catch (e) {
        log.error(e);
        socket.disconnect();
      }
      log.info(`Created new session ${projectId}`);

      // Automatically save the canvas back to the database to avoid loss
      // of work in the event of a crash.
      sessions[projectId].autosave = setInterval(() => {
        if (sessions[projectId] !== undefined && sessions[projectId].canvas !== undefined) {
          saveProject(projectId, sessions[projectId].canvas);
        }
      }, AUTOSAVE_INTERVAL_MS);
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
      saveProject(projectId, sessions[projectId].canvas);
      clearInterval(sessions[projectId].autosave);

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
