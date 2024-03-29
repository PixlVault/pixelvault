require('dotenv').config();

const http = require('http');

const app = require('./app.js');
const { attachWebSocketService } = require('./ws/wss.js');

const server = http.createServer(app);
server.listen(process.env.PORT, () => {
  console.log(`API running on port ${process.env.PORT}`);
});

attachWebSocketService(server);

module.exports = server;
