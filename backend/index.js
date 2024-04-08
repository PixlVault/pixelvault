require('dotenv').config();

const log = require('./utils/logger');

const http = require('http');

const app = require('./app');
const { attachWebSocketService } = require('./ws/wss');

let server = null;
if (process.env.NODE_ENV === 'production') {
  log.info('Starting server in production mode over HTTPS');

  const fs = require('fs');
  const https = require('https');

  const key = fs.readFileSync(__dirname + "/certs/selfsigned.key");
  const cert = fs.readFileSync(__dirname + "/certs/selfsigned.crt");
  const options = {
    key: key,
    cert: cert
  };

  server = https.createServer(options, app);
} else {
  log.info('Starting server in test mode over HTTP');
  server = http.createServer(app);
}

server.listen(process.env.PORT, () => {
  log.info(`API running on port ${process.env.PORT}`);
});

attachWebSocketService(server);

module.exports = server;
