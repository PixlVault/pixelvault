const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const apiRouter = require('./controllers/api');

const app = express();

app.use(express.json());

// Basic token extractor:
app.use((req, _res, next) => {
  let auth = req.headers.authorization;
  auth = auth ? auth.split(' ')[1] : undefined;

  if (auth) {
    try {
      req.token = jwt.verify(auth, process.env.JWT_SECRET);
    } catch (e) {
      // User's token could not be verified.
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
