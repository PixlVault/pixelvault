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
      'SELECT *, BIN_TO_UUID(project_id, TRUE) AS project_id FROM project WHERE project_id = UUID_TO_BIN(?, TRUE);',
      [projectId],
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
   * Insert a new project into the database.
   * @param {*} title The title of the project.
   * @param {*} author The username of the author.
   * @param {string} imageData The stringified version of a canvas state.
   */
  insert: (title, author, imageData) => new Promise((resolve, reject) => {
    if (title === undefined) {
      reject(new Error('No project title provided'));
      return;
    }

    if (author === undefined) {
      reject(new Error('No project author provided'));
      return;
    }

    if (imageData === undefined || imageData === null) {
      reject(new Error('No image data provided'));
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
  setImageData: (projectId, imageData) => new Promise((resolve, reject) => {
    if (!isValidUuid(projectId)) {
      reject(new Error('Invalid UUID provided'));
      return;
    }

    db.query(
      'UPDATE project SET image_data = ? WHERE project_id = UUID_TO_BIN(?, TRUE);',
      [imageData, projectId],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      },
    );
  }),

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
      SET ${extractedArgs.fields.map((field) => `${field} = ?`).join(', ')} 
      WHERE project_id = UUID_TO_BIN(?, TRUE);`;

    db.query(query, [...extractedArgs.values, projectId], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  }),
};

module.exports = Project;
