const urlBase = import.meta.env.VITE_API_URL_BASE;

const hasJsonResponseType = (response) => {
  const contentType = response.headers.get('content-type');
  return contentType !== null
    ? contentType.indexOf('application/json') !== -1
    : false;
};

/**
 * Makes a request to the API.
 * @param {string} endpoint The API endpoint to query.
 * @param {string} method The HTTP verb (e.g. `'GET'`, `'POST'`, `'PUT'`, `'DELETE'`) to use.
 * @param {any} body Data to send with the request. This will be stringified prior to sending.
 * @param {boolean} auth Boolean flag indicating whether or not to send authentication
 *                       (`true` by default).
 * @returns The data returned by the API, or an error.
 */
const makeRequest = async (endpoint, method, body = undefined, auth = true) => {
  if (method === undefined) throw new Error('Request method cannot be undefined.');
  if (endpoint === undefined) throw new Error('Request endpoint cannot be undefined.');

  if (typeof endpoint !== 'string') throw new Error('Request endpoint must be a string.');
  if (typeof method !== 'string') throw new Error('Request method must be a string.');
  if (typeof auth !== 'boolean') throw new Error('Request auth must be boolean.');

  const request = { method };
  const headers = {};

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    request.body = JSON.stringify(body);
  }

  if (auth === true) {
    const token = localStorage.getItem('auth');
    if (token === null) return new Error('Authentication required, but not logged in');
    headers.Authorization = `token ${localStorage.getItem('auth')}`;
  }

  if (Object.entries(headers).length > 0) request.headers = headers;

  const url = `${urlBase}${endpoint}`;

  const response = await fetch(url, request);
  if (response.ok) {
    if (hasJsonResponseType(response)) return response.json();
    return null;
  }

  if (hasJsonResponseType(response)) {
    const json = await response.json();
    console.error(json);
    throw new Error(json.error);
  } else {
    console.error(response);
    throw new Error('Request failed');
  }
};

/**
 * Attempts to sign a user in.
 * @param {string} username
 * @param {string} password
 * @returns The token returned by the API, or null (on failure).
 */
export const login = async (username, password) => {
  const response = await makeRequest('/login', 'post', { username, password }, false);
  return response.token;
};

/**
 * Creates a new user account.
 * Has no return value, but will throw an errors upon validation failure.
 * @param {string} username
 * @param {string} password
 * @param {string} email
 */
export const createAccount = async (username, password, email) => {
  if (!username || username.length < 3) {
    throw new Error('Username must be at least 3 characters long.');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Email must be in a valid format.');
  }

  await makeRequest('/user/', 'POST', { username, password, email }, false);
};

/**
 * Creates a new project.
 * @param {string} title The title of the project.
 * @param {string} canvasState A string representation of the canvas' state.
 * @returns The ID of the newly created project.
 */
export const createProject = async (title, canvasState) => {
  const response = await makeRequest('/project/', 'POST', { title, imageData: canvasState });
  return response.projectId;
};

/**
 * Attempts to update the details of a project.
 * Presently, this only allows for updating of the project's title.
 * @param {string} projectId The ID of the project.
 * @param {string} title The project's new title.
 */
export const updateProject = async (projectId, title) => {
  if (title === undefined) throw new Error('`title` must be defined');
  if (typeof title === 'string') throw new Error('`title` must be a string');
  await makeRequest(`$/project/${projectId}`, 'PUT', { projectData: { title } });
};

/**
 * Attempts to fetch all projects created by the current user.
 * @returns An array of the user's projects.
 */
export const fetchCreatedProjects = async () => {
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
export const getProject = async (projectId) => {
  const response = await makeRequest(`/project/${projectId}`, 'GET');
  return response;
};

/**
 * Search for posts according to some filtering criteria.
 * Specifically, note that:
 * - `author` - only shows posts with this exact author.
 * - `licence` - One of `['Commercial', 'Education', 'Creative Commons']`
 * - `orderByField` must be one of `['title', 'cost', 'published_on', 'likes'].
 *   defaults to sorting by `published_on`.
 * - `ascending` is a boolean value, if `true` sorts results in ascending order, else descending.
 *   defaults to `true`.
 * - `onlyShowFollowed` is also a boolean, setting this to `true`
 *   filters to only show followed user's posts. Defaults to `false`
 * - `tags` is an array of string tags to search for. Any matches will be included.
 * - `minCost` is the minimum cost (inclusive) cost to include in results. Defaults to `0`.
 * - `maxCost` is the maximum cost (inclusive) cost to include in results.
 *   Defaults to `1000000000000`.
 * - `title` Filter to only posts with (partially) matching titles.
 * @param {{
 *   author: string
 *   licence: string
 *   orderByField: string
 *   ascending: boolean
 *   onlyShowFollowed: boolean
 *   tags: Array<string>
 *   minCost: number
 *   maxCost: number
 *   title: string
 * }} searchParams
 */
export const fetchPosts = (searchParams = undefined) => {
  const response = makeRequest('/post/search', 'POST', searchParams);
  return response;
};

/**
 * Likes a post.
 * @param {*} postId The ID of the post to like.
 */
export const likePost = async (postId) => {
  await makeRequest('/post/likes', 'post', { post_id: postId });
};

/**
 * Adds a comment to a post.
 * @param {string} postId The ID of the post.
 * @param {string} content The textual content of the comment.
 */
export const commentOnPost = async (postId, content) => {
  await makeRequest('/comment', 'post', { post_id: postId, content });
};

/**
 * Add a like to a post's comment.
 * @param {number} commentId The (integer) ID of the comment to like.
 */
export const likeComment = async (commentId) => {
  await makeRequest('/comment/likes', 'post', { comment_id: commentId });
};

// TODO: Perhaps this could be a good way to export the API's various functions?
// const Api = {
//   post: {
//     create: postProject,
//     search: fetchPosts,
//     like: likePost,
//     comment: {
//       create: commentOnPost,
//       like: likeComment,
//     },
//   },

//   project: {
//     get: getProject,
//     createdBy: fetchProjectsCreatedBy,
//     // ...
//   },
// };
