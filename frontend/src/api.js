const urlBase = "http://localhost:3000";

export const login = async (username, password) => {
  const response = await makeRequest(urlBase + "/login", "post", {username: username, password: password}, null);
  if (response == null) {
    console.error("Login Failed.");
    return null;
  }

  return response.token;
}

// Here we make requests to do the following:
// 1. Create the new project.
// 2. Save the actual canvas state to this new project.
// 3. Fetch the actual new project object and return it.
export const createNewProject = async (title, canvasState) => {
  console.log("Creating Project.");
  const authToken = localStorage.getItem('auth');

  // TODO: This was rewritten to try and resolve another bug;
  // This should be refactored to use the generic request format again.
  
  const body = { title, imageData: canvasState };
  console.log('b', body);

  let response = await fetch(urlBase + "/project/", {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'token ' + authToken
    },
    body: JSON.stringify(body)
  });

  if (response.ok) {
    return response.json();
  } else {
    console.error("Request failed: " + response.status); 
    return null;
  }
}

export const trySaveProject = async (projectId, canvasState) => {
  console.log("Saving Project.");
  const authToken = localStorage.getItem('auth');

  const response = makeRequest(urlBase + "/project/" + projectId, "put", { projectData: { imageData: canvasState }}, authToken);
  if (response == null) {
    console.error("Saving Project Failed.");
    return false;
  }

  return true;
}

export const fetchProjectsCreatedBy = (username) => {
  let response = makeRequest(urlBase + "/project/createdBy/" + username, "get", null);
  if (response == null) {
   console.error("Fetch projects created by failed."); 
  }

  return response;
}

export const fetchProjectById = (projectId) => {
  let response = makeRequest(urlBase + "/project/" + projectId, "get", null);
  if (response == null) {
   console.error('Fetch project by ID failed.'); 
  }

  return response;
}

const makeRequest = async (url, method, body) => {
  const authToken = localStorage.getItem('auth');
  
  let response = await fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'token ' + authToken
    },
    body: method == "get" ? null : JSON.stringify(body)
  });

  if (response.ok) {
    return response.json(); 
  } else {
    console.error("Request failed: " + response.status); 
    return null;
  }
}

