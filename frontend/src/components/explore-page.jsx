import { useEffect, useState } from 'react';
import { search } from '../api/post';
import createData from '../createData';
import Listing from './listing.jsx';
import Popup from './popup.jsx';

const ExplorePage = () => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    // createData('LP').then(() => {
      search({})
        .then((result) => {console.log(result); setProjects(result)})
        .catch((error) => console.error(error));
    // });
  }, []);
  return (
    <>
    {projects.length === 0 ? <> </> : <div>
      <ul>
        {projects.map((project) => (<li key={project.project_id}>{project.title}
          {/* {<ul>
          {project.comments.map((comment) => (<li key={comment.comment_id}>
            {comment.content}{comment.likes}</li>))}
          </ul>} */}
        </li>))}
      </ul>
    </div>}
    <div>
      <div>Explore Page.</div>
      <img className="w-64 h-64 hover:cursor-pointer" src="sr25f64d3c492aws3.png" onClick={() => setPopupOpen(true)} />
      {popupOpen ?
        <Popup onClose={() => setPopupOpen(false)}>
          <Listing />
        </Popup>
        : ""
      }
    </div>
    </>
  );
};

export default ExplorePage;
//  order_by: 'likes', ascending: false
// {project.likes}
// {project.title}
// post_id: '71adbd60-f839-11ee-896c-3f74d452b3d7'