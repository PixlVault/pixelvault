const argon2 = require('argon2');

const { db } = require('../utils/database');

const User = {
  /**
   * Look up a single user according to their username.
   * @param {*} username The username to query.
   */
  get: (username) => new Promise((resolve, reject) => {
    if (username === undefined) {
      reject(new Error('Invalid username provided'));
      return;
    }

    db.query('SELECT username, biography, experience, twitter, instagram, tiktok, youtube FROM user WHERE username = ?;', [username], (err, result) => {
      if (err) reject(err);
      else resolve(result.length === 0 ? null : JSON.parse(JSON.stringify(result[0])));
    });
  }),

  /**
   * Return a list of accounts followed by a particular user.
   * @param {string} username
   */
  getFollowing: (username) => new Promise((resolve, reject) => {
    if (username === undefined) {
      reject(new Error('Invalid username provided'));
      return;
    }

    db.query('SELECT follows FROM follow WHERE follower = ?;', [username], (err, result) => {
      if (err) reject(err);
      else {
        resolve(result.map((row) => ({ ...row }.follows)));
      }
    });
  }),

  /**
   * Set one user as following another.
   * @param {string} username The ID of the 'follower'.
   * @param {string} targetUsername The ID of the person being 'followed'.
   */
  follow: (username, targetUsername) => new Promise((resolve, reject) => {
    if (username === undefined) {
      reject(new Error('Invalid username provided for follower'));
      return;
    }

    if (targetUsername === undefined) {
      reject(new Error('Invalid username provided for followee'));
      return;
    }

    if (username === targetUsername) {
      reject(new Error('User cannot follow itself'));
      return;
    }

    db.query(
      'INSERT INTO follow (follower, follows) VALUES (?, ?);',
      [username, targetUsername],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      },
    );
  }),

  /**
   * Set one user as following another.
   * @param {string} username The ID of the 'follower'.
   * @param {string} targetUsername The ID of the person being 'followed'.
   */
  unfollow: (username, targetUsername) => new Promise((resolve, reject) => {
    if (username === undefined) {
      reject(new Error('Invalid username provided for follower'));
      return;
    }

    if (targetUsername === undefined) {
      reject(new Error('Invalid username provided for followee'));
      return;
    }

    db.query(
      'DELETE FROM follow WHERE follower = ? AND follows = ?;',
      [username, targetUsername],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      },
    );
  }),

  /**
   * Look up a single user according to their username and return all of their details.
   * Do not let any routes return this!
   * @param {string} username The username to query.
   */
  getDetails: (username) => new Promise((resolve, reject) => {
    if (username === undefined) {
      reject(new Error('Invalid username provided'));
      return;
    }

    db.query('SELECT username, password_hash, email, biography, experience, is_verified = 1 AS is_verified, is_banned = 1 AS is_banned, is_admin = 1 AS is_admin, twitter, instagram, tiktok, youtube FROM user WHERE username = ?;', [username], (err, result) => {
      if (err) reject(err);
      else resolve(result.length === 0 ? null : JSON.parse(JSON.stringify(result[0])));
    });
  }),

  /**
   * Insert a new user into the database.
   * @param {string} username The user's username.
   * @param {string} password The user's password.
   * @param {string} email The user's email address.
   */
  insert: (username, password, email) => new Promise((resolve, reject) => {
    if (username === undefined) {
      reject(new Error('No username provided'));
      return;
    }
    if (password === undefined) {
      reject(new Error('No password provided'));
      return;
    }
    if (email === undefined) {
      reject(new Error('No email provided'));
      return;
    }

    // Hash password and try to insert the new user:
    argon2.hash(password)
      .then((passwordHash) => {
        db.query(
          'INSERT INTO user (username, password_hash, email) VALUES (?, ?, ?);',
          [username, passwordHash, email],
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          },
        );
      })
      .catch((err) => {
        console.error(err);
        reject(new Error('Error in generating password hash.'));
      });
  }),
};

module.exports = User;
