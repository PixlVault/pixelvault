require('dotenv').config();

const http = require('http');

const app = require('./app');
const { attachWebSocketService } = require('./ws/wss');

var server = null;
if (process.env.NODE_ENV == 'production') {
  const fs = require('fs');
  const https = require('https');

  var key = fs.readFileSync(__dirname + "/certs/selfsigned.key");
  var cert = fs.readFileSync(__dirname + "/certs/selfsigned.crt");
  var options = {
    key: key,
    cert: cert
  };

  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}

server.listen(process.env.PORT, () => {
  console.log(`API running on port ${process.env.PORT}`);
});

attachWebSocketService(server);

module.exports = server;
