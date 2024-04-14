import { makeRequest } from './core';

export const getProjectInvitations = async (projectId) => {
  const response = await makeRequest(`/collaboration/project/${projectId}`, 'get');
  return response;
};

export const getInvitationsToUser = async () => {
  const response = await makeRequest('/collaboration/user', 'get');
  return response;
};

export const acceptInvitation = async (projectId) => {
  await makeRequest('/collaboration/', 'put', {projectId, accepted: true});
}

export const withdrawInvitation = async (username, projectId) => {
  await makeRequest('/collaboration/', 'delete', {username, projectId});
}

export const sendInvitation = async (username, projectId) => {
  const response = await makeRequest('/collaboration/', 'post', { projectId, username });
  return response;
}
