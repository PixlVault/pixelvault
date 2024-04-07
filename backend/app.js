const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

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

// Basic token extractor:
app.use(async (req, _res, next) => {
  let auth = req.headers.authorization;
  auth = auth ? auth.split(' ')[1] : undefined;

  if (auth) {
    try {
      const token = jwt.verify(auth, process.env.JWT_SECRET);
      if (await User.isBanned(token.username)) {
        console.log(`Banned user ${token.username} attempted to authenticate`);
      } else {
        req.token = token;
      }
    } catch (e) {
      console.error(e);
    }
  }

  next();
});

app.use(bodyParser.json());

// Needed to prevent CORS errors when developing.
app.use(cors());

// QUESTION: At some point should this return the React Frontend?
app.get('/', (_req, res) => res.send('Hello World!'));

app.use('/api', apiRouter);

app.use((err, req, res, next) => {
  console.error(err);
});

module.exports = app;
