import { makeRequest, urlBase } from './core';

export const postImageBase = `${urlBase}/user/img/`;

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
export const search = (searchParams = undefined) => {
  const response = makeRequest('/post/search', 'POST', searchParams);
  return response;
};

/**
* Creates a new post.
* @param {string} projectId
*/
export const create = async (projectId) => {
  await makeRequest('/post', 'post', { post_id: projectId });
};

export const edit = async (postId, changes) => {
  await makeRequest('/post', 'put', { post_id: postId, ...changes });
}; // cost works fine, so presumably works

export const remove = async (postId) => {
  await makeRequest('/post', 'delete', { post_id: postId });
};

export const hide = async (postId) => {
  await makeRequest('/post/hide', 'post', { post_id: postId});
}; // hidden by whoever is logged in

export const unhide = async (postId) => {
  await makeRequest('/post/hide', 'delete', { post_id: postId});
};

/**
* Likes a post.
* @param {string} postId The ID of the post to like.
*/
export const like = async (postId) => {
  await makeRequest('/post/likes', 'post', { post_id: postId });
};

export const unlike = async (postId) => {
  await makeRequest('/post/likes', 'delete', { post_id: postId });
};
