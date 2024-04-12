import { useState } from 'react';
import LZString from 'lz-string';
import Api from './api';

const likePosts = async () => {
  const users = {
    userone: {
      username: 'userone', password: 'passwordone', email: 'emailone', projects: [],
    },
    usertwo: {
      username: 'usertwo', password: 'passwordtwo', email: 'emailtwo', projects: [],
    },
    userthree: {
      username: 'userthree', password: 'passwordthree', email: 'emailthree', projects: [],
    },
  };
  // commented out code below is used for actually creating the user accounts
  // await Api.createUser(users.userone.username, users.userone.password, users.userone.email);

  // used to login in and retrieve token in order to create project
  users.userone.token = await Api.account.login(users.userone.username, users.userone.password);
  localStorage.setItem('auth', users.userone.token);
  await Api.account.followUser(users.userone.username, users.usertwo.username);

  // const obj = {
  //   data: [1, 2, 3, 4],
  //   width: 1,
  //   height: 1,
  // };

  // const compressedData = LZString.compressToBase64(JSON.stringify(obj));

  // creates project for the user which has their token set in localStorage
  // const project = await Api.project.create('test1', compressedData);

  // used to push the project's ID into the "user's storage"
  // users.userone.projects.push(project);

  // used for testing posts
  // await Api.post.create(users.userone.projects[0]);

  /*
  / below is code used for liking a post. the steps are:
  / 1. use a different users token in local storage so that another user can like a post
  / 2. call likePost which takes some project ID and uses the token in local storage
  /    for identifying which user will like the image.
  */
  // await Api.comment.addComment(users.userone.projects[0], 'Great Work!');
  // await Api.comment.likeComment(67);
  // await Api.comment.unlikeComment(67);
  // await Api.comment.hideComment(102);
  // await Api.comment.unhideComment(102);
  // await Api.comment.deleteComment(102);
};

const createComment = async () => {
  const users = {
    userone: {
      username: 'userone', password: 'passwordone', email: 'emailone', projects: [],
    },
    usertwo: {
      username: 'usertwo', password: 'passwordtwo', email: 'emailtwo', projects: [],
    },
    userthree: {
      username: 'userthree', password: 'passwordthree', email: 'emailthree', projects: [],
    },
  };
  // used to login in and retrieve token in order to create project

  users.usertwo.token = await Api.account.login(users.usertwo.username, users.usertwo.password);
  localStorage.setItem('auth', users.usertwo.token);
  await Api.post.addComment('bad50740-f33a-11ee-87e2-b3758f99a7d8', 'Great Work!');
};

const createData = async (deciding) => {
  if (deciding === 'LP') {
    await likePosts();
  }
  else if (deciding === 'CC') {
    await createComment();
  }
};
export default createData;

// 9661180-f29e-11ee-9e8d-a9ce58d85dd3
// await postUser(users.userone.username, users.userone.password, users.userone.email);
// await postUser(users.usertwo.username, users.usertwo.password, users.usertwo.email);
// users.userthree.token = await Api.login(users.userthree.username, users.userthree.password);
// users.useron.projects.forEach((u) => {})
// const project = await Api.createProject('notsooriginal', null);

// users.usertwo.token = await Api.account.login('root', 'placeholder_PibCn9sBQFA4OUfZS7jEn2vj7');