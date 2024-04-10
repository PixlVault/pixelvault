import { makeRequest, urlBase } from './core';

export const userImageBase = `${urlBase}/user/img/`;

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

export const uploadProfilePicture = async (formData) => {
  await fetch(`${urlBase}/user/upload_img`, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `token ${localStorage.getItem('auth')}`,
    },
  });
};
