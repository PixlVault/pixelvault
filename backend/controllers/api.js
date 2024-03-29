const express = require('express');

const userRouter = require('./user');
const loginRouter = require('./login');
const projectRouter = require('./project');

const router = express.Router();

router.use('/user', userRouter);
router.use('/login', loginRouter);
router.use('/project', projectRouter);

module.exports = router;
