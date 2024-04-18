const { validate: isValidUuid } = require('uuid');
const LZString = require('lz-string');

const log = require('../utils/logger');
const { db, extractArgs } = require('../utils/database');
const Project = require('./project');
const { writePostImage, deletePostImage } = require('../utils/image');

const Post = {
  /** Search for posts according to some criteria.
   * @param {string | undefined} author Only show results published by a specific author.
   * @param {string | undefined} licence Only show results with a certain licence.
   * @param {string} orderByField If specified, orders results by this field.
   *                              accepts one of ['title', 'published_on', 'likes'].
   * @param {boolean} ascending Boolean - should ordering be ascending or descending?
   * @param {boolean} onlyShowFollowed Boolean - only show publications from followed users?
   *                             Note that this requires the requestingUser field.
   * @param {string} requestingUser
   * @param {Array<string> | undefined} tags An array of tags to filter against.
   * @param {number} limit The number of results to fetch. Defaults to 25.
   * @param {number} offset The offset for returned results. Defaults to 0.
   * @param {boolean} showHidden The offset for returned results. Defaults to 0.
   */
  search: (
    requestingUser,
    author = undefined,
    licence = undefined,
    orderByField = 'published_on',
    ascending = true,
    onlyShowFollowed = false,
    tags = undefined,
    title = undefined,
    limit = 25,
    offset = 0,
    showHidden = false,
  ) => new Promise((resolve, reject) => {
    const params = [];
    let query = `SELECT *,
        BIN_TO_UUID(post_id, TRUE) AS post_id, 
        project.title AS title, 
        project.created_by AS author,
        is_hidden = 1 AS is_hidden,
        (SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id =  post.post_id) AS likes
      FROM post
      LEFT JOIN project ON project.project_id = post.post_id
      WHERE `;

    if (tags !== undefined) {
      query = `${query} post.post_id IN (SELECT post_id FROM post_tags WHERE tag IN (?)) AND `;
      params.push(tags);
    }

    if (author !== undefined) {
      query = ` ${query} project.created_by = ? AND `;
      params.push(author);
    } else if (onlyShowFollowed) {
      query = ` ${query} project.created_by IN (SELECT follows FROM follow WHERE follower = ?) AND `;
      params.push(requestingUser);
    }

    if (title !== undefined) {
      query = ` ${query} title LIKE ? AND `;
      params.push(`%${title}%`);
    }

    if (licence !== undefined) {
      query = ` ${query} licence = ? AND `;
      params.push(licence);
    }

    query = ` ${query} is_hidden = 0 ${showHidden === true ? 'OR is_hidden = 1 ' : ''}`;

    if (orderByField !== undefined) {
      if (['title', 'published_on', 'likes'].includes(orderByField)) {
        query = `${query} ORDER BY ${orderByField} ${ascending ? 'ASC' : 'DESC'}`;
      } else {
        reject(new Error(`Invalid sort field: \`${orderByField}\``));
      }
    }

    if (limit > 0) {
      if (offset > 0) {
        query = `${query} LIMIT ?, ?;`;
        params.push(offset);
      } else {
        query = `${query} LIMIT ?;`;
      }
      params.push(limit);
    }

    db.query(query, params, (err, result) => {
      if (err !== null) reject(err);
      else resolve(result);
    });
  }),

  getById: (postId, showHiddenComments) => new Promise((resolve, reject) => {
    if (postId === undefined) {
      reject(new Error('Missing field: `post_id`'));
      return;
    }

    if (!isValidUuid(postId)) {
      reject(new Error('Invalid UUID provided'));
      return;
    }

    db.query(
      `SELECT *, BIN_TO_UUID(post_id, TRUE) AS post_id, project.created_by AS author,
        is_hidden = 1 AS is_hidden,
        (SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id =  post.post_id) AS likes
      FROM post 
      LEFT JOIN project ON project.project_id = post.post_id
      WHERE post_id = UUID_TO_BIN(?, TRUE);`,
      [postId],
      (err, posts) => {
        if (err !== null) {
          reject(err);
          return;
        }

        if (posts.length === 0) {
          resolve([]);
          return;
        }

        db.query('SELECT tag FROM post_tags WHERE post_id = UUID_TO_BIN(?, TRUE)', [postId], (error, rows) => {
          if (error !== null) {
            reject(error);
            return;
          }
          posts[0].tags = rows.map((row) => row.tag);

          db.query(` SELECT comment_id,
          author,
          content,
          timestamp,
          is_hidden = 1 AS is_hidden,
          IFNULL((SELECT likes
                  FROM   (SELECT DISTINCT *
                          FROM   (SELECT comment_likes.comment_id,
                                         Count(*) AS likes
                                  FROM   comment_likes
                                  GROUP  BY comment_likes.comment_id) AS t1
                                 JOIN (SELECT post_id
                                       FROM   comment) AS t2
                                   ON comment_id
                          WHERE  post_id = UUID_TO_BIN(
                                           ?,
                                           true)) AS
                         t3
                  WHERE  comment.comment_id = t3.comment_id), 0) AS likes
   FROM   comment
   WHERE  post_id = UUID_TO_BIN(?, true) ${showHiddenComments ? '' : 'AND comment.is_hidden = 0'}`,
          [postId, postId],
          (error, comments) => {
            if (error !== null) {
              reject(error);
              return;
            }
            posts[0].comments = comments;
            resolve(posts);
          });
        });
      },
    );
  }),

  /**
   * Retrieve all posts that have been liked by the specified user.
   * @param {string} username The username of the user who liked the posts. 
   * @returns The posts that have been liked by the specified user.
   */
  getLikedBy: (username) => new Promise((resolve, reject) => {
    if (username === undefined) {
      reject(new Error('Invalid username provided'));
      return;
    }

    db.query('SELECT *, BIN_TO_UUID(post_id, TRUE) as post_id FROM post WHERE post_id IN (SELECT post_id FROM post_likes WHERE username = ?) AND is_hidden = 0;', [username], (err, result) => {
      if (err) reject(err);
      else {
        resolve(result);
      }
    });
  }),

  /**
   * Publishes a project.
   * @param {*} args An object containing the values of the post.
   */
  create: (args) => new Promise((resolve, reject) => {
    if (args.post_id === undefined || !isValidUuid(args.post_id)) {
      reject(new Error('Invalid post_id value provided'));
      return;
    }

    const fields = { required: [], optional: ['licence', 'cost'] };

    let argValuePairs = null;
    try {
      argValuePairs = extractArgs(args, fields);
    } catch (e) { reject(e); return; }

    if (!isValidUuid(args.post_id)) {
      reject(new Error('Invalid UUID provided'));
      return;
    }

    Project.getImageData(args.post_id)
      .then((data) => {
        const parsed = JSON.parse(LZString.decompressFromBase64(data.toString()));
        writePostImage(args.post_id, parsed.data, parsed.width, parsed.height);
      })
      .catch((e) => {
        log.error(e);
        reject(new Error('An error occurred in converting the project\'s data to an image.'));
      });

    const query = `INSERT INTO post 
      (post_id${(argValuePairs.fields.length > 0 ? `, ${argValuePairs.fields.join(', ')}` : '')}) 
      VALUES (UUID_TO_BIN(?, TRUE)${argValuePairs.values.length > 0 ? `, ${argValuePairs.values.map(() => '?').join(', ')}` : ''});`;

    db.query(query, [args.post_id, ...argValuePairs.values], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });

    if (args.tags !== undefined) {
      Post.setTags(args.post_id, args.tags);
    }
  }),

  /**
   * Deletes a post.
   * @param {string} postId The ID of the project to delete.
   */
  delete: (postId) => new Promise((resolve, reject) => {
    db.query('DELETE FROM post WHERE post_id = UUID_TO_BIN(?, TRUE);', [postId], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });

    deletePostImage(postId)
  }),

  setTags: (postId, tags) => new Promise((resolve, reject) => {
    if (postId === undefined) {
      reject(new Error('Missing required field: `post_id`'));
      return;
    }

    if (!isValidUuid(postId)) {
      reject(new Error('Invalid UUID provided'));
      return;
    }

    let deleteQuery = `DELETE FROM post_tags
      WHERE post_id = UUID_TO_BIN(?, TRUE)`;
    deleteQuery += tags.length > 0 ? ` AND tag NOT IN (${tags.map(() => '?').join(', ')});` : ';';

    db.query(deleteQuery, [postId, ...tags], (err) => {
      if (err) {
        reject(err);
        return;
      }

      // No tags to append, so there's no more work to do.
      if (tags.length === 0) {
        resolve(tags);
        return;
      }

      // On Duplicate syntax means tags already being present will not throw an error.
      const appendQuery = `INSERT INTO post_tags (post_id, tag) 
        VALUES ${tags.map(() => '(UUID_TO_BIN(?, TRUE), ?)').join(', ')}
        ON DUPLICATE KEY UPDATE tag=tag;`;

      db.query(appendQuery, tags.flatMap((tag) => [postId, tag]), (error) => {
        if (error) reject(error);
        else resolve(tags);
      });
    });
  }),

  update: (postId, args) => (
    /** @type {Promise<void>} */(new Promise((resolve, reject) => {
      const fields = { required: [], optional: ['licence', 'cost'] };

      if (!isValidUuid(postId)) {
        reject(new Error('Invalid UUID provided'));
        return;
      }

      let extractedArgs = null;
      try {
        extractedArgs = extractArgs(args, fields);
      } catch (e) { reject(e); return; }

      if (args.tags !== undefined) {
        Post.setTags(postId, args.tags);
      }

      if (extractedArgs.values.length <= fields.required.length) {
        if (args.tags === undefined) {
          reject(new Error('Cannot execute an update action with no changes'));
        } else {
          resolve();
        }
        return;
      }

      const query = `UPDATE post 
        SET ${extractedArgs.fields.map((field) => `${field} = ?`).join(', ')}
        WHERE post_id = UUID_TO_BIN(?, TRUE);`;

      db.query(query, [...extractedArgs.values, postId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    }))
  ),

  like: (username, postId) => /** @type {Promise<void>} */(new Promise((resolve, reject) => {
    if (username === undefined) {
      reject(new Error('Missing field: `username`'));
    }

    if (postId === undefined) {
      reject(new Error('Missing field: `post_id`'));
      return;
    }

    if (!isValidUuid(postId)) {
      reject(new Error('Invalid UUID provided'));
      return;
    }

    const query = 'INSERT INTO post_likes (post_id, username) VALUES (UUID_TO_BIN(?, TRUE), ?) ON DUPLICATE KEY UPDATE username=username;';
    db.query(query, [postId, username], (err) => {
      if (err !== null) reject(err);
      else resolve();
    });
  })),

  unlike: (username, postId) => /** @type {Promise<void>} */(new Promise((resolve, reject) => {
    if (username === undefined) {
      reject(new Error('Missing field: `username`'));
    }

    if (postId === undefined) {
      reject(new Error('Missing field: `post_id`'));
    }

    if (!isValidUuid(postId)) {
      reject(new Error('Invalid UUID provided'));
      return;
    }

    const query = 'DELETE FROM post_likes WHERE post_id = UUID_TO_BIN(?, TRUE) AND username = ?;';
    db.query(query, [postId, username], (err) => {
      if (err !== null) reject(err);
      else resolve();
    });
  })),

  hide: (postId, hiddenBy) => new Promise((resolve, reject) => {
    if (postId === undefined) {
      reject(new Error('Missing field: `post_id`'));
      return;
    }

    if (!isValidUuid(postId)) {
      reject(new Error('Invalid UUID provided'));
      return;
    }

    if (hiddenBy === undefined) {
      reject(new Error('Missing field: `hidden_by`'));
      return;
    }

    db.query(
      'UPDATE post SET is_hidden = 1, hidden_by = ? WHERE post_id = UUID_TO_BIN(?, TRUE);',
      [hiddenBy, postId],
      (err, result) => {
        if (err !== null) reject(err);
        else resolve(result);
      },
    );
  }),

  unhide: (postId) => new Promise((resolve, reject) => {
    if (postId === undefined) {
      reject(new Error('Missing field: `post_id`'));
      return;
    }

    if (!isValidUuid(postId)) {
      reject(new Error('Invalid UUID provided'));
      return;
    }

    db.query(
      'UPDATE post SET is_hidden = 0, hidden_by = NULL WHERE post_id = UUID_TO_BIN(?, TRUE);',
      [postId],
      (err, result) => {
        if (err !== null) reject(err);
        else resolve(result);
      },
    );
  }),

  /**
   * Retrieve the comments attached to a post.
   * @param {string} postId The UUID of the post.
   * @returns An array of comments associated with the post.
   */
  comments: (postId) => new Promise((resolve, reject) => {
    if (typeof postId !== 'string' || !isValidUuid(postId)) {
      reject(new Error('Missing or invalid field: `post_id`'));
      return;
    }

    db.query('SELECT * from comment WHERE post_id = ?', postId, (error, result) => {
      if (error !== null) reject(error);
      else resolve(result);
    });
  }),
};

module.exports = Post;
