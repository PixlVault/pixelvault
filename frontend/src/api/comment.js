import { makeRequest } from './core';

/**
 * Get the comments that have been liked by the specified user.
 * @param {*} username The username of the user that liked the comments.
 * @returns The comments that have been liked by the specified user.
 */
export const likedBy = async (username) => {
    const response = makeRequest(`/comment/${username}/liked`, 'get');
    return response;
}
