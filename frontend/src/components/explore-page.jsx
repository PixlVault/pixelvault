import { useEffect, useState } from 'react';
import { fetchProjectsCreatedBy, fetchPosts } from "../api";
import createData from '../createData';

const ExplorePage = () => {
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    fetchPosts({ order_by: 'likes', ascending: false, post_id: 'bad50740-f33a-11ee-87e2-b3758f99a7d8' })
      .then((result) => {console.log(result); setProjects(result)})
      .catch((error) => console.error(error));
    createData('CC'); 
  }, []);
  return (
    <>
    {projects.length === 0 ? <> </> : <div>
      <ul>
        {projects.map((project) => (<li key={project.project_id}>{project.title}
          {<ul>
          {project.comments.map((comment) => (<li key={comment.comment_id}>
            {comment.comment_id}{comment.content}</li>))}
          </ul>}
        </li>))}
      </ul>
    </div>}
    </>
  );
};

export default ExplorePage;

// bad50740-f33a-11ee-87e2-b3758f99a7d8
// {projects.comments.map((comment) => (<li>{comment.content}<li/>))}
// (likes {project.likes})
