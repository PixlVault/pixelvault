import { makeRequest } from './core';

export const likedBy = async (username) => {
    const response = makeRequest(`/comment/${username}/liked`, 'get');
    return response;
}
