const { validate: isValidUuid } = require('uuid');

const { db } = require('../utils/database');

const Transaction = {
  /**
   * Add a new transaction to the database.
   * @param {string} postId The UUID of the post involved.
   * @param {string} username The username of the user who has purchased the item.
   * @param {string} status The status of the transaction - one of 'complete',
   *                        'pending', or 'refunded'.
   */
  create: (postId, username, status) => new Promise((resolve, reject) => {
    if (typeof postId !== 'string' || !isValidUuid(postId)) {
      reject(new Error('Missing or invalid field: `post_id`'));
      return;
    }

    if (typeof username !== 'string') {
      reject(new Error('Missing or invalid field: `username`'));
      return;
    }

    if (typeof status !== 'string' || !['complete', 'pending', 'refunded'].includes(status)) {
      reject(new Error('Missing or invalid field: `status`'));
      return;
    }

    db.query(
      'INSERT INTO transaction (post_id, username, status) VALUES (UUID_TO_BIN(?, TRUE), ?, ?);',
      [postId, username, status],
      (error, result) => {
        if (error !== null) reject(error);
        else resolve(result);
      },
    );
  }),

  /**
   * Updates the status of an existing transaction.
   * @param {number} transactionId The ID of the transaction to update.
   * @param {string} status The status of the transaction - one of 'complete',
   *                        'pending', or 'refunded'.
   */
  setStatus: (transactionId, status) => new Promise((resolve, reject) => {
    if (typeof transactionId !== 'number') {
      reject(new Error('Missing or invalid field: `transaction_id`'));
      return;
    }

    if (typeof status !== 'string' || !['complete', 'pending', 'refunded'].includes(status)) {
      reject(new Error('Missing or invalid field: `status`'));
      return;
    }

    db.query(
      'UPDATE transaction SET status = ? WHERE transaction_id = ?;',
      [status, transactionId],
      (error, result) => {
        if (error !== null) reject(error);
        else resolve(result);
      },
    );
  }),

  /**
   * Retrieve all transactions relating to a user.
   * @param {string} username THe username of the user involved.
   */
  getByUser: (username) => new Promise((resolve, reject) => {
    if (typeof username !== 'string') {
      reject(new Error('Missing or invalid field: `username`'));
      return;
    }

    db.query('SELECT *, BIN_TO_UUID(post_id, TRUE) AS post_id FROM transaction WHERE username = ?;', username, (error, result) => {
      if (error !== null) reject(error);
      else resolve(result);
    });
  }),

  /**
   * Retrieve all transactions relating to a post.
   * @param {string} postId The UUID of the post involved.
   */
  getByPost: (postId) => new Promise((resolve, reject) => {
    if (typeof postId !== 'string' || !isValidUuid(postId)) {
      reject(new Error('Missing or invalid field: `post_id`'));
      return;
    }

    db.query('SELECT *, BIN_TO_UUID(post_id, TRUE) AS post_id FROM transaction WHERE post_id = UUID_TO_BIN(?, TRUE);', postId, (error, result) => {
      if (error !== null) reject(error);
      else resolve(result);
    });
  }),
};

module.exports = Transaction;
