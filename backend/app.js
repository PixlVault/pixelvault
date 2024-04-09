const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const log = require('./utils/logger');
const apiRouter = require('./controllers/api');
const User = require('./models/user');

const app = express();

if (process.env.NODE_ENV == 'production') {
  const compression = require('compression');
  app.use(compression());

  const helmet = require('helmet');
  app.use(helmet());

  const RateLimit = require('express');
  const limiter = RateLimit({
    windowMs: 1 * 60 * 1000,
    max: 20,
  });
  app.use(limiter);
}

app.use(express.json());

app.use(async (req, _res, next) => {
  // Passing the raw req to the logger causes an error when it tries to stringify
  // the object, due to an apparent circular reference.
  log.http({
    method: req.method, url: req.url, params: req.params, headers: req.headers,
  });
  next();
});

// Basic token extractor:
app.use(async (req, _res, next) => {
  let auth = req.headers.authorization;
  auth = auth ? auth.split(' ')[1] : undefined;

  if (auth !== undefined) {
    try {
      const token = jwt.verify(auth, process.env.JWT_SECRET);
      if (await User.isBanned(token.username)) {
        log.http(`Banned user '${token.username}' attempted to authenticate`);
      } else {
        req.token = token;
      }
    } catch (e) { log.warn(e); }
  }
  next();
});

app.use(bodyParser.json());

// Needed to prevent CORS errors when developing.
app.use(cors());

app.use('/api', apiRouter);


if (process.env.NODE_ENV == 'production') {
  app.use(express.static(__dirname + '/../frontend/dist'));

  app.get('*', (req, res) => {
    // The relative path must be resolved before passing it to sendFile or you'll get confusing "Forbidden" errors.
    var path = require('path')
    res.sendFile(path.resolve(__dirname + '/../frontend/dist/index.html'));
  });
}

app.use((err, req, res, next) => {
  log.error(err);
});

module.exports = app;
