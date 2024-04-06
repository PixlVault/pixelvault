const jwt = require('jsonwebtoken');
const LZString = require('lz-string');

const Project = require('../models/project');

const AUTOSAVE_INTERVAL_MS = 60000;

const saveProject = async (projectId, imageData) => {
  console.log(`Saving '${projectId}'...`);
  try {
    await Project.setImageData(
      projectId,
      LZString.compressToBase64(JSON.stringify(imageData)),
    );
    console.log(`Successfully saved project '${projectId}'.`);
  } catch (error) {
    console.error('error saving project :', error);
  }
};

const attachWebSocketService = (server) => {
  console.log('Initialising WS Server');

  // Keep track of which sessions are open, using a project's ID as the session ID.
  const sessions = {};

  const io = require('socket.io')(server, { cors: { origin: '*' }, path: '/edit' });
  io.of('/edit');

  io.use(async (socket, next) => {
    if (socket.handshake.query.pid === undefined) {
      next(new Error('Must provide a project id'));
    }
    const projectId = socket.handshake.query.pid;

    // Try verifying the user's identity:
    let user;
    try {
      const auth = socket.handshake.auth.token;
      jwt.verify(auth, process.env.JWT_SECRET, (err, decoded) => {
        if (err !== null) {
          next(new Error('Could not authenticate user'));
        }
        user = decoded.username;
      });
    } catch (e) {
      console.error(e);
      socket.disconnect();
      next(new Error('Something went wrong!'));
    }

    // Test if the user has permission to join a project.
    if (!(projectId in sessions)) {
      try {
        const collaborators = await Project.collaborators(projectId);

        if (!collaborators.includes(user)) {
          next(new Error(`User ${user} does not have permission to edit ${projectId}`));
        } else {
          // User is allowed to edit this project, initialise the session:
          sessions[projectId] = { collaborators };
        }
      } catch (e) {
        next(new Error('Error occurred in opening session'));
      }
    } else if (!sessions[projectId].collaborators.includes(user)) {
      next(new Error(`User ${user} does not have permission to edit ${projectId}`));
    }

    socket.projectId = projectId;
    next();
  });

  io.on('connection', async (socket) => {
    const { projectId } = socket;

    if (!sessions[projectId].clients) {
      // If the session hasn't already been initialised, do so:
      sessions[projectId] = { ...sessions[projectId], canvas: null, clients: [socket] };

      // Fetch image data from the database, store it, and send a copy to the user:
      try {
        const rawData = await Project.getImageData(projectId);
        const data = JSON.parse(LZString.decompressFromBase64(rawData.toString()));
        sessions[projectId].canvas = data;
      } catch (e) {
        console.error(e);
        socket.disconnect();
      }
      console.log(`Created new session ${projectId}`);

      // Automatically save the canvas back to the database to avoid loss
      // of work in the event of a crash.
      setInterval(() => {
        if (sessions[projectId] !== undefined && sessions[projectId].canvas !== undefined) {
          saveProject(projectId, sessions[projectId].canvas);
        }
      }, AUTOSAVE_INTERVAL_MS);
    } else {
      // Session already exists, so we only need to send the user the canvas' state:
      sessions[projectId].clients.push(socket);
    }
    socket.emit('load', LZString.compressToBase64(JSON.stringify(Uint8Array.from(sessions[projectId].canvas))));
    console.log(`Client connected to session ${projectId} (total: ${sessions[projectId].clients.length})`);

    const updateCanvasState = (newState, projectId) => {
      const updates = JSON.parse(newState);

      console.log('UPDATE', projectId);
      Object.keys(updates).forEach((i) => {
        if (!isNaN(i)) {
          console.log(i, sessions[projectId].canvas[i], '<-', updates[i]);
          sessions[projectId].canvas[i] = updates[i];
        } else {
          console.error('Non-Numeric key detected');
        }
      });

      sessions[projectId].clients.forEach((clientSocket) => {
        clientSocket.emit('update', JSON.stringify(updates));
      });
    };

    socket.on('update', (data) => updateCanvasState(data, projectId));

    socket.on('disconnect', async () => {
      saveProject(projectId, sessions[projectId].canvas);

      // Remove the client from the session:
      const loc = sessions[projectId].clients.indexOf(socket);
      sessions[projectId].clients.splice(loc, 1);

      console.log(`Client disconnected from session ${projectId}`);
      // If no users are connected to a session, clean it up:
      if (sessions[projectId].clients.length === 0) {
        delete sessions[projectId];
        console.log(`Session ${projectId} is now closed`);
      }
    });
  });
};

module.exports = { attachWebSocketService };
