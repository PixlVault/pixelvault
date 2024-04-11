const { validate: isValidUuid } = require('uuid');

const { db } = require('../utils/database');

const Comment = {
  /**
   * Retrieve a comment according to its ID.
   * @param {number} commentId The ID of the comment.
   * @returns The comment, if one is found.
   */
  get: (commentId) => new Promise((resolve, reject) => {
    if (typeof commentId !== 'number') {
      reject(new Error('Missing or invalid field: `comment_id`'));
      return;
    }

    db.query('SELECT *, BIN_TO_UUID(post_id, TRUE) AS post_id, is_hidden = 1 AS is_hidden FROM comment WHERE comment_id = ?',
      commentId,
      (error, result) => {
        if (error !== null) reject(error);
        else resolve(result.length > 0 ? result[0] : null);
      },
    );
  }),

  /**
   * Add a new comment to a post.
   * @param {string} postId The UUID of the post.
   * @param {string} username The username of the comment's author.
   * @param {string} content The text content of the comment.
   */
  create: (postId, username, content) => new Promise((resolve, reject) => {
    if (typeof postId !== 'string' || !isValidUuid(postId)) {
      reject(new Error('Missing or invalid field: `post_id`'));
      return;
    }

    if (typeof username !== 'string') {
      reject(new Error('Missing or invalid field: `username`'));
      return;
    }

    if (typeof content !== 'string') {
      reject(new Error('Missing or invalid field: `content`'));
      return;
    }

    db.query(
      'INSERT INTO comment (post_id, author, content) VALUES (UUID_TO_BIN(?, TRUE), ?, ?);',
      [postId, username, content],
      (error, result) => {
        if (error !== null) reject(error);
        else resolve(result);
      },
    );
  }),

  /**
   * Deletes a comment based on its ID.
   * @param {string} commentId The ID of the comment.
   */
  delete: (commentId) => new Promise((resolve, reject) => {
    if (typeof commentId !== 'number') {
      reject(new Error('Missing or invalid field: `comment_id`'));
      return;
    }

    db.query('DELETE FROM comment WHERE comment_id = ?', [commentId], (error, result) => {
      if (error !== null) reject(error);
      else resolve(result);
    });
  }),

  /**
   * Adds a 'like' to a post from some user  (if it doesn't already exist).
   * @param {string} commentId The ID of the comment.
   * @param {string} username The username of the individual 'liking' the comment.
   */
  like: (commentId, username) => new Promise((resolve, reject) => {
    if (typeof commentId !== 'number') {
      reject(new Error('Missing or invalid field: `comment_id`'));
      return;
    }

    if (typeof username !== 'string') {
      reject(new Error('Missing or invalid field: `comment_id`'));
      return;
    }

    db.query(
      'INSERT INTO comment_likes (comment_id, username) VALUES (?, ?) ON DUPLICATE KEY UPDATE username=username;',
      [commentId, username],
      (error, result) => {
        if (error !== null) reject(error);
        else resolve(result);
      },
    );
  }),

  /**
   * Removes a 'like' from a post from some user (if it exists).
   * @param {string} commentId The ID of the comment.
   * @param {string} username The username of the individual 'liking' the comment.
   */
  unlike: (commentId, username) => new Promise((resolve, reject) => {
    if (typeof commentId !== 'number') {
      reject(new Error('Missing or invalid field: `comment_id`'));
      return;
    }

    if (typeof username !== 'string') {
      reject(new Error('Missing or invalid field: `username`'));
      return;
    }

    db.query(
      'DELETE FROM comment_likes WHERE comment_id = ? AND username = ?;',
      [commentId, username],
      (error, result) => {
        if (error !== null) reject(error);
        else resolve(result);
      },
    );
  }),

  /**
   * Hides (but does not delete) a comment based on its ID.
   * @param {string} commentId The ID of the comment.
   * @param {string} hiddenBy The username of the individual hiding the comment.
   */
  hide: (commentId, hiddenBy) => new Promise((resolve, reject) => {
    if (typeof commentId !== 'number') {
      reject(new Error('Missing or invalid field: `comment_id`'));
      return;
    }

    if (typeof hiddenBy !== 'string') {
      reject(new Error('Missing or invalid field: `hidden_by`'));
      return;
    }

    db.query(
      'UPDATE comment SET is_hidden = 1, hidden_by = ? WHERE comment_id = ?;',
      [hiddenBy, commentId],
      (err, result) => {
        if (err !== null) reject(err);
        else resolve(result);
      },
    );
  }),

  /**
   * Unhides a comment based on its ID.
   * @param {string} commentId The ID of the comment.
   */
  unhide: (commentId) => new Promise((resolve, reject) => {
    if (typeof commentId !== 'number') {
      reject(new Error('Missing or invalid field: `comment_id`'));
      return;
    }

    db.query(
      'UPDATE comment SET is_hidden = 0, hidden_by = NULL WHERE comment_id = ?;',
      [commentId],
      (err, result) => {
        if (err !== null) reject(err);
        else resolve(result);
      },
    );
  }),
};

module.exports = Comment;
