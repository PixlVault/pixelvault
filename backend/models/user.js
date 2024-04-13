const argon2 = require('argon2');

const { db, extractArgs } = require('../utils/database');
const log = require('../utils/logger');

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

    db.query(`SELECT username, biography, experience, twitter, instagram, tiktok, youtube, (SELECT COUNT(*) FROM follow WHERE follows = ?) AS followers
      FROM user WHERE username = ?;`,
    [username, username],
    (err, result) => {
      if (err) reject(err);
      else resolve(result.length === 0 ? null : JSON.parse(JSON.stringify(result[0])));
    });
  }),

  /**
   * Delete a user from the database.
   * @param {string} username
   */
  delete: (username) => new Promise((resolve, reject) => {
    if (username === undefined) {
      reject(new Error('Invalid username provided'));
      return;
    }

    db.query('DELETE FROM user WHERE username = ?;', [username], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  }),

  ban: (username) => new Promise((resolve, reject) => {
    if (username === undefined) {
      reject(new Error('Invalid username provided'));
      return;
    }

    db.query('UPDATE user SET is_banned = 1 WHERE username = ?;', [username], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  }),

  unban: (username) => new Promise((resolve, reject) => {
    if (username === undefined) {
      reject(new Error('Invalid username provided'));
      return;
    }

    db.query('UPDATE user SET is_banned = 0 WHERE username = ?;', [username], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  }),

  /**
   * Test if a user account is banned or not.
   * @param {string} username The user to query.
   * @returns A boolean: true -> banned, false -> not banned.
   *          Note that if the user's account has been deleted from the system,
   *          this will return true.
   */
  isBanned: (username) => new Promise((resolve, reject) => {
    if (username === undefined) {
      reject(new Error('Invalid username provided'));
      return;
    }

    db.query('SELECT is_banned = 1 AS is_banned FROM user WHERE username = ?;', [username], (err, result) => {
      if (err) reject(err);
      // If the user's account is missing from the database, we should return false by default.
      else resolve(result.length === 0 || result[0].is_banned === 1);
    });
  }),

  /**
   * Updates a user's account according to values specified in `args`.
   * @param {string} username The user account to update.
   * @param {{
   *    password: string | undefined,
   *    biography: string | undefined,
   *    experience: number | undefined,
   *    twitter: string | undefined,
   *    instagram: string | undefined,
   *    tiktok: string | undefined,
   *    youtube: string | undefined,
   * }} args - Object with one or more of the described fields.
   */
  update: (username, args) => new Promise(async (resolve, reject) => {
    if (username === undefined) {
      reject(new Error('Missing required field `username'));
      return;
    }

    // If the user's submitted a new password, we need to first hash it.
    if (args.password !== undefined) {
      try {
        args.password_hash = await argon2.hash(args.password);
      } catch (err) {
        log.error(err);
        reject(new Error('Error in generating password hash.'));
      }
    }

    const fields = {
      required: [],
      optional: [
        'password_hash', 'biography', 'experience',
        'twitter', 'instagram', 'tiktok', 'youtube',
      ],
    };

    let extractedArgs = null;
    try {
      extractedArgs = extractArgs(args, fields);
    } catch (e) { reject(e); return; }

    if (extractedArgs.values.length <= fields.required.length) {
      reject(new Error('Cannot execute an update action with no changes'));
      return;
    }

    const query = `UPDATE user 
      SET ${extractedArgs.fields.map((field) => `${field} = ?`).join(', ')} 
      WHERE username = ?;`;

    db.query(query, [...extractedArgs.values, username], (err, result) => {
      if (err) reject(err);
      else resolve(result);
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
      'INSERT INTO follow (follower, follows) VALUES (?, ?) ON DUPLICATE KEY UPDATE follower=follower;',
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
    const usernameRegex = /^\w{3,32}$/;
    if (typeof username !== 'string' || !usernameRegex.test(username)) {
      reject(new Error('Invalid username provided'));
      return;
    }

    if (typeof password !== 'string' || password.length < 6) {
      reject(new Error('Invalid password provided'));
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (typeof email !== 'string' || !emailRegex.test(email)) {
      reject(new Error('Invalid email provided'));
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
        log.error(err);
        reject(new Error('Error in generating password hash.'));
      });
  }),

  promoteAdmin: (username) => new Promise((resolve, reject) => {
    if (username === undefined) {
      reject(new Error('No username provided'));
      return;
    }

    db.query('UPDATE user SET is_admin = 1 WHERE username = ?;', [username], (err, result) => {
      if (err) reject(err);
      else resolve(result.affectedRows);
    });
  }),

  demoteAdmin: (username) => new Promise((resolve, reject) => {
    if (username === undefined) {
      reject(new Error('No username provided'));
      return;
    }

    db.query('UPDATE user SET is_admin = 0 WHERE username = ?;', [username], (err, result) => {
      if (err) reject(err);
      else resolve(result.affectedRows);
    });
  }),
};

module.exports = User;
