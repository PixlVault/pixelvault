import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import Api from '../api';

const ProjectBrowser = ({ username, currentProject, setCurrentProject, closeProjectBrowser }) => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      setProjects(await Api.project.accessible());
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
    const proceed = confirm('Are you sure you want to delete this project?');
    if (proceed && projectId !== undefined) {
      await Api.project.remove(projectId);
      toast.success('Successfully deleted!');
      if (projectId === currentProject.project_id) navigate('../edit');
      setProjects(projects.filter((project) => project.project_id !== projectId));
    }
  };

  return (
    <div id="overlay" className = 'm-auto p-4 pt-0'>
      <table className='w-full text-sm text-left rtl:text-right'>
        <thead className='text-gray-700 uppercase'>
          <tr>
            <th className='px-4'></th>
            <th className='px-4'>Title</th>
            <th className='px-4'>Last Modified</th>
            <th className='px-4'>Published</th>
            <th className='px-4'></th>
          </tr>
        </thead>
        <tbody>
        {
        projects === null
          ? <></> 
          : projects.map(x => <tr className='rounded space-x-4 even:bg-gray-50 border-b hover:bg-indigo-100 transition-colors duration-200' key={x.project_id}>
              <td><button className='px-4 transition-all duration-200 bg-transparent' onClick={() => setTitle(x.project_id)}>✏️</button></td>
              <td className='px-4'>
                {
                  x.is_published === 0
                    ? <Link
                        className = "no-underline hover:underline"
                        onClick={() => setProject(x)}
                        to={`../edit/${x.project_id}`}>
                          <p className="text-wrap break-words max-w-40">{x.title}</p>
                      </Link>
                    : <p className="text-wrap break-words max-w-40">{x.title}</p>
                }
              </td>
              <td className='px-4'>{(new Date(x.last_modified)).toLocaleString()}</td>
              <td className='px-4 text-center'><input id = "termsCheck" type="checkbox" disabled name="terms" checked={x.is_published === 1} /></td>
              <td><button onClick={() => remove(x.project_id)} className='px-4 transition-all duration-200 bg-transparent hover:bg-red-600'>🗑️</button></td>
            </tr>)
        }
        </tbody>
      </table>
    </div>
  );
};

export default ProjectBrowser;
