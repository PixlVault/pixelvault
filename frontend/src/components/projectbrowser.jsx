import { useState, useEffect } from 'react'
import './projectbrowser.css'

import * as Api from './../api.js'
import { Link } from 'react-router-dom';

const ProjectBrowser = ({ username, setCurrentProject, closeProjectBrowser }) => {
  const [projects, setProjects] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setProjects(await Api.fetchProjectsCreatedBy(username));
    }

    fetchProjects().catch(console.error);
  }, [username]);

  const setProject = (project) => {
    setCurrentProject(project);
    closeProjectBrowser();
  };

  return (
    <div id="overlay">
      <div align="right">
        <span id="close" onClick={closeProjectBrowser}>Close</span>
      </div>
      <h2>{username}'s Projects</h2>
      {projects != null
        ? projects.map(x =>
          <Link
            onClick={() => setProject(x)}
            to={`../edit/${x.project_id}`}
            key={x.project_id}>
              {x.title} ({x.created_on})
          </Link>)
        : <p></p>
      }
    </div>
  );
};

export default ProjectBrowser;
