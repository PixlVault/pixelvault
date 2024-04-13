import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Api from '../api';

const ProjectBrowser = ({ username, setCurrentProject, closeProjectBrowser }) => {
  const [projects, setProjects] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setProjects(await Api.project.owned());
    };

    fetchProjects().catch(console.error);
  }, [username]);

  const setProject = (project) => {
    setCurrentProject(project);
    closeProjectBrowser();
  };

  return (
    <div id="overlay" className = 'm-auto p-4'>
      <h2 className = 'font-medium text-lg'>{username}'s Projects</h2>
      <table>
        <tbody>
        {projects === null ? <></> : projects.map(x => <tr key={x.project_id}>
            <td>
              <Link
                className = "no-underline hover:underline"
                onClick={() => setProject(x)}
                to={`../edit/${x.project_id}`}>
                  {x.title} ({x.created_on})
              </Link>
            </td>
          </tr>)}
        </tbody>
      </table>
      {/* {projects != null
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
      } */}
    </div>
  );
};

export default ProjectBrowser;
