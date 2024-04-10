export const urlBase = import.meta.env.VITE_API_URL_BASE;

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

export default makeRequest;
