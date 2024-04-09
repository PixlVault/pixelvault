const urlBase = import.meta.env.VITE_API_URL_BASE;

export const login = async (username, password) => {
  const response = await makeRequest(`${urlBase}/login`, 'post', { username, password }, null);
  if (response == null) {
    console.error('Login Failed.');
    return null;
  }

  return response.token;
};

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

  const response = await fetch(`${urlBase}/user/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password, email }),
  });

  return null;
};

// Here we make requests to do the following:
// 1. Create the new project.
// 2. Save the actual canvas state to this new project.
// 3. Fetch the actual new project object and return it.
export const createNewProject = async (title, canvasState) => {
  console.log('Creating Project.');
  const authToken = localStorage.getItem('auth');

  // TODO: This was rewritten to try and resolve another bug;
  // This should be refactored to use the generic request format again.

  const body = { title, imageData: canvasState };

  const response = await fetch(`${urlBase}/project/`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${authToken}`,
    },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    return response.json();
  }
  console.error(`Request failed: ${response.status}`);
  return null;
};

export const trySaveProject = async (projectId, canvasState) => {
  console.log('Saving Project.');
  const authToken = localStorage.getItem('auth');

  const response = makeRequest(`${urlBase}/project/${projectId}`, 'put', { projectData: { imageData: canvasState } }, authToken);
  if (response == null) {
    console.error('Saving Project Failed.');
    return false;
  }

  return true;
};

export const fetchProjectsCreatedBy = (username) => {
  const response = makeRequest(`${urlBase}/project/createdBy/${username}`, 'get', null);
  if (response == null) {
    console.error('Fetch projects created by failed.');
  }

  return response;
};

export const fetchProjectById = (projectId) => {
  const response = makeRequest(`${urlBase}/project/${projectId}`, 'get', null);
  if (response == null) {
    console.error('Fetch project by ID failed.');
  }

  return response;
};
/*
/ fetches all posts with paramaters (parameters are not required, and can be
/ left blank if all posts are needed)
*/
export const fetchPosts = (searchParams) => {
  const response = makeRequest(`${urlBase}/post/search`, 'post', searchParams);
  if (response == null) {
    console.error('Fetching posts failed.');
  }
  return response;
};

/*
/ makes a request to like the post using the post (referenced with id) and
/ the user's token stored in localStorage (see makeRequest for explanation)
*/
export const likePost = async (postID) => {
  const response = await makeRequest(`${urlBase}/post/likes`, 'post', { post_id: postID });
  if (response == null) {
    console.error('Liking post failed.');
  }
  return response;
};


export const commentOnPost = async (postID, content) => {
  const response = await makeRequest(`${urlBase}/comment`, 'post', { post_id: postID, content });
  if (response == null) {
    console.error('Commenting on post failed');
  }
  return response;
};

export const likeComment = async (commentID) => {
  const response = await makeRequest(`${urlBase}/comment/likes`, 'post', { comment_id: commentID });
  if (response == null) {
    console.error('Liking the comment failed');
  }
  return response;
};

export const postProject = (project_id) => { // TO BE CHANGED
  const authToken = localStorage.getItem('auth');
  fetch(`${urlBase}/project`, {
    method: 'POST',
    body: JSON.stringify({
      post_id: project_id,
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
      Authorization: `token ${authToken}`,
    },
  })
    .then((response) => response.json())
    .then((json) => console.log(json));
};

const makeRequest = async (url, method, body) => {
  const authToken = localStorage.getItem('auth');

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${authToken}`,
    },
    body: method == 'get' ? null : JSON.stringify(body),
  });

  if (response.ok) {
    return response.json();
  }
  console.error(`Request failed: ${response.status}`);
  return null;
};
