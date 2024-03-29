const jwt = require('jsonwebtoken');
const { WebSocketServer } = require('ws');

const Project = require('../models/project');

const attachWebSocketService = (server) => {
  console.log('Initialising WS Server')
  const wss = new WebSocketServer({ path: '/edit', noServer: true });

  // Keep track of which sessions are open, using a project's ID as the session ID.
  const sessions = {};

  // Only allow logged-in users to connect to the websocket server;
  // approach recommended in github.com/websockets/ws/issues/377#issuecomment-462152231
  server.on('upgrade', async (request, socket, head) => {
    const projectId = request.url.substring(8);
    let user = null;

    // Try verifying the user's identity:
    try {
      const auth = request.headers['sec-websocket-protocol'].split(' ')[1];
      jwt.verify(auth, process.env.JWT_SECRET, (err, decoded) => {
        if (err !== null) {
          console.error(err);
          socket.destroy();
        }
        user = decoded.username;
      });
    } catch (e) {
      console.error(e);
      socket.destroy();
    }

    // Test if the user has permission to join a project.
    if (!(projectId in sessions)) {
      try {
        const collaborators = await Project.getCollaborators(projectId);

        if (!collaborators.includes(user)) {
          console.log(`User ${user} does not have permission to edit ${projectId}`)
          socket.destroy();
        } else {
          // User is allowed to edit this project, initialise the session:
          sessions[projectId] = { collaborators };
        }

      } catch (e) {
        console.error(e);
        socket.destroy();
      }
    } else if (!sessions[projectId].collaborators.includes(user)) {
      console.log(`User ${user} does not have permission to edit ${projectId}`)
      socket.destroy();
    }

    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request, projectId);
    });
  });

  wss.on('connection', (ws, req, projectId) => {
    ws.on('error', console.error);

    if (!sessions[projectId].clients) {
      // If the session hasn't already been initialised, do so:
      sessions[projectId] = { ...sessions[projectId], 'canvas': null, 'clients': [ws] };

      // Fetch image data from the database, store it, and send a copy to the user:
      Project.getImageData(projectId)
        .then(data => {
          sessions[projectId].canvas = data;

          if (data !== undefined) {
            console.log(`Created new session ${projectId}`);
            ws.send(sessions[projectId].canvas);
          } else {
            console.log(`Rejected invalid session ${projectId}`);
            ws.close();
          }
        })
        .catch(e => {
          console.error(e)
          ws.close();
        });
    } else {
      // Session already exists, so we only need to send the user the canvas' state:
      sessions[projectId].clients.push(ws);
      ws.send(sessions[projectId].canvas);
      console.log(`Client connected to session ${projectId} (total: ${sessions[projectId].clients.length})`);
    }

    ws.on('message', (data) =>  wss.updateCanvasState(data, projectId));

    ws.on('close', () => {
      // Remove the client from the session:
      const loc = sessions[projectId].clients.indexOf(ws);
      sessions[projectId].clients.splice(loc, 1);

      Project.setImageData(projectId, sessions[projectId].canvas)
        .then(_ => console.log(`Saved project '${projectId}'`))
        .catch(e => console.error(e));

      // If no users are connected to a session, clean it up:
      if (sessions[projectId].clients.length === 0) { delete sessions[projectId]; }

      console.log(`Client disconnected from session ${projectId}`);
    });
  });

  wss.updateCanvasState = (newState, projectId) => {
    sessions[projectId].canvas = newState;
    console.log(`[Updated ${projectId}] =>`, sessions[projectId].canvas)
    sessions[projectId].clients.forEach(c => c.send(newState));
  };
};

module.exports = { attachWebSocketService };
