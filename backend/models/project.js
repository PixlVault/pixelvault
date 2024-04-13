const { v1: uuid, validate: isValidUuid } = require('uuid');

const { db, extractArgs } = require('../utils/database');

const Project = {
  /**
   * Look up a single project according to its project_id.
   * @param {*} projectId The ID of the project.
   */
  get: (projectId) => new Promise((resolve, reject) => {
    if (!isValidUuid(projectId)) {
      reject(new Error('Invalid Project ID provided'));
      return;
    }

    db.query(
      `SELECT *, BIN_TO_UUID(project_id, TRUE) AS project_id,
      (SELECT COUNT(*) FROM post WHERE post_id = UUID_TO_BIN(?, TRUE)) AS is_published
      FROM project
      WHERE project_id = UUID_TO_BIN(?, TRUE);`,
      [projectId, projectId],
      (err, result) => {
        if (err !== null) reject(err);
        else resolve(result.length === 0 ? null : JSON.parse(JSON.stringify(result[0])));
      },
    );
  }),

  /**
   * Look up the collaborators of a project according to its project_id.
   * @param {*} projectId The ID of the project.
   */
  collaborators: (projectId) => new Promise((resolve, reject) => {
    if (!isValidUuid(projectId)) {
      reject(new Error('Invalid Project ID provided'));
      return;
    }

    db.query(
      `SELECT created_by AS username FROM project WHERE project_id = UUID_TO_BIN(?, TRUE)
       UNION
       SELECT username FROM project_invite WHERE project_id = UUID_TO_BIN(?, TRUE) AND accepted = TRUE;`,
      [projectId, projectId],
      (err, result) => {
        if (err !== null) reject(err);
        else resolve(result.map((u) => u.username));
      },
    );
  }),

  getCreatedBy: (username) => new Promise((resolve, reject) => {
    db.query(
      'SELECT *, BIN_TO_UUID(project_id, TRUE) as project_id FROM project WHERE created_by = ?',
      [username],
      (err, result) => {
        if (err !== null) reject(err);
        else {
          const objects = result.map((r) => JSON.parse(JSON.stringify(r)));
          objects
            .filter((o) => o.image_data != null)
            .forEach((o) => {
              o.image_data.data = new TextDecoder().decode(new Uint8Array(o.image_data.data));
            });
          resolve(objects);
        }
      },
    );
  }),

  /**
   * Retrieve a list of projects a user has access to.
   * @param {string} username The username of the individual being queried.
   * @returns An array of project IDs - the user has permission to edit these.
   */
  userAccessible: (username) => new Promise((resolve, reject) => {
    if (typeof username !== 'string') {
      reject(new Error('field `username` must be of type string'));
      return;
    }

    db.query(
      `SELECT project.*, BIN_TO_UUID(project_id, TRUE) as project_id, IF(published_on > 0, 1, 0) AS is_published
      FROM project LEFT JOIN post ON project_id = post_id
      WHERE created_by = ? 
        OR project_id IN (SELECT project_id FROM project_invite WHERE username = ? AND accepted = 1);`,
      [username, username],
      (err, result) => {
        if (err !== null) reject(err);
        else resolve(result);
      },
    );
  }),

  /**
   * Insert a new project into the database.
   * @param {*} title The title of the project.
   * @param {*} author The username of the author.
   * @param {string} imageData The stringified version of a canvas state.
   */
  insert: (title, author, imageData) => new Promise((resolve, reject) => {
    if (typeof title !== 'string' || title.length === 0 || title.length > 50) {
      reject(new Error('Invalid project title provided'));
      return;
    }

    if (typeof author !== 'string') {
      reject(new Error('No project author provided'));
      return;
    }

    if (typeof imageData !== 'string' || imageData.length === 0) {
      reject(new Error('No valid image data provided'));
      return;
    }

    const id = uuid();
    db.query(
      'INSERT INTO project (project_id, title, created_by, image_data) VALUES (UUID_TO_BIN(?, TRUE), ?, ?, ?);',
      [id, title, author, imageData === null ? null : Buffer.from(imageData)],
      (err) => {
        if (err !== null) reject(err);
        else resolve({ project_id: id });
      },
    );
  }),

  /**
   * Delete a project according to its Project ID.
   * @param {*} projectId The ID of the project to delete.
   */
  delete: (projectId) => new Promise((resolve, reject) => {
    if (!isValidUuid(projectId)) {
      reject(new Error('Invalid Project ID provided'));
      return;
    }

    db.query(
      'DELETE FROM project WHERE project_id = UUID_TO_BIN(?, TRUE);',
      [projectId],
      (err, result) => {
        if (err !== null) reject(err);
        else resolve(result);
      },
    );
  }),

  /**
   * Test whether a project has been published or not.
   * @param {*} projectId The ID of the project to query.
   * @returns an object with a value of 1 if the project has been published, else 0.
   */
  isPublished: (projectId) => new Promise((resolve, reject) => {
    if (!isValidUuid(projectId)) {
      reject(new Error('Invalid Project ID provided'));
      return;
    }

    db.query(
      'SELECT COUNT(*) AS is_published FROM post WHERE post_id = UUID_TO_BIN(?, TRUE);',
      [projectId],
      (err, result) => {
        if (err !== null) reject(err);
        else resolve(result[0]);
      },
    );
  }),

  /**
   * Retrieve the raw image data for a project.
   * @param {*} projectId The ID of the project to query.
   */
  getImageData: (projectId) => new Promise((resolve, reject) => {
    if (!isValidUuid(projectId)) {
      reject(new Error('Invalid UUID provided'));
      return;
    }

    db.query(
      'SELECT image_data FROM project WHERE project_id = UUID_TO_BIN(?, TRUE);',
      [projectId],
      (err, result) => {
        if (err) reject(err);
        else resolve(result[0].image_data);
      },
    );
  }),

  /**
   * Overwrites the raw image data for a project.
   * @param {*} projectId The ID of the project to update.
   * @param {*} imageData Binary representing the new image state.
   */
  setImageData: async (projectId, imageData) => {
    if (!isValidUuid(projectId)) throw new Error('Invalid UUID provided');

    const isPublished = (await Project.isPublished(projectId)).is_published;
    if (isPublished) throw new Error('Cannot alter a published project\'s image data.');

    return new Promise((resolve, reject) => {
      db.query(
        'UPDATE project SET image_data = ?, last_modified = CURRENT_TIMESTAMP WHERE project_id = UUID_TO_BIN(?, TRUE);',
        [imageData, projectId],
        (err, result) => {
          // result.affectedRows is the number of rows matched by the query.
          // If no rows are matched, then we should raise an error - you cannot update
          // a project which does not exist.
          if (err) reject(err);
          else if (result.affectedRows === 0) reject(new Error('Project does not exist.'));
          else resolve(result);
        },
      );
    })}
  ,

  /**
   * Update the details of an existing project. If no optional parameters are
   * provided, nothing will happen.
   * @param {*} projectId The ID of the project to update.
   * @param {*} args An object containing new key-value pairs for the project's attributes.
   */
  update: (projectId, args) => new Promise((resolve, reject) => {
    const fields = { required: [], optional: ['title', 'image_data'] };

    if (!isValidUuid(projectId)) {
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

    const query = `UPDATE project 
      SET ${extractedArgs.fields.map((field) => `${field} = ?`).join(', ')}, last_modified = CURRENT_TIMESTAMP
      WHERE project_id = UUID_TO_BIN(?, TRUE);`;

    db.query(query, [...extractedArgs.values, projectId], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  }),
};

module.exports = Project;
