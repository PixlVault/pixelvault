const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const userRouter = require('./controllers/user');
const loginRouter = require('./controllers/login');
const projectRouter = require('./controllers/project');

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

app.get('/', (req, res) => {
  // QUESTION: At some point should this return the React Frontend?
  res.send('Hello World!');
});

app.use('/user', userRouter);
app.use('/login', loginRouter);
app.use('/project', projectRouter);

app.use((err, req, res, next) => {
  console.error(err);
});

module.exports = app;
