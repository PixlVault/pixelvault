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

  const setTitle = async (projectId) => {
    const newTitle = prompt('Please enter a new title');
    if (projectId !== undefined && newTitle !== null) await Api.project.update(projectId, newTitle);
    setProjects(await Api.project.owned());
  };

  const remove = async (projectId) => {
    if (projectId !== undefined) await Api.project.remove(projectId);
  }

  return (
    <div id="overlay" className = 'm-auto p-4 pt-0'>
      <table className='w-full text-sm text-left rtl:text-right'>
        <thead className='text-gray-700 uppercase'>
          <tr>
            <th className='px-4'>Edit</th>
            <th className='px-4'>Title</th>
            <th className='px-4'>Last Modified</th>
            <th className='px-4'>Delete</th>
          </tr>
        </thead>
        <tbody>
        {projects === null ? <></> : projects.map(x => <tr className='space-x-4 even:bg-gray-200 border-b hover:bg-white' key={x.project_id}>
            <td className='px-4'><button onClick={() => setTitle(x.project_id)}>✏️</button></td>
            <td className='px-4'>
              <Link
                className = "no-underline hover:underline"
                onClick={() => setProject(x)}
                to={`../edit/${x.project_id}`}>
                  <p className="text-wrap break-words max-w-40">{x.title}</p>
              </Link>
            </td>
            <td className='px-4'>{(new Date(x.last_modified)).toLocaleString()}</td>
            <td className='px-4'><button onClick={() => remove(x.project_id)}>🗑️</button></td>
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
