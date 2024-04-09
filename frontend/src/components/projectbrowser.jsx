import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import * as Api from './../api.js'

const ProjectBrowser = ({ username, setCurrentProject, closeProjectBrowser }) => {
  const [projects, setProjects] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setProjects(await Api.fetchCreatedProjects(username));
    };

    fetchProjects().catch(console.error);
  }, [username]);

  const setProject = (project) => {
    setCurrentProject(project);
    closeProjectBrowser();
  };

  return (
    <div id="overlay" className = 'rounded bg-slate-100 backdrop-blur-sm z-10 inset-x-0 inset-y-0 fixed w-1/4 h-1/2 m-auto p-4'>
      <div align="right">
        <span id="close" className='cursor-pointer' onClick={closeProjectBrowser}>Close</span>
      </div>
      <h2 className = 'font-medium text-lg'>{username}'s Projects</h2>
      {projects != null
        ? <ul>
          {projects.map(x => <li key={x.project_id}>
            <Link
              className = "no-underline hover:underline"
              onClick={() => setProject(x)}
              to={`../edit/${x.project_id}`}>
                {x.title} ({x.created_on})
            </Link>
          </li>)}
        </ul>
        : <p></p>
      }
    </div>
  );
};

export default ProjectBrowser;
