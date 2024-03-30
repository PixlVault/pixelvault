const express = require('express');

const userRouter = require('./user');
const loginRouter = require('./login');
const projectRouter = require('./project');
const collaborationRouter = require('./collaboration');

const router = express.Router();

router.use('/user', userRouter);
router.use('/login', loginRouter);
router.use('/project', projectRouter);
router.use('/collaboration', collaborationRouter);

module.exports = router;
