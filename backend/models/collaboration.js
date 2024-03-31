const { validate: isValidUuid } = require('uuid');

const { db } = require('../utils/database');

const formatCollaboration = (rowDataPackets) => rowDataPackets.map(
  (row) => ({ ...row, accepted: row.accepted === 1 }),
);

const Collaboration = {
  /**
   * Retrieve all invitations associated with a project.
   * @param projectId The ID of the project.
   */
  projectInvitations: (projectId) => new Promise((resolve, reject) => {
    if (!isValidUuid(projectId)) {
      reject(new Error('Invalid project ID provided'));
      return;
    }

    db.query(
      'SELECT *, accepted = 1 AS accepted, BIN_TO_UUID(project_id, TRUE) AS project_id FROM project_invite WHERE project_id = UUID_TO_BIN(?, TRUE);',
      [projectId],
      (err, result) => {
        if (err !== null) reject(err);
        else resolve(formatCollaboration(result));
      },
    );
  }),

  /**
   * Retrieve all invitations received by a user.
   * @param username The username of the user.
   */
  userInvitations: (username) => new Promise((resolve, reject) => {
    if (username === undefined) {
      reject(new Error('Username must be provided'));
      return;
    }

    db.query(
      'SELECT *, accepted = 1 AS accepted, BIN_TO_UUID(project_id, TRUE) as project_id FROM project_invite WHERE username = ?;',
      [username],
      (err, result) => {
        if (err !== null) reject(err);
        else resolve(formatCollaboration(result));
      },
    );
  }),

  /**
   Invite a user to an existing project.
   @param username The username of the user to invite.
   @param projectId The ID of the project they will be invited to.
   */
  invite: (username, projectId) => new Promise((resolve, reject) => {
    if (username === undefined) {
      reject(new Error('Username must be provided'));
      return;
    }

    if (!isValidUuid(projectId)) {
      reject(new Error('Invalid project ID provided'));
      return;
    }

    db.query(
      'INSERT INTO project_invite (username, project_id) VALUES (?, UUID_TO_BIN(?, TRUE));',
      [username, projectId],
      (err, result) => {
        if (err !== null) {
          if (err.sqlMessage.endsWith('`user` (`username`) ON DELETE CASCADE)')) {
            reject(new Error('User does not exist'));
          } else {
            reject(err);
          }
        }
        else resolve(result);
      },
    );
  }),

  /**
   Revoke a user's invitation - or access - to a project.
   @param username The username of the user to invite.
   @param projectId The ID of the project they will be removed from.
   */
  uninvite: (username, projectId) => new Promise((resolve, reject) => {
    if (username === undefined) {
      reject(new Error('Username must be provided'));
      return;
    }

    if (!isValidUuid(projectId)) {
      reject(new Error('Invalid project ID provided'));
      return;
    }

    db.query(
      'DELETE FROM project_invite WHERE username = ? AND project_id = UUID_TO_BIN(?, TRUE);',
      [username, projectId],
      (err, result) => {
        if (err !== null) reject(err);
        else resolve(result);
      },
    );
  }),

  /**
   Accept an invitation to a project.
   @param username The username of the user.
   @param projectId The ID of the project they wish to join.
   */
  accept: (username, projectId) => new Promise((resolve, reject) => {
    if (username === undefined) {
      reject(new Error('Username must be provided'));
      return;
    }

    if (!isValidUuid(projectId)) {
      reject(new Error('Invalid project ID provided'));
      return;
    }

    db.query(
      `UPDATE project_invite
       SET accepted = 1, last_modified=CURRENT_TIMESTAMP()
       WHERE username = ? AND project_id = UUID_TO_BIN(?, TRUE);`,
      [username, projectId],
      (err, result) => {
        if (err !== null) reject(err);
        else resolve(result);
      },
    );
  }),

  /**
   Decline an invitation to a project.
   @param username The username of the user.
   @param projectId The ID of the project they do not wish to join.
   */
  decline: this.uninvite,

  /**
   Leaves a project.
   @param username The username of the user.
   @param projectId The ID of the project they do not wish to join.
   */
  leave: this.uninvite,
};

module.exports = Collaboration;
