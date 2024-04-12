import { makeRequest } from './core';

/**
* Adds a comment to a post.
* @param {string} postId The ID of the post.
* @param {string} content The textual content of the comment.
*/
export const addComment = async (postId, content) => {
  await makeRequest('/comment', 'post', { post_id: postId, content });
};

/**
 * Add a like to a post's comment.
 * @param {number} commentId The (integer) ID of the comment to like.
 */
export const likeComment = async (commentId) => {
  await makeRequest('/comment/like', 'post', { comment_id: commentId });
};

export const unlikeComment = async (commentId) => {
  await makeRequest('/comment/like', 'delete', { comment_id: commentId });
};

export const hideComment = async (commentId) => {
  await makeRequest('/comment/hide', 'post', { comment_id: commentId});
};

export const unhideComment = async (commentId) => {
  await makeRequest('/comment/hide', 'delete', { comment_id: commentId});
};

export const deleteComment = async (commentId) => {
  await makeRequest('/comment', 'delete', { comment_id: commentId});
};

/**
 * Get the comments that have been liked by the specified user.
 * @param {*} username The username of the user that liked the comments.
 * @returns The comments that have been liked by the specified user.
 */
export const likedBy = async (username) => {
    const response = makeRequest(`/comment/${username}/liked`, 'get');
    return response;
}
