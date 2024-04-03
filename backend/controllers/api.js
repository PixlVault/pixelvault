const express = require('express');

const userRouter = require('./user');
const loginRouter = require('./login');
const projectRouter = require('./project');
const collaborationRouter = require('./collaboration');
const postRouter = require('./post');
const commentRouter = require('./comment');
const transactionRouter = require('./transaction');

const router = express.Router();

router.use('/user', userRouter);
router.use('/login', loginRouter);
router.use('/project', projectRouter);
router.use('/collaboration', collaborationRouter);
router.use('/post', postRouter);
router.use('/comment', commentRouter);
router.use('/transaction', transactionRouter);

module.exports = router;
