require('dotenv').config();

const http = require('http');

const app = require('./app');
const { attachWebSocketService } = require('./ws/wss');

const server = http.createServer(app);
server.listen(process.env.PORT, () => {
  console.log(`API running on port ${process.env.PORT}`);
});

attachWebSocketService(server);

module.exports = server;
