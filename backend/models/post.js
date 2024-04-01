const { validate: isValidUuid } = require('uuid');

const { db, extractArgs } = require('../utils/database');

const Post = {
  /** Search for posts according to some criteria.
   * @param {*} author Only show results published by a specific author.
   * @param {*} licence Only show results with a certain licence.
   * @param {*} orderByField If specified, orders results by this field.
   * @param {*} ascending Boolean - should ordering be ascending or descending?
   * @param {*} onlyShowFollowed Boolean - only show publications from followed users?
   *                             Note that this requires the requestingUser field.
   * @param {*} requestingUser
   * @param {*} tags An array of tags to filter against.
   * @param {*} minCost The minimum cost item that should be returned.
   * @param {*} maxCost The maximum cost item that should be returned.
   */
  search: (
    requestingUser,
    author = undefined,
    licence = undefined,
    orderByField = 'published_on',
    ascending = true,
    onlyShowFollowed = false,
    tags = undefined,
    minCost = 0,
    maxCost = 1000000000000,
    title = undefined,
  ) => new Promise((resolve, reject) => {
    if (typeof minCost !== 'number' || typeof maxCost !== 'number') {
      reject(new Error('`cost` range must consist of numeric values'));
      return;
    }

    const params = [];
    let query = `SELECT *,
        BIN_TO_UUID(post_id, TRUE) AS post_id, project.title AS title, project.created_by AS author
      FROM post
      LEFT JOIN project ON project.project_id = post.post_id
      WHERE`;

    if (tags !== undefined) {
      query = `${query} post_id IN (SELECT post_id FROM post_tags WHERE tag IN ?) AND `;
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
      query = ` ${query} title = ? AND `;
      params.push(title);
    }

    if (licence !== undefined) {
      query = ` ${query} licence = ? AND `;
      params.push(licence);
    }

    query = ` ${query} cost BETWEEN ? AND ?`;
    params.push(minCost);
    params.push(maxCost);

    if (orderByField !== undefined) {
      if (['title', 'cost', 'published_on'].includes(orderByField)) {
        query = `${query} ORDER BY ${orderByField} ${ascending ? 'ASC' : 'DESC'};`;
      } else {
        reject(new Error(`Invalid sort field: \`${orderByField}\``));
      }
    }

    console.log(query, params);
    db.query(query, params, (err, result) => {
      if (err !== null) reject(err);
      else resolve(result);
    });
  }),

  getById: (postId) => new Promise((resolve, reject) => {
    if (postId === undefined) {
      reject(new Error('Missing field: `post_id`'));
      return;
    }

    if (!isValidUuid(postId)) {
      reject(new Error('Invalid UUID provided'));
      return;
    }

    db.query(
      `SELECT *, BIN_TO_UUID(post_id, TRUE) AS post_id, project.created_by AS author FROM post 
      LEFT JOIN project ON project.project_id = post.post_id
      WHERE post_id = UUID_TO_BIN(?, TRUE);`,
      [postId],
      (err, result) => {
        if (err !== null) reject(err);
        else resolve(result);
      },
    );
  }),

  /**
   * Publishes a project.
   * @param {*} args An object containing the values of the post.
   */
  create: (args) => new Promise((resolve, reject) => {
    if (args.post_id === undefined || !isValidUuid(args.post_id)) {
      reject(new Error('Invlid post_id value provided'));
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

    const query = `INSERT INTO post 
      (post_id${(argValuePairs.fields.length > 0 ? `, ${argValuePairs.fields.join(', ')}` : '')}) 
      VALUES (UUID_TO_BIN(?, TRUE)${argValuePairs.values.length > 0 ? `, ${argValuePairs.values.map(() => '?').join(', ')}` : ''});`;

    db.query(query, [args.post_id, ...argValuePairs.values], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  }),

  update: (postId, args) => new Promise((resolve, reject) => {
    const fields = { required: [], optional: ['licence', 'cost'] };

    if (!isValidUuid(postId)) {
      reject(new Error('Invalid UUID provided'));
      return;
    }

    let extractedArgs = null;
    try {
      extractedArgs = extractArgs(args, fields);
    } catch (e) { reject(e); return; }

    if (extractedArgs.values.length <= fields.required.length) {
      reject(new Error('Cannot execute an update action with no changes'));
      return;
    }

    const query = `UPDATE post 
      SET ${extractedArgs.fields.map((field) => `${field} = ?`).join(', ')}
      WHERE post_id = UUID_TO_BIN(?, TRUE);`;

    db.query(query, [...extractedArgs.values, postId], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  }),

  delete: (postId) => new Promise((resolve, reject) => {
    if (postId === undefined) {
      reject(new Error('Missing field: `post_id`'));
      return;
    }

    if (!isValidUuid(postId)) {
      reject(new Error('Invalid UUID provided'));
      return;
    }

    db.query(
      'DELETE FROM post WHERE post_id = UUID_TO_BIN(?, TRUE);',
      [postId],
      (err, result) => {
        if (err !== null) reject(err);
        else resolve(result);
      },
    );
  }),
};

module.exports = Post;
