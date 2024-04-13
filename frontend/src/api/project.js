import { makeRequest } from './core';

/**
 * Creates a new project.
 * @param {string} title The title of the project.
 * @param {string} canvasState A string representation of the canvas' state.
 * @returns The ID of the newly created project.
 */
export const create = async (title, canvasState) => {
  const response = await makeRequest('/project/', 'POST', { title, imageData: canvasState });
  return response.projectId;
};

/**
 * Attempts to update the details of a project.
 * Presently, this only allows for updating of the project's title.
 * @param {string} projectId The ID of the project.
 * @param {string} title The project's new title.
 */
export const update = async (projectId, title) => {
  if (title === undefined) throw new Error('`title` must be defined');
  if (typeof title !== 'string') throw new Error('`title` must be a string');
  await makeRequest(`/project/${projectId}`, 'PUT', { title });
};

/**
 * Attempts to fetch all projects created by the current user.
 * @returns An array of the user's projects.
 */
export const owned = async () => {
  const user = localStorage.getItem('user');
  if (user === null) throw new Error('User is not logged in.');
  const response = await makeRequest(`/project/createdBy/${user}`, 'GET');
  return response;
};

/**
 * Fetches a project's details according to its project ID.
 * @param {string} projectId The ID of the project to retrieve.
 * @returns The project's details, or null if the request failed.
 */
export const get = async (projectId) => {
  const response = await makeRequest(`/project/${projectId}`, 'GET');
  return response;
};
