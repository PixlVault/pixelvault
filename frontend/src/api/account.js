import { makeRequest, urlBase } from './core';

export const userImageBase = `${urlBase}/user/img/`;
export const defaultImageUrl = `${urlBase}/img/user-default.png`;

/**
 * Attempts to sign a user in.
 * @param {string} username
 * @param {string} password
 * @returns The token returned by the API, or null (on failure).
 */
export const login = async (username, password) => (
  makeRequest('/login', 'POST', { username, password }, false)
);

export const follow = async (follower, followee) => (
  makeRequest(`/user/${follower}/following`, 'POST', { followee })
);

export const unfollow = async (follower, followee) => (
  makeRequest(`/user/${follower}/following`, 'DELETE', { followee })
);

export const remove = async (username) => {
  await makeRequest('/user', 'delete', { username });
}; // TEST

/**
 * Bans a user according to their username.
 * @param {string} username The username of the user being banned.
 */
export const ban = async (username) => makeRequest('/ban', 'POST', { username });

/**
 * Unbans a user according to their username.
 * @param {string} username The username of the user being banned.
 */
export const unban = async (username) => makeRequest('/ban', 'DELETE', { username });

/**
 * Updates the details of a user.
 * @param {string} username The username of the user.
 * @param {object} updates An object (i.e. key-value pairs) of the fields to be
 *                         updated, and their new values.
 */
export const update = async (username, updates) => makeRequest('/user', 'PUT', { username, ...updates });

/**
 * Retrieve the details of a user.
 * @param {string} username The user to look up.
 * @returns The details of the user, if successful, else an error.
 */
export const get = async (username) => {
  if (typeof username !== 'string') return new Error('username must be a string.');
  return makeRequest(`/user/${username}`, 'GET');
};

/**
 * Retrieve the details of a user.
 * @param {string} username The user to look up.
 * @returns The details of the user, if successful, else an error.
 */
export const following = async (username) => makeRequest(`/user/${username}/following`, 'GET', undefined, false);

/**
 * Creates a new user account.
 * Has no return value, but will throw an errors upon validation failure.
 * @param {string} username
 * @param {string} password
 * @param {string} email
 */
export const create = async (username, password, email) => {
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

export const uploadProfilePicture = async (formData, username) => {
  const res = await fetch(`${urlBase}/user/upload_img/${username}`, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `token ${localStorage.getItem('auth')}`,
    },
  });
  return res.ok;
};
