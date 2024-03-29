const argon2 = require('argon2');

const db = require('../utils/database');

const User = {
  /**
   * Look up a single user according to their username.
   * @param {*} username The username to query.
   */
  get: (username) => new Promise((resolve, reject) => {
    if (username === undefined) { return reject('Invalid username provided'); }

    db.query('SELECT username, biography, experience, twitter, instagram, tiktok, youtube FROM user WHERE username = ?;', [username], (err, result) => {
      if (err) { reject(err); }
      else { resolve(result.length === 0 ? null : JSON.parse(JSON.stringify(result[0]))); }
    });
  }),

  /**
   * Get a list of usernames followed by one user.
   */
  getFollowing: (userId) => {
    throw new Error('TODO');
  },

  /**
   * Set one user as following another.
   * @param userId The ID of the 'follower'.
   * @param targetId The ID of the person being 'followed'.
   */
  follow: (userId, targetId) => {
    throw new Error('TODO');
  },

  /**
   * Set one user as following another.
   * @param userId The ID of the 'follower'.
   * @param targetId The ID of the person being 'followed'.
   */
  unfollow: (userId, targetId) => {
    throw new Error('TODO');
  },

  /**
   * Look up a single user according to their username and return all of their details.
   * Do not let any routes return this!
   * @param {*} username The username to query.
   */
  getDetails: (username) => new Promise((resolve, reject) => {
    if (username === undefined) { return reject('Invalid username provided'); }
    db.query('SELECT username, password_hash, email, biography, experience, is_verified = 1 AS is_verified, is_banned = 1 AS is_banned, is_admin = 1 AS is_admin, twitter, instagram, tiktok, youtube FROM user WHERE username = ?;', [username], (err, result) => {
      if (err) { reject(err); }
      else { resolve(result.length === 0 ? null : JSON.parse(JSON.stringify(result[0]))); }
    });
  }),

  /**
   * Insert a new user into the database.
   * @param {*} username The user's username.
   * @param {*} passwordHash The hashed form of their password.
   * @param {*} email The user's email address.
   */
  insert: (username, password, email) => new Promise(async (resolve, reject) => {
    if (username === undefined) { return reject('No username provided'); }
    if (password === undefined) { return reject('No password provided'); }
    if (email === undefined) { return reject('No email provided'); }

    // Hash password and try to insert the new user:
    const passwordHash = await argon2.hash(password);

    db.query('INSERT INTO user (username, password_hash, email) VALUES (?, ?, ?);', [username, passwordHash, email], (err, result) => {
      if (err) { reject(err); }
      else { resolve(result); }
    });
  }),
};

module.exports = User;